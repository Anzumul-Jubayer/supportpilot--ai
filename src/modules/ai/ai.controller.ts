
import { z } from "zod";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { analyzeAndSaveTicket } from "./ai.service.js";

const ticketIdSchema = z.string().uuid();

export async function analyzeTicketHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const idResult = ticketIdSchema.safeParse(req.params.id);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid ticket ID",
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  // Only agents and admins may trigger AI analysis.
  if (
    req.user.role !== "AGENT" &&
    req.user.role !== "ADMIN"
  ) {
    res.status(403).json({
      success: false,
      message: "Only agents and admins can analyze tickets",
    });
    return;
  }

  try {
    const analysis = await analyzeAndSaveTicket(
      idResult.data,
    );

    if (!analysis) {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ticket analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Failed to analyze ticket:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
