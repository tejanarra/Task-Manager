import prisma from "../utils/prismaClient.js";
import { generateSmartReminders } from "../utils/reminderUtils.js";

// Helper: fetch a task that belongs to the user
const fetchTask = async (taskId, userId) => {
  return prisma.task.findFirst({
    where: { id: Number(taskId), userId: Number(userId) },
    include: { reminders: true },
  });
};

// Create a new task
export const createTask = async (req, res) => {
  const { title, description, status = "NOT_STARTED", deadlineUTC } = req.body;
  const userId = req.userId;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }

  try {
    const reminders = deadlineUTC
      ? generateSmartReminders(deadlineUTC, description, true)
      : [];

    const newTask = await prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { userId },
        data: { priority: { increment: 1 } },
      });

      const task = await tx.task.create({
        data: {
          title,
          description,
          status,
          deadlineUTC: deadlineUTC ? new Date(deadlineUTC) : null,
          priority: 1,
          userId,
        },
      });

      if (reminders.length > 0) {
        await tx.taskReminder.createMany({
          data: reminders.map((r) => ({
            taskId: task.id,
            type: r.type,
            triggerAtUTC: r.triggerAtUTC ? new Date(r.triggerAtUTC) : null,
            hourOfDayUTC: r.hourOfDayUTC ?? null,
            dayOfWeek: r.dayOfWeek ?? null,
          })),
        });
      }

      return tx.task.findUnique({
        where: { id: task.id },
        include: { reminders: true },
      });
    });

    return res.status(201).json(newTask);
  } catch (err) {
    console.error("Create Task Error:", err);
    return res.status(500).json({ error: "Failed to create task" });
  }
};

// Get all tasks ordered by priority
export const getTasks = async (req, res) => {
  const userId = req.userId;

  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { reminders: true },
      orderBy: { priority: "asc" },
    });

    return res.json(tasks);
  } catch (err) {
    console.error("Get Tasks Error:", err);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Get Single Task
export const getTaskById = async (req, res) => {
  const userId = req.userId;
  const { taskId } = req.params;

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error("Get Task Error:", err);
    return res.status(500).json({ error: "Failed to fetch task" });
  }
};

// Update Task + regenerate reminders only if deadline changes
export const updateTask = async (req, res) => {
  const userId = req.userId;
  const { taskId } = req.params;
  const { title, description, status, deadlineUTC } = req.body;

  try {
    const existing = await fetchTask(taskId, userId);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    const updateData = {
      title,
      description,
      status,
      deadlineUTC: deadlineUTC ? new Date(deadlineUTC) : existing.deadlineUTC,
    };

    let updatedTask;
    if (
      deadlineUTC &&
      new Date(deadlineUTC).toISOString() !==
        existing.deadlineUTC?.toISOString()
    ) {
      const reminders = generateSmartReminders(deadlineUTC, description, true);

      updatedTask = await prisma.$transaction(async (tx) => {
        await tx.task.update({
          where: { id: existing.id },
          data: updateData,
        });

        await tx.taskReminder.deleteMany({ where: { taskId: existing.id } });

        if (reminders.length > 0) {
          await tx.taskReminder.createMany({
            data: reminders.map((r) => ({
              taskId: existing.id,
              type: r.type,
              triggerAtUTC: r.triggerAtUTC ? new Date(r.triggerAtUTC) : null,
              hourOfDayUTC: r.hourOfDayUTC ?? null,
              dayOfWeek: r.dayOfWeek ?? null,
            })),
          });
        }

        return tx.task.findUnique({
          where: { id: existing.id },
          include: { reminders: true },
        });
      });
    } else {
      updatedTask = await prisma.task.update({
        where: { id: existing.id },
        data: updateData,
        include: { reminders: true },
      });
    }

    return res.json(updatedTask);
  } catch (err) {
    console.error("Update Task Error:", err);
    return res.status(500).json({ error: "Failed to update task" });
  }
};

// Delete task + reorder priorities
export const deleteTask = async (req, res) => {
  const userId = req.userId;
  const { taskId } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id: Number(taskId), userId },
      });

      if (!task) throw new Error("TaskNotFound");

      const removedPriority = task.priority;
      await tx.task.delete({ where: { id: task.id } });

      await tx.task.updateMany({
        where: { userId, priority: { gt: removedPriority } },
        data: { priority: { decrement: 1 } },
      });
    });

    return res.json({ message: "Task deleted and priorities updated" });
  } catch (err) {
    if (err.message === "TaskNotFound") {
      return res.status(404).json({ error: "Task not found" });
    }
    console.error("Delete Task Error:", err);
    return res.status(500).json({ error: "Failed to delete task" });
  }
};

// Update priority and reindex safely
export const updateTaskPriority = async (req, res) => {
  const userId = req.userId;
  const { taskId } = req.params;
  const { priority } = req.body;

  if (!Number.isInteger(priority) || priority <= 0) {
    return res
      .status(400)
      .json({ error: "Priority must be a positive integer" });
  }

  try {
    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id: Number(taskId), userId },
      });
      if (!task) throw new Error("TaskNotFound");

      const total = await tx.task.count({ where: { userId } });
      const newPriority = Math.min(priority, total);
      const oldPriority = task.priority;

      if (oldPriority !== newPriority) {
        if (oldPriority < newPriority) {
          await tx.task.updateMany({
            where: {
              userId,
              priority: { gt: oldPriority, lte: newPriority },
            },
            data: { priority: { decrement: 1 } },
          });
        } else {
          await tx.task.updateMany({
            where: {
              userId,
              priority: { gte: newPriority, lt: oldPriority },
            },
            data: { priority: { increment: 1 } },
          });
        }
      }

      return tx.task.update({
        where: { id: task.id },
        data: { priority: newPriority },
        include: { reminders: true },
      });
    });

    return res.json(updatedTask);
  } catch (err) {
    if (err.message === "TaskNotFound") {
      return res.status(404).json({ error: "Task not found" });
    }
    console.error("Update Priority Error:", err);
    return res.status(500).json({ error: "Failed to update priority" });
  }
};

// Update reminders only
export const updateTaskReminders = async (req, res) => {
  const { taskId } = req.params;
  const { action, reminders } = req.body;
  const userId = req.userId;

  if (!Array.isArray(reminders)) {
    return res.status(400).json({ error: "Reminders must be an array" });
  }

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (!["overwrite", "append"].includes(action)) {
      return res.status(400).json({
        error: "action must be either 'overwrite' or 'append'",
      });
    }

    let updatedList;

    if (action === "overwrite") {
      await prisma.taskReminder.deleteMany({ where: { taskId: task.id } });
      updatedList = reminders;
    } else {
      const existing = task.reminders;
      const newOnes = reminders.filter(
        (r) => !existing.some((e) => e.id === r.id)
      );
      updatedList = [...existing, ...newOnes];
    }

    if (updatedList.length > 0) {
      await prisma.taskReminder.createMany({
        data: updatedList.map((r) => ({
          taskId: task.id,
          type: r.type,
          triggerAtUTC: r.triggerAtUTC ? new Date(r.triggerAtUTC) : null,
          hourOfDayUTC: r.hourOfDayUTC ?? null,
          dayOfWeek: r.dayOfWeek ?? null,
        })),
      });
    }

    return res.json({
      message: `Reminders ${action}d successfully`,
      reminders: updatedList,
    });
  } catch (err) {
    console.error("Update reminders error:", err);
    return res.status(500).json({ error: "Failed to update reminders" });
  }
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskPriority,
  updateTaskReminders,
};
