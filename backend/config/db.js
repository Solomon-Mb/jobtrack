require("dotenv").config({ quiet: true });
const { Pool, types } = require("pg");

// Return DATE columns as plain "YYYY-MM-DD" strings (not JavaScript Date objects)
types.setTypeParser(1082, function (value) {
    return value;
});

// Hosted databases (Neon) give one DATABASE_URL and require SSL.
// Locally we use the separate DB_* variables from .env.
const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: true }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };

const pool = new Pool(config);

module.exports = pool;
