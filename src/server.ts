import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { apiV1Routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/response.util.js";
import { formatDuration } from "./utils/time.util.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:3000", /\.vercel\.app$/],
  credentials: true,
}));

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to SaveWise API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      apiV1: "/api/v1",
      auth: {
        register: "POST /api/v1/auth/register",
        login: "POST /api/v1/auth/login",
        refreshToken: "POST /api/v1/auth/refresh-token",
        getMe: "GET /api/v1/users/me",
        updateProfile: "PATCH /api/v1/users/me",
      },
    },
  });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: formatDuration(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});


// Mount API v1 router
app.use("/api/v1", apiV1Routes);

// Catch-all 404 for undefined routes
app.use((_req, _res, next) => {
  next(new AppError("Resource not found", 404));
});

// Centralized error handler
app.use(errorHandler);

// Database connection & startup
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
};

startServer();