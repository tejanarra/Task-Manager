// Frontend Reminder Utilities Tests
// Tests reminder creation, normalization, and display logic

import {
  formatHoursLabel,
  createOneTimeReminder,
  createOneTimeReminderFromDate,
  createRecurringReminder,
  normalizeRemindersBeforeSave,
  getReminderSummary,
  toggleRecurringReminder,
  validateCustomReminder,
  isOneTimeReminder,
  getActiveReminderCount,
} from '../reminderUtils';
import { REMINDER_TYPES } from '../../constants/appConstants';

describe('reminderUtils - formatHoursLabel', () => {
  test('should format minutes correctly', () => {
    expect(formatHoursLabel(0.5)).toBe('30 mins');
    expect(formatHoursLabel(0.25)).toBe('15 mins');
    expect(formatHoursLabel(1 / 60)).toBe('1 min');
  });

  test('should format hours correctly', () => {
    expect(formatHoursLabel(1)).toBe('1 hr');
    expect(formatHoursLabel(2)).toBe('2 hrs');
    expect(formatHoursLabel(12)).toBe('12 hrs');
  });

  test('should format days correctly', () => {
    expect(formatHoursLabel(24)).toBe('1 day');
    expect(formatHoursLabel(48)).toBe('2 days');
    expect(formatHoursLabel(120)).toBe('5 days');
  });

  test('should format weeks correctly', () => {
    expect(formatHoursLabel(168)).toBe('1 week');
    expect(formatHoursLabel(336)).toBe('2 weeks');
  });

  test('should handle decimal hours', () => {
    expect(formatHoursLabel(1.5)).toBe('1.5 hrs');
    expect(formatHoursLabel(36)).toBe('1.5 days');
  });
});

describe('reminderUtils - createOneTimeReminder', () => {
  test('should create valid one-time reminder', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminder(24, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPES.ONE_TIME);
    expect(reminder.remindAt).toBeDefined();
    expect(reminder.sent).toBe(false);
    expect(reminder.lastSentAt).toBeNull();

    const remindDate = new Date(reminder.remindAt);
    const expectedDate = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
    expect(Math.abs(remindDate - expectedDate)).toBeLessThan(1000);
  });

  test('should return null if reminder is in the past', () => {
    const deadline = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    const reminder = createOneTimeReminder(24, deadline); // 24 hours before

    expect(reminder).toBeNull();
  });

  test('should return null for invalid inputs', () => {
    expect(createOneTimeReminder(0, new Date())).toBeNull();
    expect(createOneTimeReminder(-1, new Date())).toBeNull();
    expect(createOneTimeReminder(24, null)).toBeNull();
  });
});

describe('reminderUtils - createOneTimeReminderFromDate', () => {
  test('should create reminder from custom date', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const customDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const reminder = createOneTimeReminderFromDate(customDate, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPES.ONE_TIME);
    expect(new Date(reminder.remindAt).getTime()).toBeCloseTo(customDate.getTime(), -3);
  });

  test('should return null if custom date is after deadline', () => {
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const customDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    expect(createOneTimeReminderFromDate(customDate, deadline)).toBeNull();
  });

  test('should return null if custom date is in the past', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const customDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    expect(createOneTimeReminderFromDate(customDate, deadline)).toBeNull();
  });
});

describe('reminderUtils - createRecurringReminder', () => {
  test('should create daily reminder', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const reminder = createRecurringReminder(REMINDER_TYPES.DAILY, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPES.DAILY);
    expect(reminder.intervalHours).toBe(24);
    expect(reminder.sent).toBe(false);
  });

  test('should create weekly reminder', () => {
    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const reminder = createRecurringReminder(REMINDER_TYPES.WEEKLY, deadline);

    expect(reminder).not.toBeNull();
    expect(reminder.type).toBe(REMINDER_TYPES.WEEKLY);
    expect(reminder.intervalHours).toBe(168);
  });

  test('should return null if not enough time for interval', () => {
    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    expect(createRecurringReminder(REMINDER_TYPES.DAILY, deadline)).toBeNull();

    const shortDeadline = new Date(Date.now() + 100 * 60 * 60 * 1000); // 100 hours
    expect(createRecurringReminder(REMINDER_TYPES.WEEKLY, shortDeadline)).toBeNull();
  });

  test('should return null for invalid type', () => {
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(createRecurringReminder('invalid', deadline)).toBeNull();
  });
});

