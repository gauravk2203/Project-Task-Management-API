import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.get("/me", requireAuth, authController.me);
authRouter.put("/profile", requireAuth, validate(updateProfileSchema), authController.updateProfile);
