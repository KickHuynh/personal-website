const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/db");

const messageRoutes = require("./routes/messageRoutes");
const projectRoutes = require("./routes/projectRoutes");
const skillRoutes = require("./routes/skillRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Backend personal website is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("DB connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

app.use("/api/messages", messageRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
