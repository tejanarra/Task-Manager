import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import prisma from "./utils/prismaClient.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Swagger Docs
import { swaggerUi, swaggerSpec } from "./config/swagger.js";

// Initialize app
const app = express();

// Security Middleware
app.use(helmet());

// CORS Settings
const allowedOrigins = [
  "https://tejanarra.github.io",
  "https://task-manager-sigma-ashen.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    credentials: true,
  })
);

// JSON Body Parser
app.use(express.json({ limit: "1mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((err) => {
    console.error("Error syncing database:", err.message || err);
  });

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// Raw JSON Swagger definition
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

// Global Error Handler (Future Enhancements)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
