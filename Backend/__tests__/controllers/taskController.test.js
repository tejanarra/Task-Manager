// Task Controller Tests
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskPriority,
} from '../../controllers/taskController.js';
import Task from '../../models/Task.js';
import sequelize from '../../config/db.js';

// Mock the models and database
jest.mock('../../models/Task.js');
jest.mock('../../config/db.js');

describe('Task Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 123,
      body: {},
      params: {},
      query: {},
      headers: {
        'x-user-timezone': 'America/New_York',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    test('should create task successfully', async () => {
      req.body = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'not-started',
        deadline: new Date().toISOString(),
        reminders: [],
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
      Task.update = jest.fn().mockResolvedValue([1]);
      Task.create = jest.fn().mockResolvedValue({
        id: 1,
        title: 'Test Task',
        userId: 123,
      });

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should return 400 for missing title', async () => {
      req.body = {
        description: 'Test Description',
        status: 'not-started',
      };

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('required'),
        })
      );
    });

    test('should return 400 for invalid status', async () => {
      req.body = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'invalid-status',
      };

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getTasks', () => {
    test('should return paginated tasks', async () => {
      req.query = { page: '1', limit: '10' };

      Task.findAndCountAll = jest.fn().mockResolvedValue({
        count: 25,
        rows: [
          { id: 1, title: 'Task 1' },
          { id: 2, title: 'Task 2' },
        ],
      });

      await getTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          tasks: expect.any(Array),
          pagination: expect.objectContaining({
            currentPage: 1,
            totalPages: 3,
            totalTasks: 25,
          }),
        })
      );
    });

    test('should use default pagination values', async () => {
      req.query = {};

      Task.findAndCountAll = jest.fn().mockResolvedValue({
        count: 5,
        rows: [{ id: 1, title: 'Task 1' }],
      });

      await getTasks(req, res);

      expect(Task.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
          offset: 0,
        })
      );
    });

    test('should return 400 for invalid pagination params', async () => {
      req.query = { page: '-1', limit: '150' };

      await getTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid pagination'),
        })
      );
    });
  });

  describe('getTaskById', () => {
    test('should return task when found', async () => {
      req.params = { taskId: '1' };

      Task.findOne = jest.fn().mockResolvedValue({
        id: 1,
        title: 'Test Task',
        userId: 123,
      });

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Test Task',
        })
      );
    });

    test('should return 404 when task not found', async () => {
      req.params = { taskId: '999' };

      Task.findOne = jest.fn().mockResolvedValue(null);

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateTask', () => {
    test('should update task successfully', async () => {
      req.params = { taskId: '1' };
      req.body = {
        title: 'Updated Task',
        status: 'in-progress',
      };

      const mockTask = {
        id: 1,
        title: 'Old Title',
        update: jest.fn().mockResolvedValue(true),
      };

      Task.findOne = jest.fn().mockResolvedValue(mockTask);

      await updateTask(req, res);

      expect(mockTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Task',
          status: 'in-progress',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 for non-existent task', async () => {
      req.params = { taskId: '999' };
      req.body = { title: 'Updated Task' };

      Task.findOne = jest.fn().mockResolvedValue(null);

      await updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should return 400 when no fields to update', async () => {
      req.params = { taskId: '1' };
      req.body = {};

      Task.findOne = jest.fn().mockResolvedValue({ id: 1 });

      await updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No fields to update',
        })
      );
    });
  });

  describe('deleteTask', () => {
    test('should delete task and update priorities', async () => {
      req.params = { taskId: '1' };

      const mockTask = {
        id: 1,
        priority: 2,
        destroy: jest.fn().mockResolvedValue(true),
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
      Task.findOne = jest.fn().mockResolvedValue(mockTask);
      Task.update = jest.fn().mockResolvedValue([1]);

      await deleteTask(req, res);

      expect(mockTask.destroy).toHaveBeenCalled();
      expect(Task.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 for non-existent task', async () => {
      req.params = { taskId: '999' };

      const mockTransaction = {
        rollback: jest.fn(),
      };

      sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
      Task.findOne = jest.fn().mockResolvedValue(null);

      await deleteTask(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateTaskPriority', () => {
    test('should update priority successfully', async () => {
      req.params = { taskId: '1' };
      req.body = { priority: 3 };

      const mockTask = {
        id: 1,
        priority: 1,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
      Task.findOne = jest.fn().mockResolvedValue(mockTask);
      Task.count = jest.fn().mockResolvedValue(5);
      Task.update = jest.fn().mockResolvedValue([1]);

      await updateTaskPriority(req, res);

      expect(mockTask.save).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 400 for invalid priority', async () => {
      req.params = { taskId: '1' };
      req.body = { priority: -1 };

      await updateTaskPriority(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
