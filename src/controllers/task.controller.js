import * as taskService from "../services/task.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.validatedBody);
  sendSuccess(res, { status: 201, message: "Task created", data: task });
});

export const listTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.user.id, req.validatedQuery);
  sendSuccess(res, {
    message: "Tasks fetched",
    data: result.tasks,
    pagination: result.pagination,
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.user.id, req.validatedParams.id);
  sendSuccess(res, { message: "Task fetched", data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.user.id,
    req.validatedParams.id,
    req.validatedBody
  );
  sendSuccess(res, { message: "Task updated", data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.removeTask(req.user.id, req.validatedParams.id);
  sendSuccess(res, { message: "Task deleted", data: result });
});
