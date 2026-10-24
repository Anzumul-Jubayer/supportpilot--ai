import express from "express";
import type { Response } from "express";

import { prisma } from "./lib/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import {
  authenticate,
  type AuthenticatedRequest,
} from "./modules/auth/auth.middleware.js";
import { authorize } from "./modules/auth/authorize.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
const app = express();

app.use(express.json());

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SupportPilot AI API is running",
  });
});

// Database health check
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

// Protected user endpoint
app.get(
  "/api/v1/auth/me",
  authenticate,
  (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        userId: req.user!.id,
        role: req.user!.role,
      },
    });
  }
);
app.get(
  "/api/v1/auth/agent-test",
  authenticate,
  authorize("AGENT", "ADMIN"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Agent access granted",
    });
  }
);
// Registration and login routes
app.use("/api/v1/auth", authRoutes);
// ticket
app.use("/api/v1/tickets", ticketRoutes);

export default app;