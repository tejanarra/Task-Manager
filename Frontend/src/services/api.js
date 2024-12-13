import axios from "axios";

const api = axios.create({
  baseURL: "https://task-manager-sigma-ashen.vercel.app/api", // Replace with your backend URL
  // baseURL: "http://localhost:5001/api", // Localhost for local development
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Task-related endpoints
export const fetchTasks = () => api.get("/tasks");
export const createTask = (newTask) => api.post("/tasks", newTask);
export const updateTask = (taskId, updatedTask) =>
  api.put(`/tasks/${taskId}`, updatedTask);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const updateTaskPriority = (taskId, priority) =>
  api.put(`/tasks/${taskId}/priority`, { priority });

// Authentication-related endpoints
export const loginUser = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const registerUser = (username, email, password) => {
  return api.post("/auth/register", { username, email, password });
};

export const verifyRegistrationCode = (email, verificationCode) => {
  return api.post("/auth/verify-registration", { email, verificationCode });
};

export const sendVerificationCode = (email) => {
  return api.post("/auth/resend-verification", { email });
};

export const sendForgotPasswordRequest = (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const resetPassword = (email, verificationCode, newPassword) => {
  return api.post("/auth/verify-code", { email, verificationCode, newPassword });
};

export const verifyToken = () => api.get("/verify-token");