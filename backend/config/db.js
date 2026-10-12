require("dotenv").config();
const { Pool, types } = require("pg");

// Return DATE columns as plain "YYYY-MM-DD" strings (not JavaScript Date objects)
types.setTypeParser(1082, function (value) {
    return value;
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

module.exports = pool;
