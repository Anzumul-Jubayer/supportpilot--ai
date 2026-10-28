import { z } from "zod";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import {
  updateTicketStatusSchema,
  assignTicketSchema,
} from "./ticket.schema.js";
import {
  updateTicketStatus,
  assignTicket,
} from "./ticket.service.js";

const ticketIdSchema = z.string().uuid();

export async function updateTicketStatusHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const idResult = ticketIdSchema.safeParse(req.params.id);
  const bodyResult = updateTicketStatusSchema.safeParse(req.body);

  if (!idResult.success || !bodyResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid ticket ID or status",
    });
    return;
  }

  try {
    const ticket = await updateTicketStatus(
      idResult.data,
      bodyResult.data.status,
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
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Failed to update ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function assignTicketHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const idResult = ticketIdSchema.safeParse(req.params.id);
  const bodyResult = assignTicketSchema.safeParse(req.body);

  if (!idResult.success || !bodyResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid ticket ID or assignee ID",
    });
    return;
  }

  try {
    const result = await assignTicket(
      idResult.data,
      bodyResult.data.assigneeId,
    );

    if ("error" in result) {
      const isAgentMissing = result.error === "AGENT_NOT_FOUND";

      res.status(404).json({
        success: false,
        message: isAgentMissing ? "Agent not found" : "Ticket not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: result.ticket,
    });
  } catch (error) {
    console.error("Failed to assign ticket:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}