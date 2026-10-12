import * as projectModel from "../models/project.model.js";
import { deleteTasksForProject } from "../models/task.model.js";
import { AppError } from "../utils/AppError.js";

export async function createProject(userId, input) {
  return projectModel.createProject({
    userId,
    title: input.title,
    description: input.description ?? null,
    status: input.status,
  });
}

export async function listProjects(userId) {
  return projectModel.listProjectsByUser(userId);
}

export async function getProject(userId, projectId) {
  const project = await projectModel.findOwnedProject(projectId, userId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  return project;
}

export async function updateProject(userId, projectId, input) {
  const existing = await projectModel.findOwnedProject(projectId, userId);
  if (!existing) {
    throw new AppError("Project not found", 404);
  }

  const project = await projectModel.updateOwnedProject(projectId, userId, input);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  return project;
}

export async function removeProject(userId, projectId) {
  const existing = await projectModel.findOwnedProject(projectId, userId);
  if (!existing) {
    throw new AppError("Project not found", 404);
  }

  // Tasks live in MongoDB, so the MySQL foreign key cannot remove them.
  // Delete the tasks first, then the project row.
  await deleteTasksForProject(userId, projectId);
  const deleted = await projectModel.deleteOwnedProject(projectId, userId);
  if (!deleted) {
    throw new AppError("Project not found", 404);
  }

  return { id: projectId };
}
