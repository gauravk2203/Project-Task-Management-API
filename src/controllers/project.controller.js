import * as projectService from "../services/project.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.validatedBody);
  sendSuccess(res, { status: 201, message: "Project created", data: project });
});

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects(req.user.id);
  sendSuccess(res, { message: "Projects fetched", data: projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProject(req.user.id, req.validatedParams.id);
  sendSuccess(res, { message: "Project fetched", data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.user.id,
    req.validatedParams.id,
    req.validatedBody
  );
  sendSuccess(res, { message: "Project updated", data: project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.removeProject(req.user.id, req.validatedParams.id);
  sendSuccess(res, { message: "Project deleted", data: result });
});
