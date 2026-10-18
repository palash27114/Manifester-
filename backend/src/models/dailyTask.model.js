import { pool } from "../config/db.js";

// A task applies to day $1 if it is a one-off due that day, or a habit that has started by then.
const APPLIES_ON = `
    ((dt.kind = 'once' AND dt.date = $1::date) OR (dt.kind = 'daily' AND dt.date <= $1::date))
`;

export async function findTasksForDate(date) {
    const result = await pool.query(
        `
        WITH runs AS (
            -- Group each habit's consecutive check days into runs ("gaps and islands").
            SELECT task_id, MAX(date) AS last_day, COUNT(*)::int AS length
            FROM (
                SELECT task_id, date,
                       date - (ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY date))::int AS run
                FROM public.daily_task_checks
                WHERE date <= $1::date
            ) numbered
            GROUP BY task_id, run
        )
        SELECT dt.id, dt.title, dt.kind, dt.date, dt.dream_id,
               d.dream AS dream_title,
               (c.task_id IS NOT NULL) AS done,
               COALESCE(r.length, 0) AS streak
        FROM public.daily_tasks dt
        LEFT JOIN public.tasks d ON d.id = dt.dream_id
        LEFT JOIN public.daily_task_checks c ON c.task_id = dt.id AND c.date = $1::date
        -- A streak is still alive if its last check was today or yesterday.
        LEFT JOIN runs r ON r.task_id = dt.id AND dt.kind = 'daily' AND r.last_day >= $1::date - 1
        WHERE ${APPLIES_ON}
        ORDER BY (dt.kind = 'daily') DESC, dt.created_at
        `,
        [date]
    );
    return result.rows;
}

export async function summarizeRange(from, to) {
    const result = await pool.query(
        `
        SELECT to_char(day, 'YYYY-MM-DD') AS date,
               COUNT(dt.id)::int AS total,
               COUNT(c.task_id)::int AS done
        FROM generate_series($1::date, $2::date, interval '1 day') AS day
        LEFT JOIN public.daily_tasks dt
               ON (dt.kind = 'once' AND dt.date = day::date)
               OR (dt.kind = 'daily' AND dt.date <= day::date)
        LEFT JOIN public.daily_task_checks c
               ON c.task_id = dt.id AND c.date = day::date
        GROUP BY day
        ORDER BY day
        `,
        [from, to]
    );
    return result.rows;
}

export async function findTaskById(id) {
    const result = await pool.query(
        "SELECT id, title, kind, date, dream_id FROM public.daily_tasks WHERE id = $1",
        [id]
    );
    return result.rows[0] ?? null;
}

export async function insertTask({ title, kind, date, dreamId }) {
    const result = await pool.query(
        `
        INSERT INTO public.daily_tasks (title, kind, date, dream_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [title, kind, date, dreamId ?? null]
    );
    return result.rows[0].id;
}

// Only fields present in `changes` are updated; dreamId may be null to unlink.
export async function updateTaskById(id, changes) {
    const result = await pool.query(
        `
        UPDATE public.daily_tasks
        SET title = COALESCE($1, title),
            dream_id = CASE WHEN $2 THEN $3::bigint ELSE dream_id END
        WHERE id = $4
        RETURNING id
        `,
        [changes.title ?? null, "dreamId" in changes, changes.dreamId ?? null, id]
    );
    return result.rows[0]?.id ?? null;
}

export async function deleteTaskById(id) {
    const result = await pool.query(
        "DELETE FROM public.daily_tasks WHERE id = $1 RETURNING id",
        [id]
    );
    return result.rows[0] ?? null;
}

export async function addCheck(taskId, date) {
    await pool.query(
        `
        INSERT INTO public.daily_task_checks (task_id, date)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [taskId, date]
    );
}

export async function removeCheck(taskId, date) {
    await pool.query(
        "DELETE FROM public.daily_task_checks WHERE task_id = $1 AND date = $2",
        [taskId, date]
    );
}

export async function dreamExists(id) {
    const result = await pool.query("SELECT 1 FROM public.tasks WHERE id = $1", [id]);
    return result.rowCount > 0;
}

// The full task as the day view shows it (with dream title, done flag and streak).
export async function findTaskOnDate(id, date) {
    const tasks = await findTasksForDate(date);
    return tasks.find((task) => task.id === Number(id)) ?? null;
}
