import { z } from "zod";
import { atLeastOne } from "./common.js";

const nameField = z.string().trim().min(2).max(100);
const emailField = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .email("Email must be a valid email address")
  .transform((value) => value.toLowerCase());
const passwordField = z.string().min(8).max(72);

export const registerSchema = z.object({
  body: z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: nameField.optional(),
      email: emailField.optional(),
    })
    .superRefine(atLeastOne(["name", "email"])),
});
