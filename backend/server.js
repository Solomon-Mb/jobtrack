const express = require("express");
const cors = require("cors");
const applicationRoutes = require("./routes/applications");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/health", function (req, res) {
    res.json({
        status: "ok",
        message: "JobTrack API is running"
    });
});
// Application routes
app.use("/api/applications", applicationRoutes);
// Error handling (must come after the routes)
app.use(notFound);
app.use(errorHandler);
// Start server
app.listen(PORT, function () {
    console.log("Server running on http://localhost:" + PORT);
});