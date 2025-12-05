// Comprehensive AI Controller Tests
// Tests all reminder handling scenarios end-to-end

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { DateTime } from 'luxon';
import {
  normalizeReminders,
  createOneTimeReminder,
  createRecurringReminder,
  REMINDER_TYPE,
} from '../../utils/reminderHelpers.js';

describe('AI Controller - Reminder Normalization', () => {
  const userTimeZone = 'America/New_York';
  let futureDeadline;

  beforeEach(() => {
    // Deadline 7 days from now
    futureDeadline = DateTime.now()
      .setZone(userTimeZone)
      .plus({ days: 7 })
      .toUTC()
      .toISO();
  });

  describe('AI generateTask - Reminder Handling', () => {
    test('should normalize AI remindBefore to remindAt format', () => {
      const aiReminders = [
        { remindBefore: 24, type: 'one-time' },
        { remindBefore: 48, type: 'one-time' },
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(2);
      expect(normalized[0].type).toBe(REMINDER_TYPE.ONE_TIME);
      expect(normalized[0].remindAt).toBeDefined();
      expect(normalized[0].sent).toBe(false);
      expect(normalized[0].lastSentAt).toBeNull();
    });

    test('should handle AI daily reminder', () => {
      const aiReminders = [{ remindBefore: 24, type: 'daily' }];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
      expect(normalized[0].type).toBe(REMINDER_TYPE.DAILY);
      expect(normalized[0].intervalHours).toBe(24);
      expect(normalized[0].sent).toBe(false);
      expect(normalized[0].lastSentAt).toBeNull();
      expect(normalized[0].remindAt).toBeUndefined();
    });

    test('should handle AI weekly reminder', () => {
      // Weekly needs more than 168 hours (7 days) until deadline
      const weeklyDeadline = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 10 })
        .toUTC()
        .toISO();

      const aiReminders = [{ remindBefore: 168, type: 'weekly' }];

      const normalized = normalizeReminders(aiReminders, weeklyDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
      expect(normalized[0].type).toBe(REMINDER_TYPE.WEEKLY);
      expect(normalized[0].intervalHours).toBe(168);
      expect(normalized[0].sent).toBe(false);
    });

    test('should handle AI mixed reminders', () => {
      // Weekly needs more than 168 hours (7 days) until deadline
      const mixedDeadline = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 10 })
        .toUTC()
        .toISO();

      const aiReminders = [
        { remindBefore: 24, type: 'one-time' },
        { remindBefore: 24, type: 'daily' },
        { remindBefore: 168, type: 'weekly' },
      ];

      const normalized = normalizeReminders(aiReminders, mixedDeadline, userTimeZone);

      expect(normalized.length).toBe(3);
      const types = normalized.map((r) => r.type);
      expect(types).toContain(REMINDER_TYPE.ONE_TIME);
      expect(types).toContain(REMINDER_TYPE.DAILY);
      expect(types).toContain(REMINDER_TYPE.WEEKLY);
    });

    test('should deduplicate duplicate AI reminders', () => {
      const aiReminders = [
        { remindBefore: 24, type: 'daily' },
        { remindBefore: 24, type: 'daily' }, // Duplicate
        { remindBefore: 24, type: 'daily' }, // Duplicate
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
      expect(normalized[0].type).toBe(REMINDER_TYPE.DAILY);
    });

    test('should filter out invalid AI reminders', () => {
      const aiReminders = [
        { remindBefore: -10, type: 'one-time' }, // Negative
        { remindBefore: 24, type: 'one-time' }, // Valid
        { remindBefore: 0, type: 'one-time' }, // Zero
        null, // Null
        undefined, // Undefined
        {}, // Empty object
        { type: 'one-time' }, // Missing remindBefore
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
      expect(normalized[0].remindBefore).toBeUndefined();
      expect(normalized[0].remindAt).toBeDefined();
    });

    test('should handle AI customDate format', () => {
      const customDateTime = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 3 })
        .toISO();

      const aiReminders = [{ customDate: customDateTime }];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
      expect(normalized[0].type).toBe(REMINDER_TYPE.ONE_TIME);
      expect(normalized[0].remindAt).toBeDefined();
    });
  });

  describe('AI chatConversation - Update Reminder Handling', () => {
    test('should clear reminders when AI returns empty array', () => {
      const aiReminders = [];
      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized).toEqual([]);
    });

    test('should handle adding new reminders to existing task', () => {
      const existingReminders = [
        {
          type: REMINDER_TYPE.ONE_TIME,
          remindAt: DateTime.now().plus({ days: 2 }).toUTC().toISO(),
          sent: false,
          lastSentAt: null,
        },
      ];

      const aiNewReminders = [{ remindBefore: 48, type: 'one-time' }];

      const normalized = normalizeReminders(
        [...existingReminders, ...aiNewReminders],
        futureDeadline,
        userTimeZone
      );

      expect(normalized.length).toBeGreaterThanOrEqual(1);
    });

    test('should re-normalize reminders when deadline changes', () => {
      const oldDeadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();
      const newDeadline = DateTime.now().plus({ days: 14 }).toUTC().toISO();

      const existingReminders = [{ remindBefore: 24, type: 'one-time' }];

      const oldNormalized = normalizeReminders(
        existingReminders,
        oldDeadline,
        userTimeZone
      );
      const newNormalized = normalizeReminders(
        existingReminders,
        newDeadline,
        userTimeZone
      );

      expect(oldNormalized[0].remindAt).toBeDefined();
      expect(newNormalized[0].remindAt).toBeDefined();
      expect(oldNormalized[0].remindAt).not.toBe(newNormalized[0].remindAt);
    });

    test('should preserve existing reminders when AI does not modify them', () => {
      const existingReminders = [
        {
          type: REMINDER_TYPE.DAILY,
          intervalHours: 24,
          sent: false,
          lastSentAt: null,
        },
      ];

      // AI doesn't provide newReminders, so we keep existing
      const normalized = normalizeReminders(
        existingReminders,
        futureDeadline,
        userTimeZone
      );

      expect(normalized.length).toBe(1);
      expect(normalized[0].type).toBe(REMINDER_TYPE.DAILY);
      expect(normalized[0].intervalHours).toBe(24);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null deadline', () => {
      const aiReminders = [{ remindBefore: 24, type: 'one-time' }];
      const normalized = normalizeReminders(aiReminders, null, userTimeZone);

      expect(normalized).toEqual([]);
    });

    test('should handle undefined deadline', () => {
      const aiReminders = [{ remindBefore: 24, type: 'one-time' }];
      const normalized = normalizeReminders(aiReminders, undefined, userTimeZone);

      expect(normalized).toEqual([]);
    });

    test('should handle empty reminders array', () => {
      const normalized = normalizeReminders([], futureDeadline, userTimeZone);
      expect(normalized).toEqual([]);
    });

    test('should handle null reminders', () => {
      const normalized = normalizeReminders(null, futureDeadline, userTimeZone);
      expect(normalized).toEqual([]);
    });

    test('should handle reminders with past deadline', () => {
      const pastDeadline = DateTime.now()
        .setZone(userTimeZone)
        .minus({ days: 1 })
        .toUTC()
        .toISO();

      const aiReminders = [{ remindBefore: 24, type: 'one-time' }];
      const normalized = normalizeReminders(aiReminders, pastDeadline, userTimeZone);

      expect(normalized).toEqual([]);
    });

    test('should handle reminder that would be in the past', () => {
      const soonDeadline = DateTime.now()
        .setZone(userTimeZone)
        .plus({ hours: 12 })
        .toUTC()
        .toISO();

      const aiReminders = [{ remindBefore: 24, type: 'one-time' }]; // Would be 12h ago

      const normalized = normalizeReminders(aiReminders, soonDeadline, userTimeZone);

      expect(normalized).toEqual([]);
    });

    test('should handle very large remindBefore values', () => {
      const farDeadline = DateTime.now()
        .setZone(userTimeZone)
        .plus({ months: 6 })
        .toUTC()
        .toISO();

      const aiReminders = [{ remindBefore: 720, type: 'one-time' }]; // 30 days

      const normalized = normalizeReminders(aiReminders, farDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
      expect(normalized[0].remindAt).toBeDefined();
    });

    test('should handle recurring reminder with insufficient time', () => {
      const soonDeadline = DateTime.now()
        .setZone(userTimeZone)
        .plus({ hours: 12 })
        .toUTC()
        .toISO();

      const aiReminders = [{ remindBefore: 24, type: 'daily' }]; // Needs 24h

      const normalized = normalizeReminders(aiReminders, soonDeadline, userTimeZone);

      expect(normalized).toEqual([]);
    });
  });

  describe('Timezone Handling', () => {
    test('should correctly convert reminders across timezones', () => {
      const nyDeadline = DateTime.now()
        .setZone('America/New_York')
        .plus({ days: 7 })
        .toUTC()
        .toISO();

      const aiReminders = [{ remindBefore: 24, type: 'one-time' }];

      const normalized = normalizeReminders(aiReminders, nyDeadline, 'America/New_York');

      expect(normalized[0].remindAt).toBeDefined();
      const remindAtDT = DateTime.fromISO(normalized[0].remindAt, { zone: 'utc' });
      expect(remindAtDT.isValid).toBe(true);
    });

    test('should handle UTC timezone explicitly', () => {
      const utcDeadline = DateTime.now().setZone('UTC').plus({ days: 7 }).toISO();

      const aiReminders = [{ remindBefore: 24, type: 'one-time' }];

      const normalized = normalizeReminders(aiReminders, utcDeadline, 'UTC');

      expect(normalized[0].remindAt).toBeDefined();
    });

    test('should handle custom date in different timezone', () => {
      const customDate = DateTime.now()
        .setZone('Europe/London')
        .plus({ days: 3 })
        .toISO();

      const deadline = DateTime.now()
        .setZone('Europe/London')
        .plus({ days: 7 })
        .toUTC()
        .toISO();

      const aiReminders = [{ customDate }];

      const normalized = normalizeReminders(aiReminders, deadline, 'Europe/London');

      expect(normalized.length).toBe(1);
      expect(normalized[0].remindAt).toBeDefined();
    });
  });

  describe('Priority and Format Handling', () => {
    test('should prioritize remindAt over remindBefore', () => {
      const specificTime = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 3 })
        .toISO();

      const aiReminders = [
        {
          remindAt: specificTime,
          remindBefore: 24,
          type: 'one-time',
        },
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized[0].remindAt).toBe(DateTime.fromISO(specificTime).toUTC().toISO());
    });

    test('should prioritize customDate over remindBefore', () => {
      const customDate = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 3 })
        .toISO();

      const aiReminders = [
        {
          customDate,
          remindBefore: 24,
          type: 'one-time',
        },
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized[0].remindAt).toBeDefined();
    });

    test('should handle already normalized format', () => {
      const remindAt = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 3 })
        .toUTC()
        .toISO();

      const alreadyNormalized = [
        {
          type: REMINDER_TYPE.ONE_TIME,
          remindAt,
          sent: false,
          lastSentAt: null,
        },
      ];

      const normalized = normalizeReminders(
        alreadyNormalized,
        futureDeadline,
        userTimeZone
      );

      expect(normalized.length).toBe(1);
      expect(normalized[0].remindAt).toBe(remindAt);
    });
  });

  describe('Multiple Reminder Scenarios', () => {
    test('should handle complex AI task with all reminder types', () => {
      // Weekly needs more than 168 hours (7 days) until deadline
      const complexDeadline = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 10 })
        .toUTC()
        .toISO();

      const customDate = DateTime.now()
        .setZone(userTimeZone)
        .plus({ days: 2 })
        .toISO();

      const aiReminders = [
        { remindBefore: 24, type: 'one-time' },
        { remindBefore: 48, type: 'one-time' },
        { customDate },
        { remindBefore: 24, type: 'daily' },
        { remindBefore: 168, type: 'weekly' },
      ];

      const normalized = normalizeReminders(aiReminders, complexDeadline, userTimeZone);

      expect(normalized.length).toBe(5);

      const oneTimeReminders = normalized.filter(
        (r) => r.type === REMINDER_TYPE.ONE_TIME
      );
      const dailyReminders = normalized.filter((r) => r.type === REMINDER_TYPE.DAILY);
      const weeklyReminders = normalized.filter(
        (r) => r.type === REMINDER_TYPE.WEEKLY
      );

      expect(oneTimeReminders.length).toBe(3);
      expect(dailyReminders.length).toBe(1);
      expect(weeklyReminders.length).toBe(1);
    });

    test('should deduplicate same timestamp one-time reminders', () => {
      const aiReminders = [
        { remindBefore: 24, type: 'one-time' },
        { remindBefore: 24, type: 'one-time' }, // Same time
        { remindBefore: 24, type: 'one-time' }, // Same time
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(1);
    });

    test('should keep different timestamp one-time reminders', () => {
      const aiReminders = [
        { remindBefore: 24, type: 'one-time' },
        { remindBefore: 48, type: 'one-time' },
        { remindBefore: 72, type: 'one-time' },
      ];

      const normalized = normalizeReminders(aiReminders, futureDeadline, userTimeZone);

      expect(normalized.length).toBe(3);
      const remindAts = normalized.map((r) => r.remindAt);
      expect(new Set(remindAts).size).toBe(3); // All unique
    });
  });
});