describe('reminderUtils - normalizeRemindersBeforeSave', () => {
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  test('should normalize reminder with remindAt', () => {
    const remindAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindAt },
    ];

    const normalized = normalizeRemindersBeforeSave(reminders, deadline);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPES.ONE_TIME);
    expect(normalized[0].remindAt).toBeDefined();
  });

  test('should normalize reminder with customDate', () => {
    const customDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, customDate },
    ];

    const normalized = normalizeRemindersBeforeSave(reminders, deadline);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPES.ONE_TIME);
  });

  test('should normalize reminder with remindBefore', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindBefore: 24 },
    ];

    const normalized = normalizeRemindersBeforeSave(reminders, deadline);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].remindAt).toBeDefined();
  });

  test('should normalize daily reminder', () => {
    const reminders = [
      { type: REMINDER_TYPES.DAILY, intervalHours: 24 },
    ];

    const normalized = normalizeRemindersBeforeSave(reminders, deadline);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe(REMINDER_TYPES.DAILY);
    expect(normalized[0].intervalHours).toBe(24);
  });

  test('should deduplicate identical reminders', () => {
    const remindAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindAt },
      { type: REMINDER_TYPES.ONE_TIME, remindAt }, // Duplicate
    ];

    const normalized = normalizeRemindersBeforeSave(reminders, deadline);

    expect(normalized).toHaveLength(1);
  });

  test('should filter out invalid reminders', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME }, // Missing time info
      null,
      undefined,
      {},
    ];

    const normalized = normalizeRemindersBeforeSave(reminders, deadline);

    expect(normalized).toHaveLength(0);
  });

  test('should return empty array if no deadline', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindBefore: 24 },
    ];

    expect(normalizeRemindersBeforeSave(reminders, null)).toEqual([]);
  });
});

describe('reminderUtils - getReminderSummary', () => {
  test('should return empty string for no reminders', () => {
    expect(getReminderSummary([])).toBe('');
    expect(getReminderSummary(null)).toBe('');
  });

  test('should return summary for one reminder', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindAt: new Date().toISOString() },
    ];

    expect(getReminderSummary(reminders)).toBe('1 reminder');
  });

  test('should return summary for multiple one-time reminders', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindAt: new Date().toISOString() },
      { type: REMINDER_TYPES.ONE_TIME, remindAt: new Date().toISOString() },
      { type: REMINDER_TYPES.ONE_TIME, remindAt: new Date().toISOString() },
    ];

    expect(getReminderSummary(reminders)).toBe('3 reminders');
  });

  test('should return summary for daily reminder', () => {
    const reminders = [
      { type: REMINDER_TYPES.DAILY, intervalHours: 24 },
    ];

    expect(getReminderSummary(reminders)).toBe('Daily');
  });

  test('should return summary for weekly reminder', () => {
    const reminders = [
      { type: REMINDER_TYPES.WEEKLY, intervalHours: 168 },
    ];

    expect(getReminderSummary(reminders)).toBe('Weekly');
  });

  test('should return combined summary', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, remindAt: new Date().toISOString() },
      { type: REMINDER_TYPES.DAILY, intervalHours: 24 },
      { type: REMINDER_TYPES.WEEKLY, intervalHours: 168 },
    ];

    const summary = getReminderSummary(reminders);

    expect(summary).toContain('1 reminder');
    expect(summary).toContain('Daily');
    expect(summary).toContain('Weekly');
  });
});

