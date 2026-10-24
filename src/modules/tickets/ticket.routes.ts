import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { createTicketHandler } from "./ticket.controller.js";

const router = Router();

router.post("/", authenticate, createTicketHandler);

export default router;