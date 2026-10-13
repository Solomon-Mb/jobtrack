const request = require("supertest");
const { app, pool } = require("./helpers");

afterAll(async () => {
    await pool.end();
});

describe("error handling", () => {
    test("health check responds", async () => {
        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
    });

    test("unknown routes return a JSON 404", async () => {
        const response = await request(app).get("/api/nothing");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Route not found: GET /api/nothing");
    });

    test("malformed JSON returns a 400", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .set("Content-Type", "application/json")
            .send("{bad json");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid JSON in request body");
    });
});
