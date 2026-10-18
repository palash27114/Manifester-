import {
    findAllTasks,
    insertTask,
    updateTaskById,
    deleteTaskById
} from "../models/task.model.js";

export async function getTasks(req, res) {
    try {
        const tasks = await findAllTasks();
        return res.status(200).json({
            success: true,
            data: tasks
        });
    }
    catch (error) {
        console.error("Failed to fetch tasks:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks"
        });
    }
}

export async function createTask(req, res) {
    try {
        const { dream } = req.body ?? {};

        if (typeof dream !== "string" || !dream.trim()) {
            return res.status(400).json({
                success: false,
                message: "Dream is required"
            });
        }

        const task = await insertTask(dream.trim());

        return res.status(201).json({
            success: true,
            data: task
        });
    }
    catch (error) {
        console.error("Failed to create task:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create task"
        });
    }
}

// Accepts { dream?, is_completed? } — at least one must be present.
export async function updateTask(req, res) {
    try {
        const { id } = req.params;
        const { dream, is_completed } = req.body ?? {};

        if (dream === undefined && is_completed === undefined) {
            return res.status(400).json({
                success: false,
                message: "Provide dream or is_completed to update"
            });
        }

        if (dream !== undefined && (typeof dream !== "string" || !dream.trim())) {
            return res.status(400).json({
                success: false,
                message: "Dream must be a non-empty string"
            });
        }

        if (is_completed !== undefined && typeof is_completed !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_completed must be true or false"
            });
        }

        const task = await updateTaskById(id, {
            dream: dream?.trim(),
            isCompleted: is_completed
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: task
        });
    }
    catch (error) {
        console.error("Failed to update task:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update task"
        });
    }
}

export async function deleteTask(req, res) {
    try {
        const task = await deleteTaskById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: task
        });
    }
    catch (error) {
        console.error("Failed to delete task:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete task"
        });
    }
}
