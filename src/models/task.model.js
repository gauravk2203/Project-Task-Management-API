import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, maxlength: 5000 },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    projectId: { type: Number, required: true },
    ownerId: { type: Number, required: true },
    dueDate: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

taskSchema.index({ ownerId: 1, createdAt: -1 });
taskSchema.index({ ownerId: 1, status: 1 });
taskSchema.index({ ownerId: 1, priority: 1 });
taskSchema.index({ ownerId: 1, projectId: 1 });

export const Task = mongoose.model("Task", taskSchema);

export function serializeTask(doc) {
  if (!doc) {
    return null;
  }

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? null,
    status: doc.status,
    priority: doc.priority,
    projectId: doc.projectId,
    ownerId: doc.ownerId,
    dueDate: doc.dueDate ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createTask(input) {
  const doc = await Task.create(input);
  return serializeTask(doc);
}

export async function listTasks({ ownerId, status, priority, projectId, page, limit }) {
  const filter = { ownerId };
  if (status) {
    filter.status = status;
  }
  if (priority) {
    filter.priority = priority;
  }
  if (projectId !== undefined) {
    filter.projectId = projectId;
  }

  const skip = (page - 1) * limit;
  const [docs, totalRecords] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);

  return {
    tasks: docs.map(serializeTask),
    pagination: { page, limit, totalRecords, totalPages },
  };
}

export async function findOwnedTask(id, ownerId) {
  const doc = await Task.findOne({ _id: id, ownerId });
  return serializeTask(doc);
}

export async function updateOwnedTask(id, ownerId, patch) {
  const doc = await Task.findOneAndUpdate(
    { _id: id, ownerId },
    { $set: patch },
    { new: true, runValidators: true }
  );
  return serializeTask(doc);
}

export async function deleteOwnedTask(id, ownerId) {
  const result = await Task.deleteOne({ _id: id, ownerId });
  return result.deletedCount > 0;
}

export async function deleteTasksForProject(ownerId, projectId) {
  const result = await Task.deleteMany({ ownerId, projectId });
  return result.deletedCount;
}

export async function getTaskStats(ownerId) {
  const [row] = await Task.aggregate([
    { $match: { ownerId } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        pendingTasks: {
          $sum: {
            $cond: [{ $in: ["$status", ["todo", "in_progress"]] }, 1, 0],
          },
        },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        highPriorityTasks: {
          $sum: {
            $cond: [{ $eq: ["$priority", "high"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    totalTasks: row?.totalTasks ?? 0,
    pendingTasks: row?.pendingTasks ?? 0,
    completedTasks: row?.completedTasks ?? 0,
    highPriorityTasks: row?.highPriorityTasks ?? 0,
  };
}
