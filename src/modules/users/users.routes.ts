import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorize.js";
import {
  getAvailableAgentsHandler,
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

// Update user role — ADMIN only
router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  updateUserRoleHandler,
);

export default router;