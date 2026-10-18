export function notFound(req, res) {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
}

// Catches malformed JSON bodies and anything else thrown, so clients always get JSON back.
// Express only treats this as an error handler because it takes 4 arguments.
export function errorHandler(error, req, res, next) {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Request body must be valid JSON"
        });
    }

    console.error("Unhandled error:", error.message);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
