const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function init() {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

    try {
        await pool.query(sql);
        console.log("Database schema is ready.");
    } catch (error) {
        console.error("Could not set up the database:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

init();