describe('reminderUtils - toggleRecurringReminder', () => {
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  test('should add daily reminder when enabled', () => {
    const current = [];
    const updated = toggleRecurringReminder(
      current,
      REMINDER_TYPES.DAILY,
      true,
      deadline
    );

    expect(updated).toHaveLength(1);
    expect(updated[0].type).toBe(REMINDER_TYPES.DAILY);
    expect(updated[0].intervalHours).toBe(24);
  });

  test('should remove daily reminder when disabled', () => {
    const current = [
      { type: REMINDER_TYPES.DAILY, intervalHours: 24 },
    ];
    const updated = toggleRecurringReminder(
      current,
      REMINDER_TYPES.DAILY,
      false,
      deadline
    );

    expect(updated).toHaveLength(0);
  });

  test('should replace existing daily reminder', () => {
    const current = [
      { type: REMINDER_TYPES.DAILY, intervalHours: 24, sent: true },
    ];
    const updated = toggleRecurringReminder(
      current,
      REMINDER_TYPES.DAILY,
      true,
      deadline
    );

    expect(updated).toHaveLength(1);
    expect(updated[0].sent).toBe(false); // Fresh reminder
  });

  test('should keep other reminders when toggling', () => {
    const current = [
      { type: REMINDER_TYPES.ONE_TIME, remindAt: new Date().toISOString() },
      { type: REMINDER_TYPES.WEEKLY, intervalHours: 168 },
    ];

    const updated = toggleRecurringReminder(
      current,
      REMINDER_TYPES.DAILY,
      true,
      deadline
    );

    expect(updated).toHaveLength(3);
    expect(updated.some((r) => r.type === REMINDER_TYPES.ONE_TIME)).toBe(true);
    expect(updated.some((r) => r.type === REMINDER_TYPES.WEEKLY)).toBe(true);
    expect(updated.some((r) => r.type === REMINDER_TYPES.DAILY)).toBe(true);
  });
});

describe('reminderUtils - validateCustomReminder', () => {
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  test('should validate correct custom reminder', () => {
    const customDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const result = validateCustomReminder(customDate, deadline);

    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('should invalidate empty date', () => {
    const result = validateCustomReminder(null, deadline);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should invalidate invalid date string', () => {
    const result = validateCustomReminder('invalid-date', deadline);

    expect(result.valid).toBe(false);
  });

  test('should invalidate past date', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = validateCustomReminder(pastDate, deadline);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('future');
  });

  test('should invalidate date after deadline', () => {
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const result = validateCustomReminder(futureDate, deadline);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('before deadline');
  });
});

describe('reminderUtils - isOneTimeReminder', () => {
  test('should identify one-time reminder', () => {
    const reminder = { type: REMINDER_TYPES.ONE_TIME };
    expect(isOneTimeReminder(reminder)).toBe(true);
  });

  test('should identify daily reminder as not one-time', () => {
    const reminder = { type: REMINDER_TYPES.DAILY };
    expect(isOneTimeReminder(reminder)).toBe(false);
  });

  test('should identify weekly reminder as not one-time', () => {
    const reminder = { type: REMINDER_TYPES.WEEKLY };
    expect(isOneTimeReminder(reminder)).toBe(false);
  });

  test('should treat reminder without type as one-time', () => {
    const reminder = { remindBefore: 24 };
    expect(isOneTimeReminder(reminder)).toBe(true);
  });
});

describe('reminderUtils - getActiveReminderCount', () => {
  test('should count active reminders', () => {
    const reminders = [
      { type: REMINDER_TYPES.ONE_TIME, sent: false },
      { type: REMINDER_TYPES.ONE_TIME, sent: false },
      { type: REMINDER_TYPES.ONE_TIME, sent: true },
    ];

    expect(getActiveReminderCount(reminders)).toBe(2);
  });

  test('should return 0 for empty array', () => {
    expect(getActiveReminderCount([])).toBe(0);
  });

  test('should handle null gracefully', () => {
    expect(getActiveReminderCount(null)).toBe(0);
  });

  test('should count recurring reminders as active regardless of sent status', () => {
    const reminders = [
      { type: REMINDER_TYPES.DAILY, sent: false },
      { type: REMINDER_TYPES.WEEKLY, sent: false },
    ];

    // All unsent reminders count
    expect(getActiveReminderCount(reminders)).toBe(2);
  });
});
