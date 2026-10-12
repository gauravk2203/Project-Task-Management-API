import { AppError } from "../utils/AppError.js";

export function validate(schema) {
  return function validateRequest(req, _res, next) {
    const result = schema.safeParse({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.slice(1).join(".") || "body",
        message: issue.message,
      }));
      return next(new AppError("Validation failed", 400, errors));
    }

    if (result.data.body !== undefined) {
      req.validatedBody = result.data.body;
    }
    if (result.data.query !== undefined) {
      req.validatedQuery = result.data.query;
    }
    if (result.data.params !== undefined) {
      req.validatedParams = result.data.params;
    }

    return next();
  };
}
