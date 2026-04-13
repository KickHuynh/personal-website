const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const messageRoutes = require("./routes/messageRoutes");
const projectRoutes = require("./routes/projectRoutes");
const skillRoutes = require("./routes/skillRoutes");
const authRoutes = require("./routes/authRoutes");

// Middlewares
const { errorHandler } = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");

const app = express();

// CORS — whitelist chỉ origin của frontend (hoặc default cho dev)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3333,http://127.0.0.1:3000,http://127.0.0.1:3333")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (Postman, curl) hoặc nằm trong allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Giới hạn request body size (bảo vệ chống payload lớn)
app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Áp dụng general rate limiting
app.use("/api", apiLimiter);

// Public base route
app.get("/", (req, res) => {
  res.json({
    message: "Backend personal website is running"
  });
});

// Health check (public)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/auth", authRoutes);

// Catch 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại"
  });
});

// Centralized Error Handling (phải đặt ở CÙNG)
app.use(errorHandler);

module.exports = app;
