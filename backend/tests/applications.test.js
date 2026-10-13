const request = require("supertest");
const { app, pool, resetDatabase, registerAndLogin } = require("./helpers");

const sample = {
    company: "Google",
    position: "Software Intern",
    status: "Applied",
    date: "2026-10-11"
};

let token;

beforeEach(async () => {
    await resetDatabase();
    token = await registerAndLogin("owner@example.com");
});

afterAll(async () => {
    await pool.end();
});

// Builds a request that carries a login token (the owner's by default)
function api(method, url, userToken) {
    return request(app)[method](url).set("Authorization", "Bearer " + (userToken || token));
}

describe("applications API", () => {
    test("requires a token", async () => {
        const response = await request(app).get("/api/applications");

        expect(response.status).toBe(401);
    });

    test("creates an application owned by the logged-in user", async () => {
        const response = await api("post", "/api/applications").send(sample);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.company).toBe("Google");
        expect(response.body.date).toBe("2026-10-11");
        expect(response.body.interviewDate).toBe("");
    });

    test("lists the user's applications", async () => {
        await api("post", "/api/applications").send(sample);

        const response = await api("get", "/api/applications");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].company).toBe("Google");
    });

    test.each([
        ["Company is required", { ...sample, company: "" }],
        ["Status must be one of: Applied, Interview, Offer, Rejected", { ...sample, status: "Maybe" }],
        ["Date must be in YYYY-MM-DD format", { ...sample, date: "tomorrow" }]
    ])("rejects invalid data: %s", async (message, body) => {
        const response = await api("post", "/api/applications").send(body);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(message);
    });

    test("rejects a date that does not exist", async () => {
        const response = await api("post", "/api/applications").send({ ...sample, date: "2026-13-45" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid data in request");
    });

    test("updates an application", async () => {
        const created = await api("post", "/api/applications").send(sample);

        const response = await api("put", "/api/applications/" + created.body.id)
            .send({ ...sample, status: "Interview", interviewDate: "2026-10-20" });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Interview");
        expect(response.body.interviewDate).toBe("2026-10-20");
    });

    test("clears the interview date", async () => {
        const created = await api("post", "/api/applications")
            .send({ ...sample, interviewDate: "2026-10-20" });

        const response = await api("put", "/api/applications/" + created.body.id)
            .send({ ...sample, interviewDate: "" });

        expect(response.status).toBe(200);
        expect(response.body.interviewDate).toBe("");
    });

    test("deletes an application", async () => {
        const created = await api("post", "/api/applications").send(sample);
        const url = "/api/applications/" + created.body.id;

        const deleted = await api("delete", url);
        const afterwards = await api("get", url);

        expect(deleted.status).toBe(204);
        expect(afterwards.status).toBe(404);
    });

    test("returns 404 for an id that is not a number", async () => {
        const response = await api("get", "/api/applications/abc");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Application not found");
    });

    test("keeps each user's applications private", async () => {
        const created = await api("post", "/api/applications").send(sample);
        const url = "/api/applications/" + created.body.id;
        const otherToken = await registerAndLogin("other@example.com");

        const list = await api("get", "/api/applications", otherToken);
        const read = await api("get", url, otherToken);
        const update = await api("put", url, otherToken).send(sample);
        const remove = await api("delete", url, otherToken);
        const ownerList = await api("get", "/api/applications");

        expect(list.body).toEqual([]);
        expect(read.status).toBe(404);
        expect(update.status).toBe(404);
        expect(remove.status).toBe(404);
        expect(ownerList.body).toHaveLength(1);
    });
});
