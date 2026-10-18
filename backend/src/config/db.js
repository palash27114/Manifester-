import "dotenv/config";
import pg from "pg"

const { Pool, types } = pg;

// pg returns BIGINT (type 20) as a string by default; task ids fit safely in a JS number.
types.setTypeParser(20, (value) => Number(value));

// Keep DATE (type 1082) as "YYYY-MM-DD" instead of a JS Date, which would shift it by timezone.
types.setTypeParser(1082, (value) => value);

if (!process.env.Dblink) {
    throw new Error("Dblink is not set — add it to backend/.env");
}

export const pool = new Pool({
    connectionString: process.env.Dblink,
    ssl: {
        rejectUnauthorized: false
    },
});

pool.on("error", (error) => {
    console.error("Unexpected Postgres pool error", error.message)
})
