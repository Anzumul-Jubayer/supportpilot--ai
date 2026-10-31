import express from "express";
import type { Response } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import {
  authenticate,
  type AuthenticatedRequest,
} from "./modules/auth/auth.middleware.js";
import { authorize } from "./modules/auth/authorize.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import { setupSwagger } from "./config/swagger.js";
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      // "https://YOUR-FRONTEND-DOMAIN.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
setupSwagger(app);
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
  }  catch (error) {
  console.error("Database health check failed:", error);

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
app.use("/api/v1/ai", aiRoutes);
export default app;