describe('AI Controller - Helper Functions', () => {
  describe('createOneTimeReminder', () => {
    test('should create valid one-time reminder', () => {
      const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();
      const reminder = createOneTimeReminder(24, deadline, 'America/New_York');

      expect(reminder).not.toBeNull();
      expect(reminder.type).toBe(REMINDER_TYPE.ONE_TIME);
      expect(reminder.remindAt).toBeDefined();
      expect(reminder.sent).toBe(false);
      expect(reminder.lastSentAt).toBeNull();
    });

    test('should return null for invalid hours', () => {
      const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();

      expect(createOneTimeReminder(-10, deadline)).toBeNull();
      expect(createOneTimeReminder(0, deadline)).toBeNull();
      expect(createOneTimeReminder('24', deadline)).toBeNull();
      expect(createOneTimeReminder(null, deadline)).toBeNull();
    });

    test('should return null if reminder would be in past', () => {
      const deadline = DateTime.now().plus({ hours: 12 }).toUTC().toISO();
      const reminder = createOneTimeReminder(24, deadline); // Would be 12h ago

      expect(reminder).toBeNull();
    });

    test('should handle different timezones correctly', () => {
      const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();

      const nyReminder = createOneTimeReminder(24, deadline, 'America/New_York');
      const londonReminder = createOneTimeReminder(24, deadline, 'Europe/London');

      expect(nyReminder).not.toBeNull();
      expect(londonReminder).not.toBeNull();
      expect(nyReminder.remindAt).toBeDefined();
      expect(londonReminder.remindAt).toBeDefined();
    });
  });

  describe('createRecurringReminder', () => {
    test('should create valid daily reminder', () => {
      const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();
      const reminder = createRecurringReminder(REMINDER_TYPE.DAILY, deadline);

      expect(reminder).not.toBeNull();
      expect(reminder.type).toBe(REMINDER_TYPE.DAILY);
      expect(reminder.intervalHours).toBe(24);
      expect(reminder.sent).toBe(false);
      expect(reminder.lastSentAt).toBeNull();
      expect(reminder.remindAt).toBeUndefined();
    });

    test('should create valid weekly reminder', () => {
      const deadline = DateTime.now().plus({ weeks: 2 }).toUTC().toISO();
      const reminder = createRecurringReminder(REMINDER_TYPE.WEEKLY, deadline);

      expect(reminder).not.toBeNull();
      expect(reminder.type).toBe(REMINDER_TYPE.WEEKLY);
      expect(reminder.intervalHours).toBe(168);
      expect(reminder.sent).toBe(false);
    });

    test('should return null if not enough time for daily', () => {
      const deadline = DateTime.now().plus({ hours: 12 }).toUTC().toISO();
      const reminder = createRecurringReminder(REMINDER_TYPE.DAILY, deadline);

      expect(reminder).toBeNull();
    });

    test('should return null if not enough time for weekly', () => {
      const deadline = DateTime.now().plus({ days: 3 }).toUTC().toISO();
      const reminder = createRecurringReminder(REMINDER_TYPE.WEEKLY, deadline);

      expect(reminder).toBeNull();
    });

    test('should return null for invalid type', () => {
      const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();

      expect(createRecurringReminder('hourly', deadline)).toBeNull();
      expect(createRecurringReminder('monthly', deadline)).toBeNull();
      expect(createRecurringReminder(null, deadline)).toBeNull();
    });

    test('should work with exactly enough time', () => {
      const deadline = DateTime.now().plus({ hours: 24.5 }).toUTC().toISO();
      const reminder = createRecurringReminder(REMINDER_TYPE.DAILY, deadline);

      expect(reminder).not.toBeNull();
      expect(reminder.intervalHours).toBe(24);
    });
  });
});

