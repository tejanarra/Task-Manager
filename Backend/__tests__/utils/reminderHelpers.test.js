// Tests for Reminder Helper Utilities
// Comprehensive test coverage for reminder creation, validation, and normalization

import {
  REMINDER_TYPE,
  isValidReminder,
  createOneTimeReminder,
  createOneTimeReminderFromDate,
  createRecurringReminder,
  normalizeReminders,
  getReadyReminders,
  markReminderAsSent,
  getReminderSummary,
} from '../../utils/reminderHelpers.js';

describe('reminderHelpers - REMINDER_TYPE', () => {
  test('should have correct reminder type constants', () => {
    expect(REMINDER_TYPE.ONE_TIME).toBe('one-time');
    expect(REMINDER_TYPE.DAILY).toBe('daily');
    expect(REMINDER_TYPE.WEEKLY).toBe('weekly');
  });
});

describe('reminderHelpers - isValidReminder', () => {
  const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const futureRemindAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  test('should validate one-time reminder with remindAt', () => {
    const reminder = {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: futureRemindAt,
      sent: false,
      lastSentAt: null,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(true);
  });

  test('should invalidate one-time reminder without remindAt', () => {
    const reminder = {
      type: REMINDER_TYPE.ONE_TIME,
      sent: false,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(false);
  });

  test('should invalidate one-time reminder with remindAt after deadline', () => {
    const pastDeadline = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
    const reminder = {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: futureRemindAt,
      sent: false,
    };
    expect(isValidReminder(reminder, pastDeadline)).toBe(false);
  });

  test('should validate daily reminder with correct intervalHours', () => {
    const reminder = {
      type: REMINDER_TYPE.DAILY,
      intervalHours: 24,
      sent: false,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(true);
  });

  test('should invalidate daily reminder with wrong intervalHours', () => {
    const reminder = {
      type: REMINDER_TYPE.DAILY,
      intervalHours: 48,
      sent: false,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(false);
  });

  test('should validate weekly reminder with correct intervalHours', () => {
    const reminder = {
      type: REMINDER_TYPE.WEEKLY,
      intervalHours: 168,
      sent: false,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(true);
  });

  test('should invalidate weekly reminder with wrong intervalHours', () => {
    const reminder = {
      type: REMINDER_TYPE.WEEKLY,
      intervalHours: 24,
      sent: false,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(false);
  });

  test('should invalidate reminder with invalid type', () => {
    const reminder = {
      type: 'invalid-type',
      sent: false,
    };
    expect(isValidReminder(reminder, futureDeadline)).toBe(false);
  });

  test('should invalidate null reminder', () => {
    expect(isValidReminder(null, futureDeadline)).toBe(false);
  });

  test('should invalidate reminder without deadline', () => {
    const reminder = {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: futureRemindAt,
    };
    expect(isValidReminder(reminder, null)).toBe(false);
  });
});

describe('reminderHelpers - createOneTimeReminder', () => {
  test('should create valid one-time reminder 24 hours before deadline', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminder(24, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPE.ONE_TIME);
    expect(reminder.remindAt).toBeDefined();
    expect(reminder.sent).toBe(false);
    expect(reminder.lastSentAt).toBeNull();

    const remindAtDate = new Date(reminder.remindAt);
    const expectedDate = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
    expect(Math.abs(remindAtDate - expectedDate)).toBeLessThan(1000);
  });

  test('should create valid one-time reminder 1 hour before deadline', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminder(1, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPE.ONE_TIME);
  });

  test('should return null if reminder time is in the past', () => {
    const deadline = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const reminder = createOneTimeReminder(24, deadline); // 24 hours before

    expect(reminder).toBeNull();
  });

  test('should return null for zero hours', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminder(0, deadline);

    expect(reminder).toBeNull();
  });

  test('should return null for negative hours', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminder(-24, deadline);

    expect(reminder).toBeNull();
  });

  test('should return null without deadline', () => {
    const reminder = createOneTimeReminder(24, null);
    expect(reminder).toBeNull();
  });
});

describe('reminderHelpers - createOneTimeReminderFromDate', () => {
  test('should create valid reminder from custom date', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const customDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminderFromDate(customDate, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPE.ONE_TIME);
    expect(new Date(reminder.remindAt).getTime()).toBeCloseTo(customDate.getTime(), -3);
    expect(reminder.sent).toBe(false);
  });

  test('should return null if custom date is after deadline', () => {
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const customDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminderFromDate(customDate, deadline);

    expect(reminder).toBeNull();
  });

  test('should return null if custom date is in the past', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const customDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminderFromDate(customDate, deadline);

    expect(reminder).toBeNull();
  });

  test('should return null without deadline', () => {
    const customDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminderFromDate(customDate, null);

    expect(reminder).toBeNull();
  });

  test('should return null without custom date', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminderFromDate(null, deadline);

    expect(reminder).toBeNull();
  });
});

