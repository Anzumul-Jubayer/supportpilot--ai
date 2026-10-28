import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { analyzeTicketHandler } from "./ai.controller.js";

const router = Router();

router.post(
  "/tickets/:id/analyze",
  authenticate,
  analyzeTicketHandler,
);

export default router;