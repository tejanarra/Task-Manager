import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: { "ngrok-skip-browser-warning": "true" },
  timeout: 30000,
});

// ✅ Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Standard error formatting
const formatError = (error) => {
  if (error.response)
    return {
      status: error.response.status,
      message: error.response.data.error,
    };
  if (error.request) return { status: 0, message: "No response from server" };
  return { status: -1, message: error.message };
};

/* ======================
   TASK ENDPOINTS
====================== */

export const fetchTasks = () => api.get("/tasks");

export const createTask = (task) =>
  api.post("/tasks", {
    ...task,
    deadlineUTC: task.deadlineUTC || null,
  });

export const updateTask = (id, updated) =>
  api.put(`/tasks/${id}`, {
    ...updated,
    deadlineUTC: updated.deadlineUTC ?? null,
  });

export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

export const updateTaskPriority = (taskId, priority) =>
  api.put(`/tasks/${taskId}/priority`, { priority });

// ✅ Fully overwrite reminder set
export const updateTaskReminders = (taskId, reminders) =>
  api.patch(`/tasks/${taskId}/reminders`, {
    action: "overwrite",
    reminders,
  });

/* ======================
   AUTH ENDPOINTS
====================== */

export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });

export const loginWithGoogle = (authorizationCode) =>
  api.post(`/auth/google`, { code: authorizationCode });

export const registerUser = (firstName, lastName, email, password) =>
  api.post("/auth/register", { firstName, lastName, email, password });

export const verifyRegistrationCode = (email, verificationCode) =>
  api.post("/auth/verify-registration", { email, verificationCode });

export const sendVerificationCode = (email) =>
  api.post("/auth/resend-verification", { email });

export const sendForgotPasswordRequest = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (email, verificationCode, newPassword) =>
  api.post("/auth/verify-code", { email, verificationCode, newPassword });

export const changePassword = (currentPassword, newPassword) =>
  api.post("/auth/change-password", { currentPassword, newPassword });

export const verifyToken = () => api.get("/verify-token");

/* ======================
 PROFILE ENDPOINTS
====================== */

export const getProfile = () => api.get("/profile").then((res) => res.data);

export const updateProfile = (formData) =>
  api
    .put("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

/* ======================
 AI ENDPOINTS
====================== */

export const generateAITask = (prompt) =>
  api.post("/ai/chat", { prompt }).then((r) => ({
    success: true,
    data: r.data,
  }));

export const sendAIChatMessage = (message, conversationHistory = []) =>
  api.post("/ai/chat-conversation", {
    message,
    conversationHistory,
  });
