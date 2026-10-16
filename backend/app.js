const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const { createAuthLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Hosts like Render put a proxy in front of the app. Trust one hop so we see the visitor's real address
app.set("trust proxy", 1);

// Security headers. The page uses inline onclick handlers, so those are allowed,
// but scripts injected into the page are still blocked.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "script-src": ["'self'"],
            "script-src-attr": ["'unsafe-inline'"],
            "upgrade-insecure-requests": null
        }
    }
}));

// The deployed app is same-origin; CORS is only needed for local development
if (process.env.NODE_ENV !== "production") {
    app.use(cors());
}

app.use(express.json());

// Slow down password guessing and spam signups
const authLimiter = createAuthLimiter(Number(process.env.AUTH_RATE_LIMIT_MAX) || 20);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Test route
app.get("/api/health", function (req, res) {
    res.json({ status: "ok", message: "JobTrack API is running" });
});

// Routes
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

// Serve the frontend (index.html, script.js, ...) from the same server
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Error handling (must come after the routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
