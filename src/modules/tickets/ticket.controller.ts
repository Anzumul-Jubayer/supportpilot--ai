import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { createTicketSchema } from "./ticket.schema.js";
import { createTicket as createTicketService } from "./ticket.service.js";

export async function createTicketHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const parsed = createTicketSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid ticket data",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
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
    const ticket = await createTicketService(
      parsed.data,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Ticket creation failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}