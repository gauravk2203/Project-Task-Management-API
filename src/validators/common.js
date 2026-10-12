import { z } from "zod";

export const descriptionField = z
  .union([z.string().trim().max(5000), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null || value === "") {
      return null;
    }
    return value;
  });

export const dueDateField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null || value.trim() === "") {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dueDate must be a valid date",
      });
      return z.NEVER;
    }
    return date;
  });

export const projectIdParam = z
  .string()
  .regex(/^[1-9]\d*$/, "Project id must be a positive integer")
  .transform(Number);

export const taskIdParam = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Task id must be a valid id");

export function atLeastOne(keys, message = "At least one field is required") {
  return (data, ctx) => {
    const present = keys.some((key) => data[key] !== undefined);
    if (!present) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
  };
}
