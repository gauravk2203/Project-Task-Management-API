import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validatedBody);
  sendSuccess(res, { status: 201, message: "User registered", data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validatedBody);
  sendSuccess(res, { message: "Login successful", data: result });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  sendSuccess(res, { message: "Profile fetched", data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.validatedBody);
  sendSuccess(res, { message: "Profile updated", data: user });
});
