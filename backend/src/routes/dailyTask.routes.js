import { Router } from "express";
import {
    getTasksForDate,
    getSummary,
    createTask,
    updateTask,
    deleteTask,
    setCheck
} from "../controllers/dailyTask.controller.js";
import { validateId } from "../middleware/validateId.js";


const router = Router();

router.get("/", getTasksForDate);
router.get("/summary", getSummary);
router.post("/", createTask);
router.put("/:id", validateId, updateTask);
router.delete("/:id", validateId, deleteTask);
router.put("/:id/checks/:date", validateId, setCheck(true));
router.delete("/:id/checks/:date", validateId, setCheck(false));

export default router;
