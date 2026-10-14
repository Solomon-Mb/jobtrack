const request = require("supertest");
const { app, pool } = require("./helpers");

afterAll(async () => {
    await pool.end();
});

test("serves the frontend page at /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.text).toContain("JobTrack");
});
