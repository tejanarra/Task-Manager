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
      "https://tejanarra.github.io",
      "https://task-manager-sigma-ashen.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((err) => {
    console.error("Error syncing database:", err.message || err);
  });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
