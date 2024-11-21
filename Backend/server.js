// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const sequelize = require("./config/db");
import "pg";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://tejanarra.github.io", // Allow GitHub Pages domain
      "https://task-manager-sigma-ashen.vercel.app", // Allow your Vercel frontend domain
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS method for preflight request
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ], // Specify allowed headers
    credentials: true, // Allow credentials if using cookies, sessions, etc.
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/tasks", taskRoutes); // Task routes (adjusted the base path)

// Sync the database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => console.error("Error syncing database:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
