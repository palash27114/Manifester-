import {
    findTasksForDate,
    summarizeRange,
    findTaskById,
    findTaskOnDate,
    insertTask,
    updateTaskById,
    deleteTaskById,
    addCheck,
    removeCheck,
    dreamExists
} from "../models/dailyTask.model.js";
import { isValidDate, daysBetween } from "../utils/dates.js";

const MAX_TITLE = 280;
const MAX_RANGE_DAYS = 62;
const KINDS = ["once", "daily"];

function fail(res, status, message) {
    return res.status(status).json({ success: false, message });
}

function serverError(res, action, error) {
    console.error(`Failed to ${action}:`, error.message);
    return fail(res, 500, `Failed to ${action}`);
}

function checkTitle(title) {
    if (typeof title !== "string" || !title.trim()) return "Title is required";
    if (title.trim().length > MAX_TITLE) return `Title must be at most ${MAX_TITLE} characters`;
    return null;
}

// dream_id may be omitted, null (no dream) or an existing dream's id.
async function checkDreamId(dreamId) {
    if (dreamId === null || dreamId === undefined) return null;
    if (!Number.isInteger(dreamId) || dreamId < 1) return "dream_id must be a dream's id or null";
    if (!(await dreamExists(dreamId))) return "That dream does not exist";
    return null;
}

// GET /api/daily-tasks?date=YYYY-MM-DD
export async function getTasksForDate(req, res) {
    const { date } = req.query;
    if (!isValidDate(date)) return fail(res, 400, "date must be YYYY-MM-DD");

    try {
        return res.status(200).json({ success: true, data: await findTasksForDate(date) });
    } catch (error) {
        return serverError(res, "fetch daily tasks", error);
    }
}

// GET /api/daily-tasks/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function getSummary(req, res) {
    const { from, to } = req.query;
    if (!isValidDate(from) || !isValidDate(to)) {
        return fail(res, 400, "from and to must be YYYY-MM-DD");
    }
    const span = daysBetween(from, to);
    if (span < 0 || span > MAX_RANGE_DAYS) {
        return fail(res, 400, `from must be before to, at most ${MAX_RANGE_DAYS} days apart`);
    }

    try {
        return res.status(200).json({ success: true, data: await summarizeRange(from, to) });
    } catch (error) {
        return serverError(res, "fetch calendar summary", error);
    }
}

// POST /api/daily-tasks  { title, kind, date, dream_id? }
export async function createTask(req, res) {
    const { title, kind, date, dream_id } = req.body ?? {};

    const titleError = checkTitle(title);
    if (titleError) return fail(res, 400, titleError);
    if (!KINDS.includes(kind)) return fail(res, 400, "kind must be 'once' or 'daily'");
    if (!isValidDate(date)) return fail(res, 400, "date must be YYYY-MM-DD");

    try {
        const dreamError = await checkDreamId(dream_id);
        if (dreamError) return fail(res, 400, dreamError);

        const id = await insertTask({ title: title.trim(), kind, date, dreamId: dream_id });
        return res.status(201).json({ success: true, data: await findTaskOnDate(id, date) });
    } catch (error) {
        return serverError(res, "create daily task", error);
    }
}

// PUT /api/daily-tasks/:id?date=YYYY-MM-DD  { title?, dream_id? }
export async function updateTask(req, res) {
    const { id } = req.params;
    const body = req.body ?? {};
    const changes = {};

    if (body.title !== undefined) {
        const titleError = checkTitle(body.title);
        if (titleError) return fail(res, 400, titleError);
        changes.title = body.title.trim();
    }
    if ("dream_id" in body) changes.dreamId = body.dream_id;

    if (Object.keys(changes).length === 0) {
        return fail(res, 400, "Provide title or dream_id to update");
    }

    try {
        if ("dreamId" in changes) {
            const dreamError = await checkDreamId(changes.dreamId);
            if (dreamError) return fail(res, 400, dreamError);
        }

        const updatedId = await updateTaskById(id, changes);
        if (!updatedId) return fail(res, 404, "Task not found");

        const task = await findTaskById(id);
        const viewDate = isValidDate(req.query.date) ? req.query.date : task.date;
        return res.status(200).json({ success: true, data: await findTaskOnDate(id, viewDate) });
    } catch (error) {
        return serverError(res, "update daily task", error);
    }
}

// DELETE /api/daily-tasks/:id
export async function deleteTask(req, res) {
    try {
        const task = await deleteTaskById(req.params.id);
        if (!task) return fail(res, 404, "Task not found");
        return res.status(200).json({ success: true, data: task });
    } catch (error) {
        return serverError(res, "delete daily task", error);
    }
}

// PUT /api/daily-tasks/:id/checks/:date marks it done; DELETE un-marks it.
export function setCheck(done) {
    return async function (req, res) {
        const { id, date } = req.params;
        if (!isValidDate(date)) return fail(res, 400, "date must be YYYY-MM-DD");

        try {
            const task = await findTaskById(id);
            if (!task) return fail(res, 404, "Task not found");

            const applies = task.kind === "once" ? date === task.date : date >= task.date;
            if (!applies) return fail(res, 400, "This task is not scheduled on that date");

            if (done) await addCheck(id, date);
            else await removeCheck(id, date);

            return res.status(200).json({ success: true, data: await findTaskOnDate(id, date) });
        } catch (error) {
            return serverError(res, "update task completion", error);
        }
    };
}
