const pool = require("../config/db");

// The database uses snake_case names; the API uses the names the frontend expects.
const COLUMNS = `
    id,
    company,
    position,
    status,
    applied_date AS "date",
    COALESCE(interview_date::text, '') AS "interviewDate",
    website,
    location,
    notes
`;

async function getAll(userId) {
    const result = await pool.query(
        `SELECT ${COLUMNS} FROM applications WHERE user_id = $1 ORDER BY id`,
        [userId]
    );
    return result.rows;
}

async function getById(id, userId) {
    const result = await pool.query(
        `SELECT ${COLUMNS} FROM applications WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return result.rows[0];
}

async function create(userId, data) {
    const result = await pool.query(
        `INSERT INTO applications
            (user_id, company, position, status, applied_date, interview_date, website, location, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING ${COLUMNS}`,
        [
            userId,
            data.company,
            data.position,
            data.status,
            data.date,
            data.interviewDate || null,
            data.website,
            data.location,
            data.notes
        ]
    );
    return result.rows[0];
}

async function update(id, userId, data) {
    const result = await pool.query(
        `UPDATE applications
         SET company = $1, position = $2, status = $3, applied_date = $4,
             interview_date = $5, website = $6, location = $7, notes = $8
         WHERE id = $9 AND user_id = $10
         RETURNING ${COLUMNS}`,
        [
            data.company,
            data.position,
            data.status,
            data.date,
            data.interviewDate || null,
            data.website,
            data.location,
            data.notes,
            id,
            userId
        ]
    );
    return result.rows[0] || null;
}

async function remove(id, userId) {
    const result = await pool.query(
        "DELETE FROM applications WHERE id = $1 AND user_id = $2",
        [id, userId]
    );
    return result.rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };
