import express from "express";
import { generateTask, chatConversation } from "../controllers/aiController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply rate limiting to all AI routes
router.use(aiLimiter);

// Generate new task
router.post("/chat", authenticateToken, generateTask);

// Conversational AI with task context
router.post("/chat-conversation", authenticateToken, chatConversation);

export default router;
