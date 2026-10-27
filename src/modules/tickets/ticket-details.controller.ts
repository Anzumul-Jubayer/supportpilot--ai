import { z } from "zod";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { getTicketById } from "./ticket.service.js";

const ticketIdSchema = z.string().uuid();

export async function getTicketByIdHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const parsedId = ticketIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
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

  try {
    const ticket = await getTicketById(
      parsedId.data,
      req.user.id,
      req.user.role,
    );

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Failed to retrieve ticket:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}