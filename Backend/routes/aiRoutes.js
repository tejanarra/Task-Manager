import express from "express";
import { Ollama } from "ollama";

const router = express.Router();

// Helper function to validate and normalize reminders
const normalizeReminders = (reminders, deadline, promptContext = "") => {
  if (!Array.isArray(reminders) || !deadline) return [];

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffInHours = (deadlineDate - now) / (1000 * 60 * 60);

  if (diffInHours <= 0) return [];

  const normalized = [];
  const seen = new Set(); // Prevent duplicate reminders

  // Check if user wants daily reminders from the prompt
  const wantsDaily = /daily|every\s*day|everyday|each\s*day/i.test(
    promptContext
  );
  const wantsWeekly = /weekly|every\s*week|each\s*week/i.test(promptContext);

  // If daily reminders are requested, generate them
  if (wantsDaily && diffInHours >= 24) {
    const maxDays = Math.floor(diffInHours / 24);
    for (let day = 1; day <= maxDays; day++) {
      const hours = day * 24;
      normalized.push({
        remindBefore: hours,
        sent: false,
        type: "daily",
        dayNumber: day,
      });
    }
    return normalized; // Return only daily reminders
  }

  // If weekly reminders are requested, generate them
  if (wantsWeekly && diffInHours >= 168) {
    const maxWeeks = Math.floor(diffInHours / (24 * 7));
    for (let week = 1; week <= maxWeeks; week++) {
      const hours = week * 24 * 7;
      normalized.push({
        remindBefore: hours,
        sent: false,
        type: "weekly",
        weekNumber: week,
      });
    }
    return normalized; // Return only weekly reminders
  }

  // Otherwise, process the reminders array normally
  reminders.forEach((reminder) => {
    // Skip invalid reminders
    if (!reminder || typeof reminder !== "object") return;

    const remindBefore = Number(reminder.remindBefore);
    if (isNaN(remindBefore) || remindBefore <= 0 || remindBefore > diffInHours)
      return;

    const baseReminder = {
      remindBefore,
      sent: false,
    };

    // Handle different reminder types
    if (reminder.type === "daily") {
      const maxDays = Math.floor(diffInHours / 24);
      for (let day = 1; day <= maxDays; day++) {
        const hours = day * 24;
        const key = `daily-${hours}`;
        if (!seen.has(key)) {
          normalized.push({
            ...baseReminder,
            remindBefore: hours,
            type: "daily",
            dayNumber: day,
          });
          seen.add(key);
        }
      }
    } else if (reminder.type === "weekly") {
      const maxWeeks = Math.floor(diffInHours / (24 * 7));
      for (let week = 1; week <= maxWeeks; week++) {
        const hours = week * 24 * 7;
        const key = `weekly-${hours}`;
        if (!seen.has(key)) {
          normalized.push({
            ...baseReminder,
            remindBefore: hours,
            type: "weekly",
            weekNumber: week,
          });
          seen.add(key);
        }
      }
    } else {
      // One-time reminder
      const key = `onetime-${remindBefore}`;
      if (!seen.has(key)) {
        normalized.push({
          ...baseReminder,
          customDate: reminder.customDate || undefined,
        });
        seen.add(key);
      }
    }
  });

  return normalized;
};

// Validate deadline is in the future
const validateDeadline = (deadline) => {
  if (!deadline) return null;

  try {
    const deadlineDate = new Date(deadline);

    // Check if date is valid
    if (isNaN(deadlineDate.getTime())) return null;

    // Must be at least 1 hour in the future
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (deadlineDate <= oneHourFromNow) return null;

    // Don't allow dates more than 2 years in the future
    const twoYearsFromNow = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
    if (deadlineDate > twoYearsFromNow) return null;

    return deadlineDate.toISOString();
  } catch (error) {
    return null;
  }
};

