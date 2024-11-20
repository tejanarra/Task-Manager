import axios from "axios";

const api = axios.create({
  baseURL: "https://conversely-deciding-rodent.ngrok-free.app/api",
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

export const verifyToken = () => api.get("/verify-token");
export const fetchTasks = () => api.get("/tasks");
export const createTask = (newTask) => api.post("/tasks", newTask);
export const updateTask = (taskId, updatedTask) =>
  api.put(`/tasks/${taskId}`, updatedTask);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

export const loginUser = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const registerUser = (username, email, password) => {
  return api.post("/auth/register", { username, email, password });
};
