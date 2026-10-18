export function validateId(req, res, next) {
    if (!/^[1-9]\d*$/.test(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID"
        });
    }
    next();
}
