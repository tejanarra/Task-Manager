import { Ollama } from "ollama";
import { DateTime } from "luxon";
import Task from "../models/Task.js";
import {
  getUserTimeZone,
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
- **IMPORTANT**: Return deadlines in the user's **local timezone (${userTimeZone})** with **NO timezone designator**.
  Example: "2025-10-31T22:00:00". Do **NOT** append "Z" and do **NOT** include an offset.

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
Return **strict JSON only**, no markdown or explanations.
Format:
{
  "title": "Concise actionable title",
  "description": "2–4 complete sentences detailing realistic steps.",
  "status": "not-started",
  "deadline": "YYYY-MM-DDTHH:mm[:ss]" or null,
  "reminders": [{"remindBefore": <hours>, "type": "one-time"}]
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
    if (!raw) return res.status(500).json({ error: "AI returned no response" });

    const jsonMatch =
      raw.match(/```json\s*([\s\S]*?)\s*```/) ||
      raw.match(/```\s*([\s\S]*?)\s*```/) ||
      raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Invalid AI response format:", raw);
      return res.status(500).json({
        error: "AI returned invalid format. Please try again.",
      });
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    let aiTask;
    try {
      aiTask = JSON.parse(jsonStr);
    } catch (err) {
      console.error("JSON parse error:", err);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    if (!aiTask.title || !aiTask.description)
      return res.status(500).json({ error: "AI generated incomplete task." });

    let processedDeadline = null;
    if (typeof aiTask.deadline === "string" && aiTask.deadline !== "null") {
      processedDeadline = standardizeAIDeadlineToUTC(
        aiTask.deadline,
        sanitizedPrompt,
        userTimeZone
      );
    } else {
      processedDeadline = validateDeadline(null, userTimeZone);
    }

    const sanitizedTask = {
      title: aiTask.title.trim().slice(0, 100),
      description: aiTask.description.trim().slice(0, 1000),
      status: "not-started",
      deadline: processedDeadline,
      reminders: normalizeReminders(
        Array.isArray(aiTask.reminders) ? aiTask.reminders : [],
        processedDeadline,
        sanitizedPrompt
      ),
    };

    res.json(sanitizedTask);
  } catch (error) {
    console.error("AI generation error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate task. Please try again later." });
  }
};

/* =====================================
   POST /api/ai/chat-conversation
   ===================================== */
