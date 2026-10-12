import { findOwnedProject } from "../models/project.model.js";
import * as taskModel from "../models/task.model.js";
import { AppError } from "../utils/AppError.js";

async function assertOwnedProject(userId, projectId) {
  const project = await findOwnedProject(projectId, userId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  return project;
}

export async function createTask(userId, input) {
  await assertOwnedProject(userId, input.projectId);

  return taskModel.createTask({
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    projectId: input.projectId,
    ownerId: userId,
    dueDate: input.dueDate ?? null,
  });
}

export async function listTasks(userId, query) {
  if (query.projectId !== undefined) {
    await assertOwnedProject(userId, query.projectId);
  }

  return taskModel.listTasks({
    ownerId: userId,
    status: query.status,
    priority: query.priority,
    projectId: query.projectId,
    page: query.page,
    limit: query.limit,
  });
}

export async function getTask(userId, taskId) {
  const task = await taskModel.findOwnedTask(taskId, userId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
}

export async function updateTask(userId, taskId, input) {
  const existing = await taskModel.findOwnedTask(taskId, userId);
  if (!existing) {
    throw new AppError("Task not found", 404);
  }

  if (input.projectId !== undefined) {
    await assertOwnedProject(userId, input.projectId);
  }

  const patch = {};
  for (const key of ["title", "description", "status", "priority", "projectId", "dueDate"]) {
    if (input[key] !== undefined) {
      patch[key] = input[key];
    }
  }

  const task = await taskModel.updateOwnedTask(taskId, userId, patch);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
}

export async function removeTask(userId, taskId) {
  const deleted = await taskModel.deleteOwnedTask(taskId, userId);
  if (!deleted) {
    throw new AppError("Task not found", 404);
  }
  return { id: taskId };
}
