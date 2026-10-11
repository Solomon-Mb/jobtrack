// Handles requests to routes that do not exist
function notFound(req, res, next) {
    res.status(404).json({
        error: "Route not found: " + req.method + " " + req.originalUrl
    });
}

// Handles any error thrown while processing a request
function errorHandler(err, req, res, next) {
    // express.json() raises this when the body is not valid JSON
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON in request body" });
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error" });
}

module.exports = { notFound, errorHandler };
