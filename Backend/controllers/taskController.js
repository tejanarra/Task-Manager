const Task = require("../models/Task");
const { Sequelize } = require("sequelize");

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.userId;

  if (!title || !description || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const task = await Task.create({ title, description, status, userId });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.destroy();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTaskPriority = async (req, res) => {
  const { taskId } = req.params;
  const { priority } = req.body;

  // Validate priority
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
          },
        }
      );
    } else {
      await Task.update(
        { priority: Sequelize.literal("priority + 1") },
        {
          where: {
            priority: {
              [Sequelize.Op.lt]: oldPriority,
              [Sequelize.Op.gte]: priority,
            },
          },
        }
      );
    }

    task.priority = priority;
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
