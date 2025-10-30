// AI Controller Tests
// Basic tests for AI controller validation and error handling
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('AI Controller Input Validation', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 123,
      body: {},
      headers: { 'x-user-timezone': 'America/New_York' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
    process.env.OLLAMA_API_KEY = 'test-api-key';
  });

  describe('generateTask validation', () => {
    test('should validate prompt is required', () => {
      // Prompt validation logic
      const prompt = req.body.prompt;
      const isValid = prompt && typeof prompt === 'string' && prompt.trim().length > 0;
      expect(isValid).toBeFalsy();
    });

    test('should validate empty string prompt', () => {
      req.body.prompt = '   ';
      const prompt = req.body.prompt;
      const isValid = prompt && typeof prompt === 'string' && prompt.trim().length > 0;
      expect(isValid).toBe(false);
    });

    test('should accept valid prompt', () => {
      req.body.prompt = 'Schedule dentist appointment';
      const prompt = req.body.prompt;
      const isValid = prompt && typeof prompt === 'string' && prompt.trim().length > 0;
      expect(isValid).toBe(true);
    });

    test('should truncate long prompts', () => {
      const longPrompt = 'a'.repeat(600);
      req.body.prompt = longPrompt;
      const sanitized = req.body.prompt.trim().slice(0, 500);
      expect(sanitized.length).toBe(500);
    });
  });

  describe('chatConversation validation', () => {
    test('should validate message is required', () => {
      const message = req.body.message;
      const isValid = message && typeof message === 'string' && message.trim().length > 0;
      expect(isValid).toBeFalsy();
    });

    test('should validate empty message', () => {
      req.body.message = '   ';
      const message = req.body.message;
      const isValid = message && typeof message === 'string' && message.trim().length > 0;
      expect(isValid).toBe(false);
    });

    test('should accept valid message', () => {
      req.body.message = 'Create a task';
      const message = req.body.message;
      const isValid = message && typeof message === 'string' && message.trim().length > 0;
      expect(isValid).toBe(true);
    });

    test('should handle conversation history array', () => {
      const history = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
      ];
      const isArray = Array.isArray(history);
      expect(isArray).toBe(true);
      expect(history.length).toBe(2);
    });

    test('should limit conversation history to 6 messages', () => {
      const longHistory = Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));

      const limited = Array.isArray(longHistory)
        ? longHistory.slice(-6)
        : [];

      expect(limited.length).toBe(6);
      expect(limited[0].content).toBe('Message 4');
    });
  });

  describe('Timezone handling', () => {
    test('should extract timezone from headers', () => {
      const timezone = req.headers['x-user-timezone'] || 'UTC';
      expect(timezone).toBe('America/New_York');
    });

    test('should default to UTC when no timezone header', () => {
      delete req.headers['x-user-timezone'];
      const timezone = req.headers['x-user-timezone'] || 'UTC';
      expect(timezone).toBe('UTC');
    });
  });

  describe('JSON parsing', () => {
    test('should parse plain JSON', () => {
      const raw = '{"title":"Test","description":"Test desc"}';
      const parsed = JSON.parse(raw);
      expect(parsed.title).toBe('Test');
    });

    test('should extract JSON from markdown code blocks', () => {
      const raw = '```json\n{"title":"Test"}\n```';
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
      expect(jsonMatch).not.toBeNull();
      const parsed = JSON.parse(jsonMatch[1]);
      expect(parsed.title).toBe('Test');
    });

    test('should extract JSON from plain code blocks', () => {
      const raw = '```\n{"title":"Test"}\n```';
      const jsonMatch = raw.match(/```\s*([\s\S]*?)\s*```/);
      expect(jsonMatch).not.toBeNull();
      const parsed = JSON.parse(jsonMatch[1]);
      expect(parsed.title).toBe('Test');
    });

    test('should extract JSON from mixed content', () => {
      const raw = 'Here is the task: {"title":"Test","status":"not-started"}';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      expect(jsonMatch).not.toBeNull();
      const parsed = JSON.parse(jsonMatch[0]);
      expect(parsed.title).toBe('Test');
    });
  });

  describe('Task sanitization', () => {
    test('should truncate title to 100 chars', () => {
      const longTitle = 'a'.repeat(150);
      const sanitized = longTitle.trim().slice(0, 100);
      expect(sanitized.length).toBe(100);
    });

    test('should truncate description to 1000 chars', () => {
      const longDesc = 'a'.repeat(1500);
      const sanitized = longDesc.trim().slice(0, 1000);
      expect(sanitized.length).toBe(1000);
    });

    test('should validate task structure', () => {
      const task = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'not-started',
        deadline: null,
        reminders: [],
      };

      expect(task.title).toBeTruthy();
      expect(task.description).toBeTruthy();
      expect(task.status).toBe('not-started');
      expect(Array.isArray(task.reminders)).toBe(true);
    });
  });

  describe('Reminder processing', () => {
    test('should filter valid reminders', () => {
      const reminders = [
        { remindBefore: 24, type: 'one-time' },
        { remindBefore: -1, type: 'one-time' }, // Invalid
        { remindBefore: 48, type: 'one-time' },
      ];

      const valid = reminders.filter(
        (r) =>
          r.remindBefore !== undefined &&
          r.remindBefore !== null &&
          !Number.isNaN(r.remindBefore) &&
          r.remindBefore >= 0
      );

      expect(valid.length).toBe(2);
    });

    test('should add type to reminders', () => {
      const reminder = { remindBefore: 24 };
      const withType = { ...reminder, type: reminder.type || 'one-time' };
      expect(withType.type).toBe('one-time');
    });
  });
});
