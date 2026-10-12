import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "../validators/project.validator.js";

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.post("/", validate(createProjectSchema), projectController.createProject);
projectRouter.get("/", projectController.listProjects);
projectRouter.get("/:id", validate(projectIdSchema), projectController.getProject);
projectRouter.put("/:id", validate(updateProjectSchema), projectController.updateProject);
projectRouter.delete("/:id", validate(projectIdSchema), projectController.deleteProject);
