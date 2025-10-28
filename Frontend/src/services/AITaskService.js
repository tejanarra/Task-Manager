// frontend/services/AITaskService.js
import axios from "axios";

export const generateAITask = async (prompt) => {
  try {
    const { data } = await axios.post("/api/ai/chat", { prompt });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

export const sendAIChatMessage = async (message, history = []) => {
  try {
    const { data } = await axios.post("/api/ai/chat-conversation", {
      message,
      conversationHistory: history,
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};
