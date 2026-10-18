export function registerShutdown(server, pool) {
    let shuttingDown = false;

    async function shutdown(signal) {
        if (shuttingDown) return;
        shuttingDown = true;

        console.log(`${signal} received. Shutting down...`);

        server.close(async (serverError) => {
            try {
                await pool.end();
                console.log("Database pool closed.");

                process.exit(serverError ? 1 : 0);
            } catch (error) {
                console.error("Shutdown failed:", error);
                process.exit(1);
            }
        });
    }

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
}