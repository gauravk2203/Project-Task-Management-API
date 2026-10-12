import { z } from "zod";
import { atLeastOne, descriptionField, projectIdParam } from "./common.js";

const titleField = z.string().trim().min(1).max(150);
const statusField = z.enum(["active", "completed", "archived"]);

export const createProjectSchema = z.object({
  body: z.object({
    title: titleField,
    description: descriptionField,
    status: statusField.optional().default("active"),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: projectIdParam,
  }),
  body: z
    .object({
      title: titleField.optional(),
      description: descriptionField,
      status: statusField.optional(),
    })
    .superRefine(atLeastOne(["title", "description", "status"])),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: projectIdParam,
  }),
});
