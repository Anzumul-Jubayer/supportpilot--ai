import express from "express";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SupportPilot AI API is running",
  });
});

app.get("/api/v1/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      database: "connected",
    });
  } catch {
    res.status(503).json({
      success: false,
      database: "unavailable",
    });
  }
});

export default app;