export const chatConversation = async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  const userTimeZone = getUserTimeZone(req);
  const userId = req.userId;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Valid message is required" });
  }

  const sanitizedMessage = message.trim().slice(0, 500);

  try {
    // 🧠 Load user's recent tasks for context
    const tasks = await Task.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    const taskSummary =
      tasks.length === 0
        ? "User currently has no tasks."
        : tasks
            .map(
              (t, i) =>
                `${i + 1}. ${t.title} — status: ${t.status}${
                  t.deadline
                    ? `, due: ${new Date(t.deadline).toLocaleString()}`
                    : ""
                }.`
            )
            .join("\n");

    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    const now = DateTime.now().setZone(userTimeZone);
    const currentDateTime = now.toISO();

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

    /* =====================================================
       🧩 FULL AND FINAL PROMPT — COMPLETE & ACCURATE
    ===================================================== */
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI task management assistant designed to help users create, update, and manage their tasks conversationally.

You should always respond naturally in text, and when necessary, provide a valid JSON object to indicate a structured action that should be applied to a task.

---

### CONTEXT
- User timezone: ${userTimeZone}
- Current local time: ${currentDateTime}
- You can view and modify tasks in the user’s workspace.

### CURRENT TASKS
${taskSummary || "User currently has no tasks."}

---

### ACTIONABLE BEHAVIOR
When the user says something that implies creating, updating, or deleting a task, respond with a short friendly message (natural text) **and** include a structured JSON block that describes the action.

You must **ONLY** return JSON if an actionable task change is detected.

---

### DEADLINE HANDLING
- All date/time values must be in **local user time (${userTimeZone})**, ISO format, without timezone offset (YYYY-MM-DDTHH:mm).
- Examples:
  - “today” → set same day, near end of day (e.g., 17:00)
  - “tomorrow” → next day, similar time
  - “next week” → the next corresponding weekday, 17:00 local time
  - “urgent” / “ASAP” → within 24–48 hours
  - If no explicit date mentioned → no deadline (null)
- Backend will convert all local deadlines to UTC automatically.

---

### REMINDER HANDLING
You can include:
- "remindBefore" → number of hours before deadline
- "customDate" → explicit ISO datetime (local time)
- "type" → “one-time”, “daily”, or “weekly”

Rules:
- If a **deadline exists** and "customDate" is given → backend will calculate "remindBefore" automatically based on time difference.
- If "remindBefore" is provided → backend uses it directly.
- You may include multiple reminders.
- Prefer including both when possible for clarity.

Examples:
[
  {"remindBefore": 24, "type": "one-time"},
  {"customDate": "2025-11-07T15:05:00"}
]

---

### RESPONSE FORMAT
Always return your normal natural-language reply to the user.
If an actionable operation (create, update, delete) is detected, append **one valid JSON object** (no markdown, no backticks, no code fences).

---

### EXAMPLES

**1️⃣ Create Task Example**
User: “Remind me to pay my AT&T bill this week and switch to Visible.”
Response:
{
  "action": "create",
  "title": "Pay AT&T bill and switch to Visible",
  "description": "Pay the AT&T bill, request device unlock, then switch to the Visible mobile plan by the end of the week.",
  "status": "not-started",
  "deadline": "2025-11-12T17:00:00",
  "reminders": [
    {"customDate": "2025-11-07T15:05:00"}
  ]
}

**2️⃣ Update Task Example**
User: “Change my ‘Pay AT&T bill’ deadline to November 10th at 6pm.”
Response:
{
  "action": "update",
  "taskTitle": "Pay AT&T bill",
  "newDeadline": "2025-11-10T18:00:00",
  "newReminders": [
    {"remindBefore": 24, "type": "one-time"}
  ]
}

**3️⃣ Delete Task Example**
User: “Delete my grocery shopping task.”
Response:
{
  "action": "delete",
  "taskTitle": "Plan weekend shopping"
}

---

### OUTPUT RULES
- Return plain text + JSON (no markdown, no code fences)
- JSON must always be **valid and parseable**
- Only one JSON object allowed per message
- If unsure, return only natural text

Be concise, natural, and consistent.`,
      },
      ...validHistory,
      { role: "user", content: sanitizedMessage },
    ];

    /* =====================================================
       🧠 LLM RESPONSE
    ===================================================== */
    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages,
      options: { temperature: 0.8, num_predict: 400, top_p: 0.9 },
    });

    const rawReply = response.message?.content?.trim();
    if (!rawReply)
      return res.status(500).json({ error: "AI returned no response" });

    // Extract structured JSON
    const match = rawReply.match(/\{[\s\S]*\}/);
    let parsedAction = null;
    if (match) {
      try {
        parsedAction = JSON.parse(match[0]);
      } catch (err) {
        console.warn("JSON parse failed:", err);
      }
    }

    let previewUpdate = null;

    /* =====================================================
       🔧 Helper: Compute remindBefore for customDate
    ===================================================== */
    const processReminders = (remindersArr, deadline) => {
      if (!Array.isArray(remindersArr)) return [];
      return remindersArr
        .map((r) => {
          const reminder = { sent: false };
          let customDateUTC = null;

          // Convert customDate → UTC
          if (r.customDate) {
            try {
              const localCustom = DateTime.fromISO(r.customDate, {
                zone: userTimeZone,
              });
              customDateUTC = localCustom.toUTC();
              reminder.customDate = customDateUTC.toISO();

              // Compute remindBefore if deadline exists
              if (deadline) {
                const deadlineDT = DateTime.fromISO(deadline, { zone: "utc" });
                const diffHrs = deadlineDT.diff(customDateUTC, "hours").hours;
                reminder.remindBefore =
                  isFinite(diffHrs) && diffHrs >= 0 ? diffHrs : 0;
              }
            } catch (err) {
              console.warn("Invalid customDate:", r.customDate);
            }
          }

          // If explicit remindBefore exists
          if (typeof r.remindBefore === "number") {
            reminder.remindBefore = r.remindBefore;
          }

          reminder.type = r.type || "one-time";
          return reminder;
        })
        .filter(
          (r) =>
            r.remindBefore !== undefined &&
            r.remindBefore !== null &&
            !Number.isNaN(r.remindBefore)
        );
    };

    /* =====================================================
       🧩 Handle CREATE
    ===================================================== */
    if (parsedAction?.action === "create") {
      const title = parsedAction.title?.trim();
      const description = parsedAction.description?.trim() || "";
      const status = parsedAction.status || "not-started";

      let deadline = null;
      if (parsedAction.deadline) {
        try {
          const localDeadline = DateTime.fromISO(parsedAction.deadline, {
            zone: userTimeZone,
          });
          deadline = localDeadline.toUTC().toISO();
        } catch {
          console.warn(
            "Invalid deadline format in create:",
            parsedAction.deadline
          );
        }
      }

      const reminders = processReminders(parsedAction.reminders, deadline);

      previewUpdate = {
        id: `temp-${Date.now()}`,
        title,
        description,
        status,
        deadline,
        reminders,
        isNewTask: true,
        action: "create",
      };
    } else if (parsedAction?.action === "update" && parsedAction.taskTitle) {
      /* =====================================================
       🧩 Handle UPDATE
    ===================================================== */
      const task = await Task.findOne({
        where: { userId, title: parsedAction.taskTitle },
      });

      if (task) {
        let updatedDeadline = task.deadline;
        if (parsedAction.newDeadline) {
          try {
            updatedDeadline = DateTime.fromISO(parsedAction.newDeadline, {
              zone: userTimeZone,
            })
              .toUTC()
              .toISO();
          } catch {
            console.warn("Invalid newDeadline:", parsedAction.newDeadline);
          }
        }

        let reminders = task.reminders || [];
        if (Array.isArray(parsedAction.newReminders)) {
          const newReminders = processReminders(
            parsedAction.newReminders,
            updatedDeadline
          );
          const seen = new Set();
          reminders = [...reminders, ...newReminders].filter((r) => {
            const key = r.customDate || `${r.remindBefore}-${r.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }

        previewUpdate = {
          id: task.id,
          title: task.title,
          description: parsedAction.newDescription || task.description || "",
          status: parsedAction.newStatus || task.status,
          deadline: updatedDeadline,
          reminders,
          isUpdate: true,
          action: "update",
        };
      }
    } else if (parsedAction?.action === "delete" && parsedAction.taskTitle) {
      /* =====================================================
       🧩 Handle DELETE
    ===================================================== */
      const task = await Task.findOne({
        where: { userId, title: parsedAction.taskTitle },
      });
      if (task) {
        previewUpdate = {
          id: task.id,
          title: task.title,
          action: "delete",
          isUpdate: true,
        };
      }
    }

    /* =====================================================
       ✅ Final Response
    ===================================================== */
    res.json({
      reply: rawReply.replace(/\{[\s\S]*\}/, "").trim(),
      previewUpdate,
    });
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({
      error: "Failed to process conversation. Please try again.",
    });
  }
};
