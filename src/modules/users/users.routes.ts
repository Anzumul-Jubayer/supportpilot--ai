
import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorize.js";
import { getAvailableAgentsHandler } from "./users.controller.js";

const router = Router();

router.get(
  "/agents",
  authenticate,
  authorize("AGENT", "ADMIN"),
  getAvailableAgentsHandler,
);

export default router;
