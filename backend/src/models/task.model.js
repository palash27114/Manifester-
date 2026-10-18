import { pool } from "../config/db.js";

const COLUMNS = "id, dream, is_completed, created_at";

export async function findAllTasks() {
    const result = await pool.query(
        `
        SELECT ${COLUMNS},
               (SELECT COUNT(*)::int FROM public.daily_tasks dt WHERE dt.dream_id = t.id) AS task_count
        FROM public.tasks t
        ORDER BY created_at DESC
        `
    );
    return result.rows;
}

export async function insertTask(dream) {
    const result = await pool.query(
        `
        INSERT INTO public.tasks (dream)
        VALUES ($1)
        RETURNING ${COLUMNS}
        `,
        [dream]
    );
    return result.rows[0];
}

// Fields passed as undefined keep their current value.
export async function updateTaskById(id, { dream, isCompleted }) {
    const result = await pool.query(
        `
        UPDATE public.tasks
        SET dream = COALESCE($1, dream),
            is_completed = COALESCE($2, is_completed)
        WHERE id = $3
        RETURNING ${COLUMNS}
        `,
        [dream ?? null, isCompleted ?? null, id]
    );
    return result.rows[0] ?? null;
}

export async function deleteTaskById(id) {
    const result = await pool.query(
        `
        DELETE FROM public.tasks
        WHERE id = $1
        RETURNING ${COLUMNS}
        `,
        [id]
    );
    return result.rows[0] ?? null;
}
