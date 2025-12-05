// Tests for Cron Job Reminder System
// Tests email sending, reminder marking, and recurring reminder logic

import { jest } from '@jest/globals';

// Mock dependencies first
const mockSendEmail = jest.fn();
const mockRenderFile = jest.fn().mockResolvedValue('<html>Mocked Email</html>');

jest.unstable_mockModule('../../utils/mailer.js', () => ({
  sendEmail: mockSendEmail,
}));

jest.unstable_mockModule('ejs', () => ({
  default: {
    renderFile: mockRenderFile,
  },
  renderFile: mockRenderFile,
}));

const { executeCron } = await import('../../utils/cronJobs.js');
const Task = (await import('../../models/Task.js')).default;
const User = (await import('../../models/User.js')).default;

describe('cronJobs - executeCron', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should send email for ready one-time reminder', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const remindAt = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute ago
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      description: 'Test Description',
      deadline,
      reminders: [
        {
          type: 'one-time',
          remindAt,
          sent: false,
          lastSentAt: null,
        },
      ],
      changed: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    User.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockSendEmail.mockResolvedValue(true);

    await executeCron();

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Task Reminder: Test Task',
      })
    );

    expect(mockTask.reminders[0].sent).toBe(true);
    expect(mockTask.reminders[0].lastSentAt).toBeDefined();
    expect(mockTask.save).toHaveBeenCalled();
  });

  test('should not send email for future one-time reminder', async () => {
    const remindAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [
        {
          type: 'one-time',
          remindAt,
          sent: false,
        },
      ],
      save: jest.fn(),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    mockSendEmail.mockClear();

    await executeCron();

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockTask.save).not.toHaveBeenCalled();
  });

  test('should not send email for already sent one-time reminder', async () => {
    const remindAt = new Date(Date.now() - 60 * 1000).toISOString();
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [
        {
          type: 'one-time',
          remindAt,
          sent: true, // Already sent
          lastSentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
      ],
      save: jest.fn(),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    mockSendEmail.mockClear();

    await executeCron();

    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test('should send email for daily reminder within interval', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [
        {
          type: 'daily',
          intervalHours: 24,
          sent: false,
          lastSentAt: null,
        },
      ],
      changed: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    User.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockSendEmail.mockResolvedValue(true);

    await executeCron();

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockTask.reminders[0].lastSentAt).toBeDefined();
    expect(mockTask.reminders[0].sent).toBe(false); // Recurring stays active
    expect(mockTask.save).toHaveBeenCalled();
  });

  test('should not send daily reminder if sent recently', async () => {
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const lastSentAt = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(); // 1 hour ago

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [
        {
          type: 'daily',
          intervalHours: 24,
          sent: false,
          lastSentAt,
        },
      ],
      save: jest.fn(),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    mockSendEmail.mockClear();

    await executeCron();

    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test('should send daily reminder if interval has passed', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const lastSentAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [
        {
          type: 'daily',
          intervalHours: 24,
          sent: false,
          lastSentAt,
        },
      ],
      changed: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    User.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockSendEmail.mockResolvedValue(true);

    await executeCron();

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockTask.save).toHaveBeenCalled();
  });

  test('should handle multiple reminders in one task', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const remindAt = new Date(Date.now() - 60 * 1000).toISOString();
    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [
        {
          type: 'one-time',
          remindAt,
          sent: false,
          lastSentAt: null,
        },
        {
          type: 'daily',
          intervalHours: 24,
          sent: false,
          lastSentAt: null,
        },
      ],
      changed: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    User.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockSendEmail.mockResolvedValue(true);

    await executeCron();

    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockTask.save).toHaveBeenCalled();
  });

  test('should skip tasks without reminders', async () => {
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mockTask = {
      id: 1,
      userId: 1,
      title: 'Test Task',
      deadline,
      reminders: [],
      save: jest.fn(),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    mockSendEmail.mockClear();

    await executeCron();

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockTask.save).not.toHaveBeenCalled();
  });

  test('should skip tasks with completed status', async () => {
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    Task.findAll = jest.fn().mockResolvedValue([]);

    await executeCron();

    // Verify that the query filters OUT completed tasks using Op.ne
    expect(Task.findAll).toHaveBeenCalled();
    const callArgs = Task.findAll.mock.calls[0][0];
    expect(callArgs.where.status).toBeDefined();
    // Check that the status filter uses a Symbol (Op.ne) and equals 'completed'
    const statusFilter = callArgs.where.status;
    const symbols = Object.getOwnPropertySymbols(statusFilter);
    expect(symbols.length).toBeGreaterThan(0);
    expect(statusFilter[symbols[0]]).toBe('completed');
  });

  test('should continue if email sending fails for one task', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const remindAt = new Date(Date.now() - 60 * 1000).toISOString();
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mockTask1 = {
      id: 1,
      userId: 1,
      title: 'Task 1',
      deadline,
      reminders: [{ type: 'one-time', remindAt, sent: false }],
      changed: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockTask2 = {
      id: 2,
      userId: 1,
      title: 'Task 2',
      deadline,
      reminders: [{ type: 'one-time', remindAt, sent: false }],
      changed: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask1, mockTask2]);
    User.findByPk = jest.fn().mockResolvedValue(mockUser);

    // First email fails, second succeeds
    mockSendEmail
      .mockRejectedValueOnce(new Error('Email failed'))
      .mockResolvedValueOnce(true);

    await executeCron();

    // Both tasks should be attempted
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    // Second task should still be saved
    expect(mockTask2.save).toHaveBeenCalled();
  });

  test('should handle missing user gracefully', async () => {
    const remindAt = new Date(Date.now() - 60 * 1000).toISOString();
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mockTask = {
      id: 1,
      userId: 999, // Non-existent user
      title: 'Test Task',
      deadline,
      reminders: [{ type: 'one-time', remindAt, sent: false }],
      changed: jest.fn(),
      save: jest.fn(),
    };

    Task.findAll = jest.fn().mockResolvedValue([mockTask]);
    User.findByPk = jest.fn().mockResolvedValue(null); // User not found

    await executeCron();

    expect(mockSendEmail).not.toHaveBeenCalled();
    // Should still mark as processed even if user missing
    expect(mockTask.save).toHaveBeenCalled();
  });

  test('should handle database errors gracefully', async () => {
    Task.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

    // Should not throw
    await expect(executeCron()).resolves.not.toThrow();
  });

  test('should skip tasks with past deadlines', async () => {
    const pastDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    Task.findAll = jest.fn().mockResolvedValue([]);

    await executeCron();

    expect(Task.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deadline: expect.anything(),
        }),
      })
    );
  });
});
