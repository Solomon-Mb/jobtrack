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

module.exports = { createAuthLimiter };
