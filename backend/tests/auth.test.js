const request = require("supertest");
const { app, pool, PASSWORD, resetDatabase, registerAndLogin } = require("./helpers");

beforeEach(resetDatabase);

afterAll(async () => {
    await pool.end();
});

describe("POST /api/auth/register", () => {
    test("creates a user and never returns the password", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({ name: "Ann", email: "Ann@Example.com", password: PASSWORD });

        expect(response.status).toBe(201);
        expect(response.body.email).toBe("ann@example.com");
        expect(response.body.password).toBeUndefined();
        expect(response.body.password_hash).toBeUndefined();
    });

    test("rejects a duplicate email, ignoring case", async () => {
        await registerAndLogin("dup@example.com");

        const response = await request(app)
            .post("/api/auth/register")
            .send({ name: "Other", email: "DUP@example.com", password: PASSWORD });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Email is already registered");
    });

    test("rejects a password shorter than 8 characters", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({ name: "Ann", email: "short@example.com", password: "123" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Password must be at least 8 characters");
    });

    test("rejects an invalid email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({ name: "Ann", email: "notanemail", password: PASSWORD });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("A valid email is required");
    });
});

describe("POST /api/auth/login", () => {
    test("returns a token and the user for correct credentials", async () => {
        await registerAndLogin("login@example.com");

        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "login@example.com", password: PASSWORD });

        expect(response.status).toBe(200);
        expect(response.body.token.split(".")).toHaveLength(3);
        expect(response.body.user.email).toBe("login@example.com");
    });

    test("gives the same 401 for a wrong password and an unknown email", async () => {
        await registerAndLogin("known@example.com");

        const wrongPassword = await request(app)
            .post("/api/auth/login")
            .send({ email: "known@example.com", password: "wrong-password" });

        const unknownEmail = await request(app)
            .post("/api/auth/login")
            .send({ email: "nobody@example.com", password: PASSWORD });

        expect(wrongPassword.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(wrongPassword.body).toEqual(unknownEmail.body);
    });
});

describe("GET /api/auth/me", () => {
    test("rejects a request without a token", async () => {
        const response = await request(app).get("/api/auth/me");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Authentication required");
    });

    test("returns the user for a valid token", async () => {
        const token = await registerAndLogin("me@example.com");

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe("me@example.com");
    });

    test("rejects a tampered token", async () => {
        const token = await registerAndLogin("tamper@example.com");

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer " + token + "x");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Invalid or expired token");
    });
});
