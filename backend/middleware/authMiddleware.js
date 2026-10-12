const jwt = require("jsonwebtoken");

// Blocks the request unless it carries a valid "Authorization: Bearer <token>" header
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const parts = header.split(" ");

    if (parts[0] !== "Bearer" || !parts[1]) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = { requireAuth };