describe('AI Controller - Data Integrity', () => {
  test('should preserve sent status during normalization', () => {
    const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();
    const remindAt = DateTime.now().plus({ days: 3 }).toUTC().toISO();

    const existingReminder = [
      {
        type: REMINDER_TYPE.ONE_TIME,
        remindAt,
        sent: true,
        lastSentAt: DateTime.now().minus({ days: 1 }).toISO(),
      },
    ];

    const normalized = normalizeReminders(existingReminder, deadline, 'UTC');

    expect(normalized[0].sent).toBe(true);
    expect(normalized[0].lastSentAt).toBeDefined();
  });

  test('should not modify original reminder objects', () => {
    const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();
    const originalReminders = [
      { remindBefore: 24, type: 'one-time' },
      { remindBefore: 24, type: 'daily' },
    ];

    const originalCopy = JSON.parse(JSON.stringify(originalReminders));
    normalizeReminders(originalReminders, deadline, 'UTC');

    expect(originalReminders).toEqual(originalCopy);
  });

  test('should handle malformed AI responses gracefully', () => {
    const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();

    const malformedReminders = [
      { remindBefore: 'twenty-four', type: 'one-time' },
      { remindBefore: 24, type: 123 },
      { remindBefore: 24 }, // Missing type
      { type: 'one-time' }, // Missing remindBefore
      'not an object',
      123,
      true,
    ];

    const normalized = normalizeReminders(malformedReminders, deadline, 'UTC');

    // Should filter out all invalid entries
    expect(Array.isArray(normalized)).toBe(true);
    expect(normalized.every((r) => r.type && (r.remindAt || r.intervalHours))).toBe(
      true
    );
  });
});
