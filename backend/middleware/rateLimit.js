const rateLimit = require("express-rate-limit");

// Allows `max` requests per visitor every 15 minutes
function createAuthLimiter(max) {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many attempts. Please try again in 15 minutes." }
    });
}

// Temporary helper: set DEBUG_CLIENT_IP=true to log the address the app sees for each login attempt
function logClientIp(req, res, next) {
    if (process.env.DEBUG_CLIENT_IP === "true") {
        console.log("client ip seen by app:", req.ip, "| x-forwarded-for:", req.headers["x-forwarded-for"]);
    }

    next();
}

module.exports = { createAuthLimiter, logClientIp };
