const express = require("express");
const request = require("supertest");
const { createAuthLimiter } = require("../middleware/rateLimit");

test("blocks a client after too many attempts", async () => {
    const app = express();

    app.use(createAuthLimiter(3));
    app.get("/", (req, res) => res.json({ ok: true }));

    for (let i = 0; i < 3; i++) {
        const allowed = await request(app).get("/");
        expect(allowed.status).toBe(200);
    }

    const blocked = await request(app).get("/");

    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/Too many attempts/);
});
