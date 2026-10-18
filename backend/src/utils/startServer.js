import { initialized } from "../db/init.js";

export async function startServer(app, PORT) {
    await initialized();

    const server = await new Promise((resolve, reject) => {
        const instance = app.listen(PORT, "0.0.0.0", () => {
            console.log(`manifesting has started on port ${PORT}`);
            resolve(instance);
        });

        instance.once("error", reject);
    });

    return server;
}
