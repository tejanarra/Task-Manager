import { Ollama } from "ollama";
import { DateTime } from "luxon";
import {
  getUserTimeZone,
  parseNaturalDate,
  validateDeadline,
  normalizeReminders,
  standardizeAIDeadlineToUTC,
} from "../utils/timeHelpers.js";

/* =====================================
   POST /api/ai/chat — Generate task
   ===================================== */
export const generateTask = async (req, res) => {
  const { prompt } = req.body;
  const userTimeZone = getUserTimeZone(req);

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Valid prompt is required" });
  }

  const sanitizedPrompt = prompt.trim().slice(0, 500);

  try {
    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    const now = DateTime.now().setZone(userTimeZone);
    const currentDateTime = now.toISO();
    const dayOfWeek = now.toFormat("cccc");
    const dateStr = now.toFormat("MMMM d, yyyy");

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages: [
        {
          role: "system",
          content: `You are an expert AI task management assistant that creates structured, realistic, and actionable tasks from natural language input.

## CONTEXT
- User timezone: ${userTimeZone}
- Current local date/time: ${currentDateTime}
- Today is: ${dayOfWeek}, ${dateStr}

## OBJECTIVE
Transform the user's prompt into a single well-defined, concise, and achievable task with optional deadline and reminders.

---

### DEADLINE LOGIC
When inferring deadlines:
- If the user says "today" → set the deadline for **later today (within working hours)**.
- If "tomorrow" → set to tomorrow (same local time unless specified).
- If phrases like "next Monday", "in 3 days", or "this weekend" → compute exact local date/time.
- If "urgent", "ASAP", "soon" → within **24 to 48 hours (local time)**.
- If no time indication → deadline = null.
- **IMPORTANT**: Return deadlines in the user's **local timezone (${userTimeZone})** with **NO timezone designator**. Example: "2025-10-31T22:00:00". Do **NOT** append "Z" and do **NOT** include an offset.
- Ensure deadlines are **at least 1 hour in the future** relative to ${currentDateTime}.
- Validate that the time exists in user’s local timezone.

---

### REMINDER LOGIC
Only create reminders **if a deadline exists**.
Determine appropriate reminders:
- If user explicitly says "daily" → [{"remindBefore": 24, "type": "daily"}]
- If user says "weekly" → [{"remindBefore": 168, "type": "weekly"}]
- Otherwise infer from deadline distance:
  - <48h → 1 reminder 2–4h before
  - 2–7d → 1 reminder 24h before
  - 1–4w → 1 reminder 48–72h before
  - >1m → 1 reminder 1 week before
- All "remindBefore" values are in hours.
- Default type = "one-time" unless user specifies daily/weekly.

---

### RESPONSE REQUIREMENTS
- Return **strict JSON only**, no markdown, code blocks, or explanations.
- Use correct JSON structure and keys exactly as shown.
- Do not include undefined or extra fields.

JSON format:
{
  "title": "Concise actionable title (max 80 chars)",
  "description": "2-4 complete sentences detailing realistic steps.",
  "status": "not-started",
  "deadline": "YYYY-MM-DDTHH:mm[:ss]" or null,  // LOCAL TIME, no Z/offset
  "reminders": [{"remindBefore": <hours>, "type": "one-time"}]
}

---

### EXAMPLES

Example 1:
User: "Finish report by tomorrow evening"
→ {
  "title": "Complete project report",
  "description": "Review data, finalize sections, and format the report before submission.",
  "status": "not-started",
  "deadline": "2025-10-29T22:00:00",
  "reminders": [{"remindBefore": 2, "type": "one-time"}]
}

Example 2:
User: "Start daily morning workout routine"
→ {
  "title": "Start daily morning workout",
  "description": "Begin each day with a 30-minute exercise session to build consistency and energy.",
  "status": "not-started",
  "deadline": null,
  "reminders": [{"remindBefore": 24, "type": "daily"}]
}`,
        },
        {
          role: "user",
          content: `Create a task for: "${sanitizedPrompt}"`,
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

    // Extract JSON robustly from the model response
    let jsonMatch =
      raw.match(/```json\s*([\s\S]*?)\s*```/) ||
      raw.match(/```\s*([\s\S]*?)\s*```/) ||
      raw.match(/\{[\s\S]*\}/);

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

    if (!aiTask.title || typeof aiTask.title !== "string") {
      return res.status(500).json({ error: "AI generated invalid title." });
    }

    if (!aiTask.description || typeof aiTask.description !== "string") {
      return res
        .status(500)
        .json({ error: "AI generated invalid description." });
    }

    // --- Critical: normalize any AI deadline to true UTC for storage,
    // while preserving the user's intended local wall time.
    let processedDeadline = null;
    if (typeof aiTask.deadline === "string" && aiTask.deadline !== "null") {
      processedDeadline = standardizeAIDeadlineToUTC(
        aiTask.deadline,
        sanitizedPrompt,
        userTimeZone
      );
      // Additional validation constraints (>=1h future, <=2y) are enforced inside helpers.
    } else {
      processedDeadline = validateDeadline(null, userTimeZone);
    }

    const sanitizedTask = {
      title: aiTask.title.trim().slice(0, 100),
      description: aiTask.description.trim().slice(0, 1000),
      status: "not-started",
      deadline: processedDeadline, // ISO UTC or null
      reminders: normalizeReminders(
        Array.isArray(aiTask.reminders) ? aiTask.reminders : [],
        processedDeadline,
        sanitizedPrompt
      ),
    };

    console.log("AI Task Generated:", {
      title: sanitizedTask.title,
      timezone: userTimeZone,
      deadline: sanitizedTask.deadline,
      reminders: sanitizedTask.reminders.length,
    });

    res.json(sanitizedTask);
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({
      error:
        "Failed to generate task. Please try again with a different prompt.",
    });
  }
};

/* =====================================
   POST /api/ai/chat-conversation
   ===================================== */
export const chatConversation = async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  const userTimeZone = getUserTimeZone(req);

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Valid message is required" });
  }

  const sanitizedMessage = message.trim().slice(0, 500);

  try {
    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    const now = DateTime.now().setZone(userTimeZone);
    const currentDateTime = now.toISO();
    const dayOfWeek = now.toFormat("cccc");
    const dateStr = now.toFormat("MMMM d, yyyy");

    const validHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter((msg) => msg && msg.role && msg.content)
          .slice(-6)
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
        content: `You are a conversational task assistant that helps the user manage and understand their tasks naturally.

## CONTEXT
- User timezone: ${userTimeZone}
- Current local date/time: ${currentDateTime}
- Today is: ${dayOfWeek}, ${dateStr}

## BEHAVIOR GUIDELINES
- Use a friendly, conversational, and motivating tone.
- Keep responses short (2–4 sentences).
- Always interpret date/time references relative to the user’s timezone.
- If asked to create a task, summarize the key details and say: "Please confirm, then click 'Create Task' to preview."
- If the user asks about a previously created task, respond contextually (e.g., "Your task is due tomorrow at 5 PM local time.").
- Never include JSON, code, or formatting markup.
- Avoid hallucination: only reference facts present in the conversation.
- When user asks about scheduling, deadlines, or timing — respond using **local time expressions** (e.g., “tomorrow afternoon,” “by next Friday”) unless they ask for UTC.`,
      },
      ...validHistory,
      { role: "user", content: sanitizedMessage },
    ];

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages,
      options: { temperature: 0.8, num_predict: 250, top_p: 0.9 },
    });

    const reply = response.message?.content?.trim();
    if (!reply) {
      return res.status(500).json({ error: "AI returned no response" });
    }

    res.json({ reply: reply.slice(0, 1000) });
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({
      error: "Failed to process conversation. Please try again.",
    });
  }
};
