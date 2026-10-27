
import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import {
  createTicketHandler,
  getTicketsHandler,
} from "./ticket.controller.js";
import { listTicketsHandler } from "./ticket-list.controller.js";
const router = Router();

router.post("/", authenticate, createTicketHandler);
router.get("/", authenticate, getTicketsHandler);
router.get("/", authenticate, listTicketsHandler);
export default router;
