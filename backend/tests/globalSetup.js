require("./setupEnv");

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

// Runs once before all tests: makes sure the test database has the tables
module.exports = async function () {
    const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");

    await pool.query(sql);
    await pool.end();
};
