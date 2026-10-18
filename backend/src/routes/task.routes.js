import { Router } from "express";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";
import { validateId } from "../middleware/validateId.js";


const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", validateId, updateTask);
router.delete("/:id", validateId, deleteTask);

export default router;
