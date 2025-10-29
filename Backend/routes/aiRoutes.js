import express from "express";
import { generateTask, chatConversation } from "../controllers/aiController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate new task
router.post("/chat", authenticateToken, generateTask);

// Conversational AI with task context
router.post("/chat-conversation", authenticateToken, chatConversation);

export default router;
