import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorize.js";
import {
  getAvailableAgentsHandler,
  getAgentsOverviewHandler,
  getUsersHandler,
  updateUserRoleHandler,
} from "./users.controller.js";

const router = Router();

// Available agents — AGENT and ADMIN
router.get(
  "/agents",
  authenticate,
  authorize("AGENT", "ADMIN"),
  getAvailableAgentsHandler,
);

// List all users — ADMIN only
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getUsersHandler,
);
// Agent workload overview — ADMIN only
router.get(
  "/agents/overview",
  authenticate,
  authorize("ADMIN"),
  getAgentsOverviewHandler,
);
// Update user role — ADMIN only
router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  updateUserRoleHandler,
);

export default router;