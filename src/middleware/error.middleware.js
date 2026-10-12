import { env } from "../config/env.js";

export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}

export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors;

  if (err.code === "ER_DUP_ENTRY") {
    status = 409;
    message = "Email is already registered";
    errors = [{ field: "email", message: "Email is already registered" }];
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired";
    errors = undefined;
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
    errors = undefined;
  }

  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && err.status === 400)) {
    status = 400;
    message = "Invalid JSON body";
    errors = undefined;
  }

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
    errors = undefined;
  }

  if (status >= 500 && !err.isOperational) {
    console.error(err);
    if (env.NODE_ENV === "production") {
      message = "Internal server error";
      errors = undefined;
    }
  }

  const body = { success: false, message };
  if (errors) {
    body.errors = errors;
  }

  res.status(status).json(body);
}
