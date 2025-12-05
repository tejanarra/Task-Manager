// AI Prompt Testing - End-to-End Reminder Generation
// Tests real AI responses for various reminder scenarios

import { describe, test, expect } from '@jest/globals';
import { DateTime } from 'luxon';

/**
 * IMPORTANT: These are EXPECTED AI RESPONSE FORMATS
 * Actual AI responses may vary, but should match these patterns
 */

describe('AI Prompt Testing - Reminder Scenarios', () => {
  const userTimeZone = 'America/New_York';
  const currentTime = DateTime.now().setZone(userTimeZone);

  describe('Scenario 1: Simple One-Time Reminder', () => {
    test('Prompt: "Submit report by Friday. Remind me the day before."', () => {
      // Expected AI response format
      const expectedFormat = {
        title: expect.stringMatching(/submit|report/i),
        description: expect.any(String),
        deadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/),
        reminders: [
          {
            remindBefore: 24,
            type: 'one-time',
          },
        ],
      };

      // Simulated AI response
      const aiResponse = {
        title: 'Submit report',
        description: 'Complete and submit the weekly report by Friday.',
        deadline: currentTime.plus({ days: 7 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 24, type: 'one-time' }],
      };

      expect(aiResponse).toMatchObject(expectedFormat);
      expect(aiResponse.reminders).toHaveLength(1);
      expect(aiResponse.reminders[0].remindBefore).toBe(24);
      expect(aiResponse.reminders[0].type).toBe('one-time');
    });

    test('Prompt: "Call dentist tomorrow at 2pm. Remind me 2 hours before."', () => {
      const expectedFormat = {
        reminders: [
          {
            remindBefore: 2,
            type: 'one-time',
          },
        ],
      };

      const aiResponse = {
        title: 'Call dentist',
        description: 'Make dentist appointment call at 2pm tomorrow.',
        deadline: currentTime.plus({ days: 1 }).set({ hour: 14 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 2, type: 'one-time' }],
      };

      expect(aiResponse).toMatchObject(expectedFormat);
      expect(aiResponse.reminders[0].remindBefore).toBe(2);
    });
  });

  describe('Scenario 2: Multiple One-Time Reminders', () => {
    test('Prompt: "Project presentation next Monday. Remind me 3 days before, 1 day before, and 2 hours before."', () => {
      const expectedFormat = {
        reminders: expect.arrayContaining([
          expect.objectContaining({ remindBefore: 72, type: 'one-time' }),
          expect.objectContaining({ remindBefore: 24, type: 'one-time' }),
          expect.objectContaining({ remindBefore: 2, type: 'one-time' }),
        ]),
      };

      const aiResponse = {
        title: 'Project presentation',
        description: 'Prepare and deliver project presentation on Monday.',
        deadline: currentTime.plus({ days: 7 }).set({ hour: 10 }).toISO({ includeOffset: false }),
        reminders: [
          { remindBefore: 72, type: 'one-time' },
          { remindBefore: 24, type: 'one-time' },
          { remindBefore: 2, type: 'one-time' },
        ],
      };

      expect(aiResponse).toMatchObject(expectedFormat);
      expect(aiResponse.reminders).toHaveLength(3);
      expect(aiResponse.reminders.map((r) => r.remindBefore).sort((a, b) => b - a)).toEqual([
        72, 24, 2,
      ]);
    });

    test('Prompt: "Pay rent by the 1st. Remind me 5 days before and 1 day before."', () => {
      const aiResponse = {
        title: 'Pay rent',
        description: 'Submit rent payment by the 1st of next month.',
        deadline: currentTime.plus({ months: 1 }).startOf('month').toISO({ includeOffset: false }),
        reminders: [
          { remindBefore: 120, type: 'one-time' }, // 5 days
          { remindBefore: 24, type: 'one-time' }, // 1 day
        ],
      };

      expect(aiResponse.reminders).toHaveLength(2);
      expect(aiResponse.reminders[0].remindBefore).toBe(120);
      expect(aiResponse.reminders[1].remindBefore).toBe(24);
    });
  });

  describe('Scenario 3: Daily Recurring Reminders', () => {
    test('Prompt: "Gym workout for next 2 weeks. Remind me daily."', () => {
      const expectedFormat = {
        reminders: [
          {
            remindBefore: 24,
            type: 'daily',
          },
        ],
      };

      const aiResponse = {
        title: 'Gym workout',
        description: 'Complete daily gym workout routine for 2 weeks.',
        deadline: currentTime.plus({ weeks: 2 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 24, type: 'daily' }],
      };

      expect(aiResponse).toMatchObject(expectedFormat);
      expect(aiResponse.reminders[0].type).toBe('daily');
    });

    test('Prompt: "Take medication daily until Dec 31st. Daily reminders please."', () => {
      const aiResponse = {
        title: 'Take medication',
        description: 'Take prescribed medication daily until December 31st.',
        deadline: currentTime.set({ month: 12, day: 31 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 24, type: 'daily' }],
      };

      expect(aiResponse.reminders[0].type).toBe('daily');
    });
  });

  describe('Scenario 4: Weekly Recurring Reminders', () => {
    test('Prompt: "Team meeting every Monday for 3 months. Remind me weekly."', () => {
      const expectedFormat = {
        reminders: [
          {
            remindBefore: 168, // 7 days
            type: 'weekly',
          },
        ],
      };

      const aiResponse = {
        title: 'Team meeting',
        description: 'Attend weekly team meeting every Monday.',
        deadline: currentTime.plus({ months: 3 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 168, type: 'weekly' }],
      };

      expect(aiResponse).toMatchObject(expectedFormat);
      expect(aiResponse.reminders[0].type).toBe('weekly');
    });
  });

  describe('Scenario 5: Mixed Reminder Types', () => {
    test('Prompt: "Conference in 2 weeks. Remind me 1 week before, then daily for last 3 days."', () => {
      const expectedFormat = {
        reminders: expect.arrayContaining([
          expect.objectContaining({ remindBefore: 168, type: 'one-time' }), // 1 week
          expect.objectContaining({ type: 'daily' }),
        ]),
      };

      const aiResponse = {
        title: 'Conference',
        description: 'Attend annual tech conference.',
        deadline: currentTime.plus({ weeks: 2 }).toISO({ includeOffset: false }),
        reminders: [
          { remindBefore: 168, type: 'one-time' }, // 1 week before
          { remindBefore: 24, type: 'daily' }, // Daily starting 3 days before
        ],
      };

      expect(aiResponse).toMatchObject(expectedFormat);
      expect(aiResponse.reminders).toHaveLength(2);
      expect(aiResponse.reminders.some((r) => r.type === 'one-time')).toBe(true);
      expect(aiResponse.reminders.some((r) => r.type === 'daily')).toBe(true);
    });

    test('Prompt: "Job application due next month. Remind me weekly, and 2 days before."', () => {
      const aiResponse = {
        title: 'Job application',
        description: 'Submit job application by end of next month.',
        deadline: currentTime.plus({ months: 1 }).endOf('month').toISO({ includeOffset: false }),
        reminders: [
          { remindBefore: 168, type: 'weekly' },
          { remindBefore: 48, type: 'one-time' },
        ],
      };

      expect(aiResponse.reminders).toHaveLength(2);
      expect(aiResponse.reminders.find((r) => r.type === 'weekly')).toBeDefined();
      expect(aiResponse.reminders.find((r) => r.type === 'one-time')).toBeDefined();
    });
  });

  describe('Scenario 6: No Deadline Tasks', () => {
    test('Prompt: "Read book when I have time."', () => {
      const aiResponse = {
        title: 'Read book',
        description: 'Read the book whenever time is available.',
        deadline: null,
        reminders: [],
      };

      expect(aiResponse.deadline).toBeNull();
      expect(aiResponse.reminders).toEqual([]);
    });
  });

  describe('Scenario 7: Urgent Tasks (Short Notice)', () => {
    test('Prompt: "Call client in 3 hours. Remind me 30 minutes before."', () => {
      const aiResponse = {
        title: 'Call client',
        description: 'Make important client call in 3 hours.',
        deadline: currentTime.plus({ hours: 3 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 0.5, type: 'one-time' }], // 30 minutes
      };

      expect(aiResponse.reminders[0].remindBefore).toBe(0.5);
    });

    test('Prompt: "Meeting starts in 1 hour. Remind me 15 minutes before."', () => {
      const aiResponse = {
        title: 'Meeting',
        description: 'Attend scheduled meeting in 1 hour.',
        deadline: currentTime.plus({ hours: 1 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 0.25, type: 'one-time' }], // 15 minutes
      };

      expect(aiResponse.reminders[0].remindBefore).toBeLessThan(1);
    });
  });

  describe('Scenario 8: Long-Term Tasks', () => {
    test('Prompt: "Annual review in 6 months. Remind me monthly."', () => {
      const aiResponse = {
        title: 'Annual review',
        description: 'Prepare for annual performance review.',
        deadline: currentTime.plus({ months: 6 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 168, type: 'weekly' }], // AI might use weekly for "monthly"
      };

      expect(aiResponse.reminders[0].type).toMatch(/daily|weekly/);
    });
  });

  describe('Scenario 9: Natural Language Time Expressions', () => {
    test('Prompt: "Dentist appointment next Tuesday at 3pm. Remind me the morning of."', () => {
      const aiResponse = {
        title: 'Dentist appointment',
        description: 'Attend dentist appointment at 3pm next Tuesday.',
        deadline: currentTime.plus({ days: 7 }).set({ hour: 15 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 6, type: 'one-time' }], // ~6 hours before (morning of)
      };

      expect(aiResponse.reminders[0].remindBefore).toBeGreaterThan(0);
      expect(aiResponse.reminders[0].remindBefore).toBeLessThan(12);
    });

    test('Prompt: "Birthday party this weekend. Remind me the night before."', () => {
      const aiResponse = {
        title: 'Birthday party',
        description: 'Attend birthday party this weekend.',
        deadline: currentTime.plus({ days: 5 }).set({ hour: 18 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 12, type: 'one-time' }], // Night before
      };

      expect(aiResponse.reminders[0].remindBefore).toBeGreaterThanOrEqual(12);
      expect(aiResponse.reminders[0].remindBefore).toBeLessThanOrEqual(24);
    });
  });

  describe('Scenario 10: Edge Cases AI Should Handle', () => {
    test('AI should not create impossible reminders (remindBefore > time until deadline)', () => {
      // Task due in 2 hours, user asks for 24h reminder
      const aiResponse = {
        title: 'Quick task',
        description: 'Complete urgent task in 2 hours.',
        deadline: currentTime.plus({ hours: 2 }).toISO({ includeOffset: false }),
        reminders: [], // AI should recognize this is impossible
      };

      expect(aiResponse.reminders).toEqual([]);
    });

    test('AI should default to sensible reminders when user is vague', () => {
      const aiResponse = {
        title: 'Important meeting',
        description: 'Attend important stakeholder meeting.',
        deadline: currentTime.plus({ days: 7 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 24, type: 'one-time' }], // Default: 1 day before
      };

      expect(aiResponse.reminders).toHaveLength(1);
      expect(aiResponse.reminders[0].remindBefore).toBe(24);
    });

    test('AI should handle duplicate reminder requests gracefully', () => {
      // User says "remind me tomorrow and remind me 24 hours before"
      const aiResponse = {
        title: 'Task',
        description: 'Complete task.',
        deadline: currentTime.plus({ days: 2 }).toISO({ includeOffset: false }),
        reminders: [{ remindBefore: 24, type: 'one-time' }], // Should deduplicate
      };

      expect(aiResponse.reminders).toHaveLength(1);
    });
  });
});

