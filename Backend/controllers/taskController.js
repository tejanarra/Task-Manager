const Task = require("../models/Task");
const { Sequelize } = require("sequelize");
import "pg";

const sequelize = require("../config/db");

const fetchTask = async (taskId, userId) => {
  const task = await Task.findOne({ where: { id: taskId, userId } });
  return task;
};

const normalizeTaskPriorities = async (userId, transaction) => {
  const tasks = await Task.findAll({
    where: { userId },
    order: [["priority", "ASC"]],
    transaction,
  });

  const bulkUpdates = tasks.map((task, index) => ({
    id: task.id,
    priority: index + 1,
  }));

  if (bulkUpdates.length === 0) return;

  const updateCases = bulkUpdates
    .map((task, idx) => `WHEN id = '${task.id}' THEN ${task.priority}`)
    .join(" ");

  const ids = bulkUpdates.map((task) => `'${task.id}'`).join(",");

  await sequelize.query(
    `UPDATE "Tasks" SET priority = CASE ${updateCases} END WHERE id IN (${ids})`,
    { transaction }
  );
};

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.userId;

  if (!title || !description || !status) {
    return res.status(400).json({
      message: "Missing required fields (title, description, status)",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    await Task.update(
      { priority: Sequelize.literal('"priority" + 1') },
      { where: { userId }, transaction }
    );

    const task = await Task.create(
      {
        title,
        description,
        status,
        userId,
        priority: 1,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(task);
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating task:", err.message || err);
    res.status(500).json({ message: "Server error during task creation" });
  }
};

const getTasks = async (req, res) => {
  const userId = req.userId;

  try {
    const tasks = await Task.findAll({
      where: { userId },
      order: [["priority", "ASC"]],
    });
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err.message || err);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (err) {
    console.error(`Error fetching task with ID ${taskId}:`, err.message || err);
    res.status(500).json({ message: "Server error fetching task" });
  }
};

const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status } = req.body;
  const userId = req.userId;

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (status) updatedFields.status = status;

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await task.update(updatedFields);
    res.status(200).json(task);
  } catch (err) {
    console.error(`Error updating task with ID ${taskId}:`, err.message || err);
    res.status(500).json({ message: "Server error updating task" });
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;

  const transaction = await sequelize.transaction();

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ message: "Task not found" });
    }

    const deletedPriority = task.priority;

    await task.destroy({ transaction });

    await Task.update(
      { priority: Sequelize.literal('"priority" - 1') },
      {
        where: {
          userId,
          priority: { [Sequelize.Op.gt]: deletedPriority },
        },
        transaction,
      }
    );

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Task deleted successfully and priorities updated." });
  } catch (err) {
    await transaction.rollback();
    console.error(`Error deleting task with ID ${taskId}:`, err.message || err);
    res.status(500).json({ message: "Server error deleting task" });
  }
};

const updateTaskPriority = async (req, res) => {
  const { taskId } = req.params;
  const { priority } = req.body;
  const userId = req.userId;

  if (priority === undefined || !Number.isInteger(priority) || priority <= 0) {
    return res
      .status(400)
      .json({ message: "Priority must be a positive integer" });
  }

  const transaction = await sequelize.transaction();

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ message: "Task not found" });
    }

    const oldPriority = task.priority;
    const newPriority = priority;

    if (oldPriority === newPriority) {
      await transaction.rollback();
      return res.status(200).json(task);
    }

    const maxPriority = await Task.count({ where: { userId }, transaction });

    const adjustedPriority = Math.min(newPriority, maxPriority);

    if (adjustedPriority < oldPriority) {
      await Task.update(
        { priority: Sequelize.literal('"priority" + 1') },
        {
          where: {
            userId,
            priority: {
              [Sequelize.Op.gte]: adjustedPriority,
              [Sequelize.Op.lt]: oldPriority,
            },
          },
          transaction,
        }
      );
    } else {
      await Task.update(
        { priority: Sequelize.literal('"priority" - 1') },
        {
          where: {
            userId,
            priority: {
              [Sequelize.Op.gt]: oldPriority,
              [Sequelize.Op.lte]: adjustedPriority,
            },
          },
          transaction,
        }
      );
    }

    task.priority = adjustedPriority;
    await task.save({ transaction });

    await transaction.commit();
    res.status(200).json(task);
  } catch (err) {
    await transaction.rollback();
    console.error(
      `Error updating priority for task with ID ${taskId}:`,
      err.message || err
    );
    res.status(500).json({ message: "Server error updating task priority" });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskById,
  updateTaskPriority,
};
