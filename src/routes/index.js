import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { healthRouter } from "./health.routes.js";
import { projectRouter } from "./project.routes.js";
import { taskRouter } from "./task.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/projects", projectRouter);
apiRouter.use("/tasks", taskRouter);
apiRouter.use("/dashboard", dashboardRouter);
