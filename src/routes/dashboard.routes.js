import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, getDashboard);
