import prisma from "../utils/prismaClient.js";

// Helper: fetch a task that belongs to the user
const fetchTask = async (taskId, userId) =>
  prisma.task.findFirst({
    where: { id: Number(taskId), userId: Number(userId) },
    include: { reminders: true },
  });

// ✅ Create Task WITHOUT Smart Generator
export const createTask = async (req, res) => {
  const { title, description, status = "NOT_STARTED", deadlineUTC } = req.body;
  const userId = req.userId;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }

  try {
    const newTask = await prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { userId },
        data: { priority: { increment: 1 } },
      });

      return tx.task.create({
        data: {
          title,
          description,
          status,
          deadlineUTC: deadlineUTC ? new Date(deadlineUTC) : null,
          priority: 1,
          userId,
        },
        include: { reminders: true },
      });
    });

    return res.status(201).json(newTask);
  } catch (err) {
    console.error("Create Task Error:", err);
    return res.status(500).json({ error: "Failed to create task" });
  }
};

// ✅ Get all tasks ordered by priority ASC
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

// ✅ Get single task
export const getTaskById = async (req, res) => {
  const userId = req.userId;

  try {
    const task = await fetchTask(req.params.taskId, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error("Get Task Error:", err);
    return res.status(500).json({ error: "Failed to fetch task" });
  }
};

// ✅ Update task – NO reminder regeneration
export const updateTask = async (req, res) => {
  const userId = req.userId;
  const { taskId } = req.params;
  const { title, description, status, deadlineUTC } = req.body;

  try {
    const existing = await fetchTask(taskId, userId);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        status,
        deadlineUTC: deadlineUTC ? new Date(deadlineUTC) : existing.deadlineUTC,
      },
      include: { reminders: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error("Update Task Error:", err);
    return res.status(500).json({ error: "Failed to update task" });
  }
};

// ✅ Delete + reorder priorities
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;

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
    if (err.message === "TaskNotFound")
      return res.status(404).json({ error: "Task not found" });

    console.error("Delete Task Error:", err);
    return res.status(500).json({ error: "Failed to delete task" });
  }
};

// ✅ Update priority
export const updateTaskPriority = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;
  const { priority } = req.body;

  if (!Number.isInteger(priority) || priority <= 0)
    return res
      .status(400)
      .json({ error: "Priority must be a positive integer" });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id: Number(taskId), userId },
      });
      if (!task) throw new Error("TaskNotFound");

      const total = await tx.task.count({ where: { userId } });
      const newPriority = Math.min(priority, total);

      if (task.priority !== newPriority) {
        await tx.task.updateMany({
          where: {
            userId,
            priority: {
              between: [
                Math.min(task.priority, newPriority),
                Math.max(task.priority, newPriority),
              ],
            },
          },
          data: {
            priority: { increment: task.priority < newPriority ? -1 : 1 },
          },
        });
      }

      return tx.task.update({
        where: { id: task.id },
        data: { priority: newPriority },
        include: { reminders: true },
      });
    });

    return res.json(updated);
  } catch (err) {
    if (err.message === "TaskNotFound")
      return res.status(404).json({ error: "Task not found" });

    console.error("Priority update error:", err);
    return res.status(500).json({ error: "Failed to update priority" });
  }
};

// ✅ Update reminders (ONLY overwrite ✅)
export const updateTaskReminders = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;
  const { reminders } = req.body;

  if (!Array.isArray(reminders))
    return res.status(400).json({ error: "Reminders must be an array" });

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // ✅ DELETE all → CREATE new (no duplicates, no merges)
    await prisma.taskReminder.deleteMany({ where: { taskId: task.id } });

    if (reminders.length) {
      const clean = reminders
        .filter(
          (r) => r.type && r.triggerAtUTC && !isNaN(new Date(r.triggerAtUTC))
        )
        // ✅ Dedupe same datetime + type combinations
        .filter(
          (r, i, arr) =>
            arr.findIndex(
              (x) => x.type === r.type && x.triggerAtUTC === r.triggerAtUTC
            ) === i
        )
        .map((r) => ({
          taskId: task.id,
          type: r.type,
          triggerAtUTC: new Date(r.triggerAtUTC),
        }));

      await prisma.taskReminder.createMany({ data: clean });
    }

    const refreshed = await fetchTask(taskId, userId);
    return res.json(refreshed);
  } catch (err) {
    console.error("Reminder update error:", err);
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