describe('reminderHelpers - createRecurringReminder', () => {
  test('should create valid daily reminder', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createRecurringReminder(REMINDER_TYPE.DAILY, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPE.DAILY);
    expect(reminder.intervalHours).toBe(24);
    expect(reminder.sent).toBe(false);
    expect(reminder.lastSentAt).toBeNull();
  });

  test('should create valid weekly reminder', () => {
    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const reminder = createRecurringReminder(REMINDER_TYPE.WEEKLY, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPE.WEEKLY);
    expect(reminder.intervalHours).toBe(168);
    expect(reminder.sent).toBe(false);
  });

  test('should return null if not enough time for daily reminder', () => {
    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    const reminder = createRecurringReminder(REMINDER_TYPE.DAILY, deadline);

    expect(reminder).toBeNull();
  });

  test('should return null if not enough time for weekly reminder', () => {
    const deadline = new Date(Date.now() + 100 * 60 * 60 * 1000); // 100 hours
    const reminder = createRecurringReminder(REMINDER_TYPE.WEEKLY, deadline);

    expect(reminder).toBeNull();
  });

  test('should return null for invalid type', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createRecurringReminder('invalid', deadline);

    expect(reminder).toBeNull();
  });

  test('should return null without deadline', () => {
    const reminder = createRecurringReminder(REMINDER_TYPE.DAILY, null);
    expect(reminder).toBeNull();
  });
});

describe('reminderHelpers - normalizeReminders', () => {
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  test('should normalize array with one-time reminder (new format)', () => {
    const remindAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        remindAt,
        sent: false,
      },
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPE.ONE_TIME);
    expect(normalized[0].remindAt).toBe(remindAt);
  });

  test('should normalize array with legacy remindBefore format', () => {
    const reminders = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        remindBefore: 24,
        sent: false,
      },
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPE.ONE_TIME);
    expect(normalized[0].remindAt).toBeDefined();
  });

  test('should normalize array with customDate', () => {
    const customDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        customDate,
      },
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPE.ONE_TIME);
    expect(normalized[0].remindAt).toBeDefined();
  });

  test('should normalize daily reminder', () => {
    const reminders = [
      {
        type: REMINDER_TYPE.DAILY,
        intervalHours: 24,
      },
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPE.DAILY);
    expect(normalized[0].intervalHours).toBe(24);
  });

  test('should normalize weekly reminder', () => {
    const longDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      {
        type: REMINDER_TYPE.WEEKLY,
        intervalHours: 168,
      },
    ];

    const normalized = normalizeReminders(reminders, longDeadline, 'UTC');

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPE.WEEKLY);
    expect(normalized[0].intervalHours).toBe(168);
  });

  test('should deduplicate identical one-time reminders', () => {
    const remindAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME, remindAt },
      { type: REMINDER_TYPE.ONE_TIME, remindAt }, // Duplicate
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(1);
  });

  test('should keep only one daily reminder', () => {
    const reminders = [
      { type: REMINDER_TYPE.DAILY, intervalHours: 24 },
      { type: REMINDER_TYPE.DAILY, intervalHours: 24 }, // Duplicate
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(1);
  });

  test('should filter out invalid reminders', () => {
    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME }, // Missing remindAt
      { type: 'invalid' }, // Invalid type
      null,
      undefined,
    ];

    const normalized = normalizeReminders(reminders, deadline, 'UTC');

    expect(normalized).toHaveLength(0);
  });

  test('should return empty array if no deadline', () => {
    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME, remindBefore: 24 },
    ];

    const normalized = normalizeReminders(reminders, null, 'UTC');

    expect(normalized).toHaveLength(0);
  });

  test('should return empty array for non-array input', () => {
    expect(normalizeReminders(null, deadline, 'UTC')).toEqual([]);
    expect(normalizeReminders({}, deadline, 'UTC')).toEqual([]);
    expect(normalizeReminders('invalid', deadline, 'UTC')).toEqual([]);
  });
});

