import { pool } from "../config/db.js"

export async function initialized() {
    // "tasks" holds dreams (kept under its original name so existing data stays put).
    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.tasks(
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        dream TEXT NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `)

    // Everyday tasks. kind = 'once'  -> "date" is the day it is due.
    //                  kind = 'daily' -> "date" is the first day the habit applies.
    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.daily_tasks(
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title TEXT NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('once', 'daily')),
        date DATE NOT NULL,
        dream_id BIGINT REFERENCES public.tasks(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `)

    // One row per task per day it was completed.
    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.daily_task_checks(
        task_id BIGINT NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        PRIMARY KEY (task_id, date)
        );
    `)

    console.log("DB tables initialized")
}
