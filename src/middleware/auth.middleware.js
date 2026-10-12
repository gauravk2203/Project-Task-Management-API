import { findUserById } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/token.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token has expired", 401);
      }
      throw new AppError("Invalid token", 401);
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError("Invalid token", 401);
    }

    const user = await findUserById(userId);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