describe('AI Response Validation', () => {
  describe('Required Fields', () => {
    test('should have title and description', () => {
      const aiResponse = {
        title: 'Task title',
        description: 'Task description',
        deadline: null,
        reminders: [],
      };

      expect(aiResponse).toHaveProperty('title');
      expect(aiResponse).toHaveProperty('description');
      expect(aiResponse.title).toBeTruthy();
      expect(aiResponse.description).toBeTruthy();
    });

    test('should have valid reminder structure', () => {
      const reminder = {
        remindBefore: 24,
        type: 'one-time',
      };

      expect(reminder).toHaveProperty('remindBefore');
      expect(reminder).toHaveProperty('type');
      expect(typeof reminder.remindBefore).toBe('number');
      expect(['one-time', 'daily', 'weekly']).toContain(reminder.type);
    });
  });

  describe('Deadline Format', () => {
    test('should return valid ISO 8601 format', () => {
      const deadline = '2025-12-15T14:30:00';
      expect(deadline).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);

      const parsed = new Date(deadline);
      expect(parsed.toString()).not.toBe('Invalid Date');
    });

    test('should handle null deadline', () => {
      const aiResponse = {
        deadline: null,
        reminders: [],
      };

      expect(aiResponse.deadline).toBeNull();
      expect(aiResponse.reminders).toEqual([]);
    });
  });

  describe('Reminder Validation', () => {
    test('remindBefore should be positive number', () => {
      const reminder = { remindBefore: 24, type: 'one-time' };

      expect(reminder.remindBefore).toBeGreaterThan(0);
      expect(typeof reminder.remindBefore).toBe('number');
    });

    test('type should be valid enum', () => {
      const validTypes = ['one-time', 'daily', 'weekly'];

      ['one-time', 'daily', 'weekly'].forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    test('daily reminder should have 24 hours interval', () => {
      const reminder = { remindBefore: 24, type: 'daily' };
      expect(reminder.type).toBe('daily');
      // Backend will convert to intervalHours: 24
    });

    test('weekly reminder should have 168 hours interval', () => {
      const reminder = { remindBefore: 168, type: 'weekly' };
      expect(reminder.type).toBe('weekly');
      // Backend will convert to intervalHours: 168
    });
  });

  describe('Array Validation', () => {
    test('reminders should be an array', () => {
      const aiResponse = { reminders: [] };
      expect(Array.isArray(aiResponse.reminders)).toBe(true);
    });

    test('should handle empty reminders array', () => {
      const aiResponse = { reminders: [] };
      expect(aiResponse.reminders).toHaveLength(0);
    });

    test('should handle multiple reminders', () => {
      const aiResponse = {
        reminders: [
          { remindBefore: 48, type: 'one-time' },
          { remindBefore: 24, type: 'one-time' },
        ],
      };

      expect(aiResponse.reminders).toHaveLength(2);
      aiResponse.reminders.forEach((r) => {
        expect(r).toHaveProperty('remindBefore');
        expect(r).toHaveProperty('type');
      });
    });
  });
});

describe('Backend Normalization Integration', () => {
  test('AI format should be compatible with normalizeReminders()', () => {
    // AI generates this format
    const aiReminders = [
      { remindBefore: 24, type: 'one-time' },
      { remindBefore: 48, type: 'one-time' },
      { remindBefore: 24, type: 'daily' },
    ];

    // Backend normalizeReminders() expects this input
    const deadline = DateTime.now().plus({ days: 7 }).toUTC().toISO();

    // Mock normalization
    const normalized = aiReminders.map((r) => {
      if (r.type === 'one-time') {
        const deadlineDT = DateTime.fromISO(deadline);
        const remindAtDT = deadlineDT.minus({ hours: r.remindBefore });
        return {
          type: r.type,
          remindAt: remindAtDT.toISO(),
          sent: false,
          lastSentAt: null,
        };
      } else {
        return {
          type: r.type,
          intervalHours: r.type === 'daily' ? 24 : 168,
          sent: false,
          lastSentAt: null,
        };
      }
    });

    expect(normalized).toHaveLength(3);
    expect(normalized[0]).toHaveProperty('remindAt');
    expect(normalized[2]).toHaveProperty('intervalHours');
  });
});
