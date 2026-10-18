import express from "express"
import cors from "cors"
import taskRoutes from "./routes/task.routes.js";
import dailyTaskRoutes from "./routes/dailyTask.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "HOME PAGE" });
})

app.use("/api/health", healthRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/daily-tasks", dailyTaskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
