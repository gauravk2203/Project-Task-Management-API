import { getProjectStats } from "../models/project.model.js";
import { getTaskStats } from "../models/task.model.js";

export async function getDashboard(userId) {
  const [projects, tasks] = await Promise.all([
    getProjectStats(userId),
    getTaskStats(userId),
  ]);

  return {
    totalProjects: projects.totalProjects,
    activeProjects: projects.activeProjects,
    completedProjects: projects.completedProjects,
    totalTasks: tasks.totalTasks,
    pendingTasks: tasks.pendingTasks,
    completedTasks: tasks.completedTasks,
    highPriorityTasks: tasks.highPriorityTasks,
  };
}
