// Task Controller
// Handles CRUD operations for tasks

import Task from '../models/Task.js';
import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';
import {
  validateTaskTitle,
  validateTaskDescription,
  isValidTaskStatus,
  isValidPriority,
} from '../utils/validationUtils.js';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants/config.js';

const fetchTask = async (taskId, userId) => {
  const task = await Task.findOne({ where: { id: taskId, userId } });
  return task;
};

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  const { title, description, status, deadline, reminders } = req.body;
  const userId = req.userId;

  // Validate required fields
  if (!title || !status) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Title and status are required',
    });
  }

  // Validate title
  const titleValidation = validateTaskTitle(title);
  if (!titleValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: titleValidation.error,
    });
  }

  // Validate description
  if (description) {
    const descriptionValidation = validateTaskDescription(description);
    if (!descriptionValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: descriptionValidation.error,
      });
    }
  }

  // Validate status
  if (!isValidTaskStatus(status)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_TASK_STATUS,
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
        deadline,
        priority: 1,
        reminders: reminders || [],
      },
      { transaction }
    );

    await transaction.commit();
    res.status(HTTP_STATUS.CREATED).json(task);
  } catch (err) {
    await transaction.rollback();
    console.error('Error creating task:', err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error during task creation',
    });
  }
};

/**
 * Get all tasks for user with pagination
 */
export const getTasks = async (req, res) => {
  const userId = req.userId;

  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  // Validate pagination params
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100',
    });
  }

  try {
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: { userId },
      order: [['priority', 'ASC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(HTTP_STATUS.OK).json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: count,
        tasksPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Error fetching tasks:', err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error fetching tasks',
    });
  }
};

/**
 * Get single task by ID
 */
export const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }
    res.status(HTTP_STATUS.OK).json(task);
  } catch (err) {
    console.error(`Error fetching task with ID ${taskId}:`, err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error fetching task',
    });
  }
};

/**
 * Update task
 */
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, deadline, reminders } = req.body;
  const userId = req.userId;

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }

    const updatedFields = {};

    // Validate and add title
    if (title) {
      const titleValidation = validateTaskTitle(title);
      if (!titleValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: titleValidation.error,
        });
      }
      updatedFields.title = title;
    }

    // Validate and add description
    if (description !== undefined) {
      if (description) {
        const descriptionValidation = validateTaskDescription(description);
        if (!descriptionValidation.valid) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: descriptionValidation.error,
          });
        }
      }
      updatedFields.description = description;
    }

    // Validate and add status
    if (status) {
      if (!isValidTaskStatus(status)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: ERROR_MESSAGES.INVALID_TASK_STATUS,
        });
      }
      updatedFields.status = status;
    }

    if (deadline !== undefined) {
      updatedFields.deadline = deadline;
      updatedFields.reminderSent = false;
    }

    if (reminders !== undefined) {
      updatedFields.reminders = reminders;
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'No fields to update',
      });
    }

    await task.update(updatedFields);
    res.status(HTTP_STATUS.OK).json(task);
  } catch (err) {
    console.error(`Error updating task with ID ${taskId}:`, err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error updating task',
    });
  }
};

/**
 * Delete task
 */
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.userId;

  const transaction = await sequelize.transaction();

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      await transaction.rollback();
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.TASK_NOT_FOUND,
      });
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
    res.status(HTTP_STATUS.OK).json({
      message: SUCCESS_MESSAGES.TASK_DELETE_SUCCESS,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(`Error deleting task with ID ${taskId}:`, err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error deleting task',
    });
  }
};

/**
 * Update task priority
 */
export const updateTaskPriority = async (req, res) => {
  const { taskId } = req.params;
  const { priority } = req.body;
  const userId = req.userId;

  // Validate priority
  if (!isValidPriority(priority)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_PRIORITY,
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const task = await fetchTask(taskId, userId);
    if (!task) {
      await transaction.rollback();
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }

    const oldPriority = task.priority;
    const newPriority = priority;

    if (oldPriority === newPriority) {
      await transaction.rollback();
      return res.status(HTTP_STATUS.OK).json(task);
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
    res.status(HTTP_STATUS.OK).json(task);
  } catch (err) {
    await transaction.rollback();
    console.error(
      `Error updating priority for task with ID ${taskId}:`,
      err.message || err
    );
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error updating task priority',
    });
  }
};
