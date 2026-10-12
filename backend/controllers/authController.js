const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lets a login for an unknown email take as long as one for a known email,
// so response time doesn't reveal which emails are registered
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

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

function getSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set in .env");
    }
    return process.env.JWT_SECRET;
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

async function login(req, res, next) {
    try {
        const body = req.body || {};

        if (!isText(body.email) || typeof body.password !== "string" || body.password === "") {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findByEmail(body.email.trim().toLowerCase());

        const passwordOk = await bcrypt.compare(
            body.password,
            user ? user.password_hash : DUMMY_HASH
        );

        // Same message for "no such email" and "wrong password"
        if (!user || !passwordOk) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id }, getSecret(), {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        });

        res.json({
            token: token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        next(error);
    }
}

// Returns the logged-in user (requireAuth sets req.userId)
async function me(req, res, next) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({ error: "User no longer exists" });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, me };
