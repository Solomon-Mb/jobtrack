const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isText(value) {
    return typeof value === "string" && value.trim() !== "";
}

// Returns an error message, or null if the data is valid
function validate(body) {
    if (!isText(body.name)) return "Name is required";
    if (body.name.trim().length > 100) return "Name must be 100 characters or fewer";
    if (!isText(body.email) || !EMAIL_PATTERN.test(body.email.trim())) {
        return "A valid email is required";
    }
    if (body.email.trim().length > 254) return "Email is too long";
    if (typeof body.password !== "string" || body.password.length < 8) {
        return "Password must be at least 8 characters";
    }
    // bcrypt only uses the first 72 characters of a password
    if (body.password.length > 72) return "Password must be 72 characters or fewer";
    return null;
}

async function register(req, res, next) {
    try {
        const body = req.body || {};
        const error = validate(body);

        if (error) {
            return res.status(400).json({ error: error });
        }

        const name = body.name.trim();
        const email = body.email.trim().toLowerCase();

        const existing = await User.findByEmail(email);

        if (existing) {
            return res.status(409).json({ error: "Email is already registered" });
        }

        const passwordHash = await bcrypt.hash(body.password, 10);
        const user = await User.createUser(name, email, passwordHash);

        res.status(201).json(user);
    } catch (error) {
        // Two requests with the same email at the same moment hit the UNIQUE rule
        if (error.code === "23505") {
            return res.status(409).json({ error: "Email is already registered" });
        }

        next(error);
    }
}

module.exports = { register };
