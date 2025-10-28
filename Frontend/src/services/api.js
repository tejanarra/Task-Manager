import axios from "axios";

const api = axios.create({
  // baseURL: "https://task-manager-sigma-ashen.vercel.app/api", // Replace with your backend URL
  baseURL: "http://localhost:5001/api", // Localhost for local development
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000, // 30 second timeout
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

// Enhanced error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.error || "An error occurred",
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: "No response from server. Please check your connection.",
      status: 0,
    };
  } else {
    // Error setting up request
    return {
      message: error.message || "An unexpected error occurred",
      status: -1,
    };
  }
};

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

export const loginWithGoogle = async (authorizationCode) => {
  return api.post(`/auth/google`, { code: authorizationCode });
};

export const registerUser = (firstName, lastName, email, password) => {
  return api.post("/auth/register", { firstName, lastName, email, password });
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
  return api.post("/auth/verify-code", {
    email,
    verificationCode,
    newPassword,
  });
};

export const changePassword = (currentPassword, newPassword) => {
  return api.post("/auth/change-password", { currentPassword, newPassword });
};

export const verifyToken = () => api.get("/verify-token");

// Profile-related endpoints
export const getProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (err) {
    console.error("Error fetching profile:", err);
    throw err;
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await api.put("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
};

// AI-related endpoints
export const generateAITask = async (prompt) => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await api.post(
      "/ai/chat",
      { prompt },
      { headers: { "x-user-timezone": timezone } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    const errorInfo = handleApiError(error);
    return { success: false, error: errorInfo.message };
  }
};

export const sendAIChatMessage = async (message, conversationHistory = []) => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await api.post(
      "/ai/chat-conversation",
      { message, conversationHistory },
      { headers: { "x-user-timezone": timezone } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    const errorInfo = handleApiError(error);
    return { success: false, error: errorInfo.message };
  }
};


export default api;
