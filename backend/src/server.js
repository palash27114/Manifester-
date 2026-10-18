import "dotenv/config";
import app from "./app.js";
import { pool } from "./config/db.js";
import { startServer } from "./utils/startServer.js";
import { registerShutdown } from "./utils/shutdown.js";

const PORT = process.env.PORT || 7780;

async function main() {
    try {
        const server = await startServer(app, PORT);
        registerShutdown(server, pool);
    } catch (error) {
        console.error("Application startup failed", error.message);
        await pool.end();
        process.exitCode = 1;
    }
}

main();
