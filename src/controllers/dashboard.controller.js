import * as dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboard(req.user.id);
  sendSuccess(res, { message: "Dashboard statistics fetched", data: stats });
});
