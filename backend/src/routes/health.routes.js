import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "I WILL NEVER GIVE UP"
    });
});

router.get("/db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );
        res.status(200).json({
            status: "OK",
            message: "DB connected",
            time: result.rows[0].current_time
        })
    }
    catch (error) {
        console.error("DB query failed", error.message);
        res.status(500).json({
            status: "error",
            message: "DB query failed",
        });
    }
});

export default router;
