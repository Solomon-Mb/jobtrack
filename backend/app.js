const express = require("express");
const cors = require("cors");
const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", function (req, res) {
    res.json({ status: "ok", message: "JobTrack API is running" });
});

// Routes
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

// Error handling (must come after the routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