// Parse natural language dates to ISO format
const parseNaturalDate = (dateStr, conversationContext = "") => {
  if (!dateStr || typeof dateStr !== "string") return null;

  const now = new Date();
  const lowerStr = dateStr.toLowerCase().trim();
  const fullContext = (conversationContext + " " + lowerStr).toLowerCase();

  // Extract time if mentioned (e.g., "7pm", "19:00", "7:00 PM")
  let targetHour = 18; // Default to 6 PM
  let targetMinute = 0;

  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
    /(\d{1,2}):(\d{2})/,
  ];

  for (const pattern of timePatterns) {
    const timeMatch = fullContext.match(pattern);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === "pm" && hour < 12) hour += 12;
      if (meridiem === "am" && hour === 12) hour = 0;

      targetHour = hour;
      targetMinute = minute;
      break;
    }
  }

  // Handle "in X [units]" patterns
  const inPatterns = [
    { pattern: /in\s*(\d+)\s*months?/i, unit: "month" },
    { pattern: /in\s*(\d+)\s*weeks?/i, unit: "week" },
    { pattern: /in\s*(\d+)\s*days?/i, unit: "day" },
    { pattern: /in\s*(\d+)\s*hours?/i, unit: "hour" },
  ];

  for (const { pattern, unit } of inPatterns) {
    const match = fullContext.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      const futureDate = new Date(now);

      switch (unit) {
        case "month":
          futureDate.setMonth(futureDate.getMonth() + value);
          break;
        case "week":
          futureDate.setDate(futureDate.getDate() + value * 7);
          break;
        case "day":
          futureDate.setDate(futureDate.getDate() + value);
          break;
        case "hour":
          futureDate.setHours(futureDate.getHours() + value);
          break;
      }

      // Set specific time if mentioned
      if (unit !== "hour") {
        futureDate.setHours(targetHour, targetMinute, 0, 0);
      }

      return futureDate.toISOString();
    }
  }

  // Handle relative dates
  const relativePatterns = [
    { pattern: /tomorrow/i, days: 1 },
    { pattern: /next week/i, days: 7 },
    { pattern: /next month/i, months: 1 },
    { pattern: /(\d+)\s*days?/i, multiplier: 1 },
    { pattern: /(\d+)\s*weeks?/i, multiplier: 7 },
  ];

  for (const { pattern, days, months, multiplier } of relativePatterns) {
    const match = lowerStr.match(pattern);
    if (match) {
      const futureDate = new Date(now);

      if (months) {
        futureDate.setMonth(futureDate.getMonth() + months);
      } else if (days !== undefined) {
        futureDate.setDate(futureDate.getDate() + days);
      } else if (multiplier) {
        const value = parseInt(match[1]);
        futureDate.setDate(futureDate.getDate() + value * multiplier);
      }

      futureDate.setHours(targetHour, targetMinute, 0, 0);
      return futureDate.toISOString();
    }
  }

  // Handle specific days of week (e.g., "next Friday")
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const nextDayPattern =
    /next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i;
  const dayMatch = lowerStr.match(nextDayPattern);

  if (dayMatch) {
    const targetDay = daysOfWeek.indexOf(dayMatch[1].toLowerCase());
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;

    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysToAdd);
    futureDate.setHours(targetHour, targetMinute, 0, 0);
    return futureDate.toISOString();
  }

  // Try to parse as ISO or standard date
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime()) && parsed > now) {
      // Preserve time if specified, otherwise use target time
      if (!dateStr.includes(":")) {
        parsed.setHours(targetHour, targetMinute, 0, 0);
      }
      return parsed.toISOString();
    }
  } catch (e) {
    // Invalid date format
  }

  return null;
};

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Valid prompt is required" });
  }

  // Sanitize prompt
  const sanitizedPrompt = prompt.trim().slice(0, 500);

  try {
    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    // Get current date/time for context
    const now = new Date();
    const currentDateTime = now.toISOString();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages: [
        {
          role: "system",
          content: `You are a task management assistant that creates realistic, actionable tasks. 

IMPORTANT CONTEXT:
- Current date/time: ${currentDateTime}
- Today is: ${dayOfWeek}, ${dateStr}

Your job is to analyze user requests and create well-structured tasks with appropriate deadlines and reminders.

DEADLINE RULES:
- If user mentions "today", set deadline to later today (e.g., 6 PM)
- If user mentions "tomorrow", set deadline to tomorrow at a reasonable time
- If user mentions specific dates (e.g., "next Friday", "in 3 days"), calculate the exact ISO date
- If user mentions time-sensitive words (urgent, ASAP, soon), set deadline within 24-48 hours
- If no time indication, use null for deadline
- Always use ISO 8601 format: YYYY-MM-DDTHH:MM:SS.000Z
- Ensure deadline is at least 1 hour in the future

REMINDER RULES:
- Only create reminders if there's a deadline
- If user explicitly requests "daily" or "everyday" reminders: return [{"remindBefore": 24, "type": "daily"}] and the system will generate all daily reminders
- If user explicitly requests "weekly" reminders: return [{"remindBefore": 168, "type": "weekly"}] and the system will generate all weekly reminders
- For standard tasks without daily/weekly requests:
  * Urgent tasks (<48 hours away): one reminder 2-4 hours before
  * Short-term tasks (2-7 days): one reminder 24 hours before
  * Medium-term tasks (1-4 weeks): one reminder 48-72 hours before
  * Long-term tasks (>1 month): one reminder 1 week before
- remindBefore is always a NUMBER of hours before the deadline
- type should be "one-time" for standard reminders, "daily" for daily requests, "weekly" for weekly requests

RESPONSE FORMAT:
Return ONLY valid JSON, no markdown, no explanations. Structure:
{
  "title": "concise task title (max 80 chars)",
  "description": "detailed steps to complete the task (2-4 sentences)",
  "status": "not-started",
  "deadline": "ISO date string or null",
  "reminders": [{"remindBefore": <hours_number>, "type": "one-time"}]
}`,
        },
        {
          role: "user",
          content: `Create a task for: "${sanitizedPrompt}"

IMPORTANT: If the prompt contains a conversation (lines with "User:" and "Assistant:"), extract all the key details:
- Task objective from the user's messages
- Deadline mentioned anywhere in the conversation
- Time preferences (morning, evening, specific times)
- Frequency (daily, weekly, one-time)
- Any other requirements discussed

Examples of good responses:

1. User: "dentist appointment next Friday at 2pm"
{
  "title": "Dentist Appointment",
  "description": "Attend scheduled dentist appointment for routine checkup. Remember to bring insurance card and arrive 10 minutes early for paperwork.",
  "status": "not-started",
  "deadline": "2025-10-31T14:00:00.000Z",
  "reminders": [{"remindBefore": 24, "type": "one-time"}]
}

2. From conversation about completing iOS course with daily reminders at 7pm, deadline in a month:
{
  "title": "Complete Stanford iOS Course",
  "description": "Study Stanford iOS course daily at 7 PM. Focus on completing modules systematically. Set aside 60-90 minutes each day for consistent progress. Review previous concepts and practice coding exercises regularly.",
  "status": "not-started",
  "deadline": "2025-11-23T19:00:00.000Z",
  "reminders": [{"remindBefore": 24, "type": "daily"}]
}

3. User: "finish project report"
{
  "title": "Finish Project Report",
  "description": "Complete the final draft of the project report. Review all sections for accuracy, check formatting, and proofread for errors before submission.",
  "status": "not-started",
  "deadline": null,
  "reminders": []
}

Now create a task based on the user's request above. Return ONLY the JSON.`,
        },
      ],
      options: {
        temperature: 0.7,
        num_predict: 500,
        top_p: 0.9,
      },
    });

    const raw = response.message?.content?.trim();
    if (!raw) {
      return res.status(500).json({ error: "AI returned no response" });
    }

    // Extract JSON from response (handle markdown code blocks and extra text)
    let jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = raw.match(/```\s*([\s\S]*?)\s*```/);
    }
    if (!jsonMatch) {
      jsonMatch = raw.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      console.error("Invalid AI response format:", raw);
      return res.status(500).json({
        error:
          "AI returned invalid format. Please try rephrasing your request.",
      });
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    let aiTask;

    try {
      aiTask = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw:", raw);
      return res.status(500).json({
        error: "Failed to parse AI response. Please try again.",
      });
    }

    // Validate required fields
    if (!aiTask.title || typeof aiTask.title !== "string") {
      return res.status(500).json({
        error: "AI generated invalid title. Please try again.",
      });
    }

    if (!aiTask.description || typeof aiTask.description !== "string") {
      return res.status(500).json({
        error: "AI generated invalid description. Please try again.",
      });
    }

    // Try to parse natural language deadline if AI provided a string
    let processedDeadline = aiTask.deadline;
    if (typeof aiTask.deadline === "string" && aiTask.deadline !== "null") {
      // Pass the original prompt as context for better date parsing
      processedDeadline =
        parseNaturalDate(aiTask.deadline, sanitizedPrompt) ||
        validateDeadline(aiTask.deadline);
    } else {
      processedDeadline = validateDeadline(aiTask.deadline);
    }

    // Sanitize and validate
    const sanitizedTask = {
      title: aiTask.title.trim().slice(0, 100),
      description: aiTask.description.trim().slice(0, 1000),
      status: "not-started",
      deadline: processedDeadline,
      reminders: normalizeReminders(
        Array.isArray(aiTask.reminders) ? aiTask.reminders : [],
        processedDeadline,
        sanitizedPrompt // Pass prompt context for daily/weekly detection
      ),
    };

    // Log for debugging
    console.log("AI Task Generated:", {
      prompt: sanitizedPrompt.slice(0, 100) + "...",
      title: sanitizedTask.title,
      hasDeadline: !!sanitizedTask.deadline,
      reminderCount: sanitizedTask.reminders.length,
      reminderTypes: sanitizedTask.reminders.map((r) => r.type || "one-time"),
      isDailyRequest: /daily|every\s*day|everyday/i.test(sanitizedPrompt),
    });

    res.json(sanitizedTask);
  } catch (error) {
    console.error("AI generation error:", error);

    if (error.message?.includes("timeout")) {
      return res.status(504).json({
        error: "Request timed out. Please try again.",
      });
    }

    if (
      error.message?.includes("unauthorized") ||
      error.message?.includes("401")
    ) {
      return res.status(401).json({
        error: "AI service authentication failed. Please contact support.",
      });
    }

    if (error.message?.includes("rate limit")) {
      return res.status(429).json({
        error: "Too many requests. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      error:
        "Failed to generate task. Please try again with a different prompt.",
    });
  }
});

