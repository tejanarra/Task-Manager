// src/validation/reminders.js
import { z } from "zod";

export const ReminderTypeEnum = z.enum(["ONE_TIME", "DAILY", "WEEKLY"]);

const oneTime = z.object({
  type: z.literal("ONE_TIME"),
  triggerAtUTC: z.string().datetime(),
});

const daily = z.object({
  type: z.literal("DAILY"),
  hourOfDayUTC: z.number().int().min(0).max(23),
});

const weekly = z.object({
  type: z.literal("WEEKLY"),
  hourOfDayUTC: z.number().int().min(0).max(23),
  dayOfWeek: z.number().int().min(0).max(6),
});

export const reminderInputSchema = z
  .discriminatedUnion("type", [oneTime, daily, weekly])
  .extend({
    timezone: z.string().optional(), // IANA override
  });

export const updateRemindersBodySchema = z.union([
  z.object({
    action: z.literal("overwrite"),
    reminders: z.array(reminderInputSchema),
  }),
  z.object({
    action: z.literal("append"),
    reminders: z.array(reminderInputSchema).min(1),
  }),
]);
