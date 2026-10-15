const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

const PASSWORD = "Passw0rd123";

// Empties both tables and restarts the id counters
async function resetDatabase() {
    if (process.env.DB_NAME !== "jobtrack_test" || process.env.DATABASE_URL) {
        throw new Error("Refusing to reset anything except the local jobtrack_test database");
    }

    await pool.query("TRUNCATE users, applications RESTART IDENTITY CASCADE");
}

// Registers a user, logs in, and returns the token
async function registerAndLogin(email) {
    await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: email, password: PASSWORD });

    const response = await request(app)
        .post("/api/auth/login")
        .send({ email: email, password: PASSWORD });

    return response.body.token;
}

module.exports = { app, pool, PASSWORD, resetDatabase, registerAndLogin };
