// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const sequelize = require("./config/db");

dotenv.config();

const app = express();

// app.use((req, res, next) => {
//   // Set the 'Access-Control-Allow-Origin' header to allow only your frontend (GitHub Pages)
//   res.header("Access-Control-Allow-Origin", "https://tejanarra.github.io/"); // Allow only this origin
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow these methods
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   ); // Allow these headers
//   // Allow credentials if necessary
//   res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies, authorization headers, etc.)
//   next(); // Proceed to the next middleware or route handler
// });

app.use(
  cors({
    origin: [
      "https://tejanarra.github.io/", // GitHub Pages domain
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow methods as per your need
    allowedHeaders: [
      "content-type",
      "authorization",
      "ngrok-skip-browser-warning",
      "",
    ], // Allow necessary headers
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
