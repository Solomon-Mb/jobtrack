const request = require("supertest");
const { app, pool } = require("./helpers");

afterAll(async () => {
    await pool.end();
});

test("sends security headers", async () => {
    const response = await request(app).get("/");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toContain("script-src-attr 'unsafe-inline'");
    expect(response.headers["x-powered-by"]).toBeUndefined();
});
