import { z } from "zod";
import { atLeastOne, descriptionField, dueDateField, taskIdParam } from "./common.js";

const titleField = z.string().trim().min(1).max(200);
const statusField = z.enum(["todo", "in_progress", "completed"]);
const priorityField = z.enum(["low", "medium", "high"]);
const projectIdField = z.number().int().positive();

export const createTaskSchema = z.object({
  body: z.object({
    title: titleField,
    description: descriptionField,
    status: statusField.optional().default("todo"),
    priority: priorityField.optional().default("medium"),
    projectId: projectIdField,
    dueDate: dueDateField,
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: taskIdParam,
  }),
  body: z
    .object({
      title: titleField.optional(),
      description: descriptionField,
      status: statusField.optional(),
      priority: priorityField.optional(),
      projectId: projectIdField.optional(),
      dueDate: dueDateField,
    })
    .superRefine(atLeastOne(["title", "description", "status", "priority", "projectId", "dueDate"])),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: taskIdParam,
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: statusField.optional(),
    priority: priorityField.optional(),
    projectId: z.coerce.number().int().positive().optional(),
  }),
});
