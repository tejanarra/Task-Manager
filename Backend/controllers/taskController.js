const Task = require("../models/Task");
const { Sequelize } = require("sequelize");
import "pg"

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.userId;

  if (!title || !description || !status) {
    return res
      .status(400)
      .json({ message: "Missing required fields (title, description, status)" });
  }

  try {
    // Find the highest priority for the user
    const maxPriorityTask = await Task.findOne({
      where: { userId },
      order: [["priority", "DESC"]],
    });

    // Assign priority as the next available value
    const priority = maxPriorityTask ? maxPriorityTask.priority + 1 : 1;

    // Create the new task
    const task = await Task.create({ title, description, status, userId, priority });

    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err.message || err);
    res.status(500).json({ message: "Server error during task creation" });
  }
};

const getTasks = async (req, res) => {
  const userId = req.userId;

  try {
    const tasks = await Task.findAll({ where: { userId } });
    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err.message || err);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

const getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findByPk(taskId);
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

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    console.error(`Error updating task with ID ${taskId}:`, err.message || err);
    res.status(500).json({ message: "Server error updating task" });
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const deletedPriority = task.priority;

    await task.destroy();

    const [updatedRowsCount] = await Task.update(
      { priority: Sequelize.literal("priority - 1") },
      {
        where: {
          priority: {
            [Sequelize.Op.gt]: deletedPriority,
          },
        },
      }
    );

    if (updatedRowsCount === 0) {
      console.log("No tasks needed priority adjustment.");
    } else {
      console.log(`${updatedRowsCount} tasks updated to adjust priorities.`);
    }

    res.status(200).json({ message: "Task deleted successfully and priorities updated." });
  } catch (err) {
    console.error(`Error deleting task with ID ${taskId}:`, err.message || err);
    res.status(500).json({ message: "Server error deleting task" });
  }
};

const updateTaskPriority = async (req, res) => {
  const { taskId } = req.params;
  const { priority } = req.body;

  if (priority === undefined || !Number.isInteger(priority) || priority <= 0) {
    return res
      .status(400)
      .json({ message: "Priority must be a positive integer" });
  }

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const oldPriority = task.priority;

    if (oldPriority === priority) {
      return res.status(200).json(task);
    }

    if (priority > oldPriority) {
      await Task.update(
        { priority: Sequelize.literal("priority - 1") },
        {
          where: {
            priority: {
              [Sequelize.Op.gt]: oldPriority,
              [Sequelize.Op.lte]: priority,
            },
          }
        }
      );
    } else if (priority < oldPriority) {
      await Task.update(
        { priority: Sequelize.literal("priority + 1") },
        {
          where: {
            priority: {
              [Sequelize.Op.gte]: priority,
              [Sequelize.Op.lt]: oldPriority,
            },
          }
        }
      );
    }

    task.priority = priority;
    await task.save();

    await normalizeTaskPriorities(task.userId);

    res.status(200).json(task);
  } catch (err) {
    console.error(
      `Error updating priority for task with ID ${taskId}:`,
      err.message || err
    );
    res.status(500).json({ message: "Server error updating task priority" });
  }
};

const normalizeTaskPriorities = async (userId) => {
  try {
    const tasks = await Task.findAll({
      where: { userId },
      order: [['priority', 'ASC']],
    });

    for (let i = 0; i < tasks.length; i++) {
      tasks[i].priority = i + 1;
      await tasks[i].save();
    }
  } catch (err) {
    console.error(`Error normalizing priorities for user ID ${userId}:`, err.message || err);
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
