import { checkMongo } from "../config/mongo.js";
import { checkMysql } from "../config/mysql.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const health = asyncHandler(async (_req, res) => {
  try {
    await Promise.all([checkMysql(), checkMongo()]);
  } catch (error) {
    console.error(error);
    throw new AppError("Database unavailable", 503);
  }

  sendSuccess(res, {
    message: "OK",
    data: { mysql: "up", mongo: "up" },
  });
});
