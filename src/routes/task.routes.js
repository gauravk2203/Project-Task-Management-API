import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  listTasksSchema,
  taskIdSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.post("/", validate(createTaskSchema), taskController.createTask);
taskRouter.get("/", validate(listTasksSchema), taskController.listTasks);
taskRouter.get("/:id", validate(taskIdSchema), taskController.getTask);
taskRouter.put("/:id", validate(updateTaskSchema), taskController.updateTask);
taskRouter.delete("/:id", validate(taskIdSchema), taskController.deleteTask);
