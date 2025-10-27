import express from "express";
import { Ollama } from "ollama";
import {
  parseNaturalDate,
  validateDeadline,
  normalizeReminders,
} from "../utils/aiUtils.js";

const router = express.Router();

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: Generate a structured task (title, description, deadlineUTC, reminders) from a natural-language prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AiGenerateTaskRequest' }
 *     responses:
 *       200:
 *         description: Generated task object (sanitized and ready to create)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title: { type: string, example: "Finish backend integration" }
 *                 description: { type: string, example: "Implement task API endpoints and reminder cron jobs." }
 *                 status:
 *                   type: string
 *                   enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]
 *                   example: "NOT_STARTED"
 *                 deadlineUTC:
 *                   type: ["string", "null"]
 *                   format: "date-time"
 *                   nullable: true
 *                   example: "2025-11-05T18:00:00Z"
 *                 reminders:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TaskReminder"
 *       400:
 *         description: Invalid prompt or AI response
 *       500:
 *         description: Internal server error or failed AI generation
 */
router.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || !prompt.trim())
    return res.status(400).json({ error: "Valid prompt required" });

  const sanitizedPrompt = prompt.trim().slice(0, 500);

  try {
    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful task management assistant. When given a natural-language prompt, return a structured JSON object with fields: title, description, deadline (ISO string or null), and optional reminders array.",
        },
        { role: "user", content: sanitizedPrompt },
      ],
    });

    const raw = response.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: "Empty AI response" });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      return res.status(500).json({ error: "Invalid AI output structure" });

    let aiTask;
    try {
      aiTask = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(500).json({ error: "Invalid JSON returned by AI" });
    }

    const processedDeadline =
      parseNaturalDate(aiTask.deadline, sanitizedPrompt) ||
      validateDeadline(aiTask.deadline);

    const sanitizedTask = {
      title: aiTask.title?.trim().slice(0, 100) || "Untitled Task",
      description: aiTask.description?.trim().slice(0, 1000) || "",
      status: "NOT_STARTED",
      deadlineUTC: processedDeadline,
      reminders: normalizeReminders(processedDeadline),
    };

    res.status(200).json(sanitizedTask);
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

/**
 * @openapi
 * /api/ai/chat-conversation:
 *   post:
 *     tags: [AI]
 *     summary: Conversational AI assistant for task planning
 *     description: Maintains context and replies naturally based on user input for planning and scheduling tasks.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/AiConversationRequest" }
 *     responses:
 *       200:
 *         description: Assistant reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "Got it — when is the deadline?"
 *       400:
 *         description: Missing message content
 *       500:
 *         description: AI conversation failed
 */
router.post("/chat-conversation", async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message || !message.trim())
    return res.status(400).json({ error: "Message required" });

  const sanitizedMessage = message.trim().slice(0, 500);

  try {
    const ollama = new Ollama({
      host: "https://ollama.com",
      headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    });

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages: [
        ...conversationHistory,
        { role: "user", content: sanitizedMessage },
      ],
    });

    const reply = response.message?.content?.trim() || "";
    res.status(200).json({ reply: reply.slice(0, 1000) });
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({ error: "Conversation failed" });
  }
});

export default router;
