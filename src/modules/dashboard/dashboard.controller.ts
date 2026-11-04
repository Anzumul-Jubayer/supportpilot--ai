
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { getDashboardStats } from "./dashboard.service.js";

export async function getDashboardStatsHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const stats = await getDashboardStats({
      userId: req.user!.id,
      role: req.user!.role,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics",
    });
  }
}
