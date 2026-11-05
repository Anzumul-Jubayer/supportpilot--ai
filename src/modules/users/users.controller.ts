import type { Request, Response } from "express";
import { z } from "zod";
import {
  getAvailableAgents,
  getUsers,
  updateUserRole,
} from "./users.service.js";
import { getUsersSchema, updateUserRoleSchema } from "./users.schema.js";

export async function getAvailableAgentsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const agents = await getAvailableAgents();

    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error("Fetching agents failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch agents",
    });
  }
}

export async function getUsersHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const query = getUsersSchema.parse(req.query);
    const result = await getUsers(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: error.issues,
      });
      return;
    }

    console.error("Fetching users failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
}

export async function updateUserRoleHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const input = updateUserRoleSchema.parse(req.body);
    const user = await updateUserRole(id, input);
    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid role",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (error instanceof Error && error.message === "ADMIN_ROLE_PROTECTED") {
      res.status(403).json({
        success: false,
        message: "Admin roles cannot be changed through this endpoint",
      });
      return;
    }

    console.error("Updating user role failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update user role",
    });
  }
}
