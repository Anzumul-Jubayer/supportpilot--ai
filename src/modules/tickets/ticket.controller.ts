import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { createTicketSchema } from "./ticket.schema.js";
import { createTicket as createTicketService } from "./ticket.service.js";
import { getTickets as getTicketsService } from "./ticket.service.js";
export async function createTicketHandler(
  req: AuthenticatedRequest,
  res: Response,
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
    const ticket = await createTicketService(parsed.data, req.user.id);

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

export async function getTicketsHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const pageValue = req.query.page ?? "1";
  const limitValue = req.query.limit ?? "10";

  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (
    typeof pageValue !== "string" ||
    typeof limitValue !== "string" ||
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    res.status(400).json({
      success: false,
      message: "page must be positive and limit must be between 1 and 100",
    });
    return;
  }

  try {
    const result = await getTicketsService(
      req.user.id,
      req.user.role,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Fetching tickets failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