// Conversational AI endpoint
router.post("/chat-conversation", async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Valid message is required" });
  }

  const sanitizedMessage = message.trim().slice(0, 500);

  try {
    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    // Get current date/time for context
    const now = new Date();
    const currentDateTime = now.toISOString();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Validate and sanitize conversation history
    const validHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter((msg) => msg && msg.role && msg.content)
          .slice(-6) // Keep last 6 messages (3 exchanges)
          .map((msg) => ({
            role:
              msg.role === "user" || msg.role === "assistant"
                ? msg.role
                : "user",
            content: String(msg.content).slice(0, 500),
          }))
      : [];

    const messages = [
      {
        role: "system",
        content: `You are a friendly and helpful task management assistant.

CURRENT CONTEXT:
- Date/Time: ${currentDateTime}
- Today is: ${dayOfWeek}, ${dateStr}

YOUR ROLE:
- Help users plan and organize their tasks
- Ask clarifying questions when details are unclear
- Suggest realistic timeframes and priorities
- Break down complex tasks into manageable steps
- Be conversational, encouraging, and practical

GUIDELINES:
- Keep responses concise (2-4 sentences)
- Use natural, friendly language
- When user mentions dates like "tomorrow", "next week", acknowledge the specific date
- Ask about deadlines, priorities, or details when relevant
- Offer helpful suggestions based on context
- Don't generate tasks directly - that's done through the quick generate feature

Examples:
User: "I need to prepare for a presentation"
Assistant: "I'd be happy to help you prepare! When is your presentation scheduled? Also, what's the main topic, and do you already have materials prepared?"

User: "tomorrow afternoon"
Assistant: "Got it, so your presentation is tomorrow (${dayOfWeek})! That's coming up soon. Let's make sure you're ready. Do you need help organizing your slides, practicing your delivery, or both?"`,
      },
      ...validHistory,
      {
        role: "user",
        content: sanitizedMessage,
      },
    ];

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages,
      options: {
        temperature: 0.8,
        num_predict: 250,
        top_p: 0.9,
      },
    });

    const reply = response.message?.content?.trim();
    if (!reply) {
      return res.status(500).json({ error: "AI returned no response" });
    }

    // Sanitize reply
    const sanitizedReply = reply.slice(0, 1000);

    res.json({ reply: sanitizedReply });
  } catch (error) {
    console.error("Conversation error:", error);

    if (error.message?.includes("timeout")) {
      return res.status(504).json({
        error: "Request timed out. Please try again.",
      });
    }

    if (error.message?.includes("rate limit")) {
      return res.status(429).json({
        error: "Too many requests. Please wait a moment.",
      });
    }

    res.status(500).json({
      error: "Failed to process conversation. Please try again.",
    });
  }
});

export default router;
