import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { listTicketsSchema } from "./ticket.schema.js";
import { listTickets } from "./ticket.service.js";

export async function listTicketsHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const parsed = listTicketsSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid query parameters",
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
    const result = await listTickets({
      ...parsed.data,
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to list tickets:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}