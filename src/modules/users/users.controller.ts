
import type { Request, Response } from "express";
import { getAvailableAgents } from "./users.service.js";

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
