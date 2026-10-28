import { z } from "zod";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { createCommentSchema } from "./ticket.schema.js";
import {
  createComment,
  listComments,
} from "./comment.service.js";

const ticketIdSchema = z.string().uuid();

export async function createCommentHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const idResult = ticketIdSchema.safeParse(req.params.id);
  const bodyResult = createCommentSchema.safeParse(req.body);

  if (!idResult.success || !bodyResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid ticket ID or comment content",
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
    const comment = await createComment(
      idResult.data,
      req.user.id,
      bodyResult.data.content,
      req.user.role,
    );

    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Ticket not found or access denied",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function listCommentsHandler(
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

  try {
    const comments = await listComments(
      idResult.data,
      req.user.id,
      req.user.role,
    );

    if (!comments) {
      res.status(404).json({
        success: false,
        message: "Ticket not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Failed to list comments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}