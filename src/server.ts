import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

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
    },
  });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});


// Database connection & startup
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
};

startServer();