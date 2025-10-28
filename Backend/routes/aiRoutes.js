import express from "express";
import {
  generateTask,
  chatConversation,
} from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/chat — Task generation
router.post("/chat", generateTask);

// POST /api/ai/chat-conversation — Conversational AI
router.post("/chat-conversation", chatConversation);

export default router;