describe('reminderHelpers - getReadyReminders', () => {
  test('should return one-time reminder that is ready', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const remindAt = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute ago

    const reminders = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        remindAt,
        sent: false,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(1);
    expect(ready[0].remindAt).toBe(remindAt);
  });

  test('should not return one-time reminder in the future', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const remindAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow

    const reminders = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        remindAt,
        sent: false,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(0);
  });

  test('should not return already sent one-time reminder', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const remindAt = new Date(Date.now() - 60 * 1000).toISOString();

    const reminders = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        remindAt,
        sent: true,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(0);
  });

  test('should return daily reminder when within interval of deadline', () => {
    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

    const reminders = [
      {
        type: REMINDER_TYPE.DAILY,
        intervalHours: 24,
        sent: false,
        lastSentAt: null,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(1);
  });

  test('should not return daily reminder if already sent recently', () => {
    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const lastSentAt = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(); // 1 hour ago

    const reminders = [
      {
        type: REMINDER_TYPE.DAILY,
        intervalHours: 24,
        sent: false,
        lastSentAt,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(0);
  });

  test('should return daily reminder if interval has passed', () => {
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const lastSentAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago

    const reminders = [
      {
        type: REMINDER_TYPE.DAILY,
        intervalHours: 24,
        sent: false,
        lastSentAt,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(1);
  });

  test('should return empty array if deadline has passed', () => {
    const deadline = new Date(Date.now() - 1000).toISOString(); // Past
    const reminders = [
      {
        type: REMINDER_TYPE.DAILY,
        intervalHours: 24,
        sent: false,
      },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready).toHaveLength(0);
  });

  test('should handle mixed reminder types', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const readyRemindAt = new Date(Date.now() - 60 * 1000).toISOString();
    const futureRemindAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME, remindAt: readyRemindAt, sent: false },
      { type: REMINDER_TYPE.ONE_TIME, remindAt: futureRemindAt, sent: false },
      { type: REMINDER_TYPE.DAILY, intervalHours: 24, sent: false, lastSentAt: null },
    ];

    const ready = getReadyReminders(reminders, deadline);

    expect(ready.length).toBeGreaterThan(0);
  });
});

describe('reminderHelpers - markReminderAsSent', () => {
  test('should mark one-time reminder as sent', () => {
    const reminder = {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: new Date().toISOString(),
      sent: false,
      lastSentAt: null,
    };

    const marked = markReminderAsSent(reminder);

    expect(marked.sent).toBe(true);
    expect(marked.lastSentAt).toBeDefined();
    expect(new Date(marked.lastSentAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  test('should update lastSentAt for daily reminder but keep sent false', () => {
    const reminder = {
      type: REMINDER_TYPE.DAILY,
      intervalHours: 24,
      sent: false,
      lastSentAt: null,
    };

    const marked = markReminderAsSent(reminder);

    expect(marked.sent).toBe(false); // Recurring reminders stay active
    expect(marked.lastSentAt).toBeDefined();
  });

  test('should update lastSentAt for weekly reminder', () => {
    const reminder = {
      type: REMINDER_TYPE.WEEKLY,
      intervalHours: 168,
      sent: false,
      lastSentAt: null,
    };

    const marked = markReminderAsSent(reminder);

    expect(marked.sent).toBe(false);
    expect(marked.lastSentAt).toBeDefined();
  });

  test('should handle null reminder gracefully', () => {
    const marked = markReminderAsSent(null);
    expect(marked).toBeNull();
  });

  test('should not mutate original reminder object', () => {
    const reminder = {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: new Date().toISOString(),
      sent: false,
      lastSentAt: null,
    };

    const marked = markReminderAsSent(reminder);

    expect(reminder.sent).toBe(false); // Original unchanged
    expect(marked.sent).toBe(true); // New object marked
    expect(marked).not.toBe(reminder); // Different object
  });
});

describe('reminderHelpers - getReminderSummary', () => {
  test('should return empty string for empty array', () => {
    expect(getReminderSummary([])).toBe('');
  });

  test('should return summary for one one-time reminder', () => {
    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME, remindAt: new Date().toISOString() },
    ];

    const summary = getReminderSummary(reminders);

    expect(summary).toBe('1 one-time reminder');
  });

  test('should return summary for multiple one-time reminders', () => {
    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME, remindAt: new Date().toISOString() },
      { type: REMINDER_TYPE.ONE_TIME, remindAt: new Date().toISOString() },
    ];

    const summary = getReminderSummary(reminders);

    expect(summary).toBe('2 one-time reminders');
  });

  test('should return summary for daily reminder', () => {
    const reminders = [{ type: REMINDER_TYPE.DAILY, intervalHours: 24 }];

    const summary = getReminderSummary(reminders);

    expect(summary).toBe('Daily');
  });

  test('should return summary for weekly reminder', () => {
    const reminders = [{ type: REMINDER_TYPE.WEEKLY, intervalHours: 168 }];

    const summary = getReminderSummary(reminders);

    expect(summary).toBe('Weekly');
  });

  test('should return combined summary', () => {
    const reminders = [
      { type: REMINDER_TYPE.ONE_TIME, remindAt: new Date().toISOString() },
      { type: REMINDER_TYPE.DAILY, intervalHours: 24 },
      { type: REMINDER_TYPE.WEEKLY, intervalHours: 168 },
    ];

    const summary = getReminderSummary(reminders);

    expect(summary).toContain('1 one-time reminder');
    expect(summary).toContain('Daily');
    expect(summary).toContain('Weekly');
  });

  test('should handle null/undefined gracefully', () => {
    expect(getReminderSummary(null)).toBe('');
    expect(getReminderSummary(undefined)).toBe('');
  });
});
