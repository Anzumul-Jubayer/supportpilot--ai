
import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import {
  createTicketHandler,
  getTicketsHandler,
} from "./ticket.controller.js";
import { listTicketsHandler } from "./ticket-list.controller.js";
import {
  getTicketByIdHandler,
} from "./ticket-details.controller.js";
import { authorize } from "../auth/authorize.js";
import {
  updateTicketStatusHandler,
  assignTicketHandler,
} from "./ticket-management.controller.js";
const router = Router();

router.post("/", authenticate, createTicketHandler);
router.get("/", authenticate, getTicketsHandler);
router.get("/", authenticate, listTicketsHandler);
router.get("/:id", authenticate, getTicketByIdHandler);
router.patch(
  "/:id/status",
  authenticate,
  authorize("AGENT", "ADMIN"),
  updateTicketStatusHandler,
);

router.patch(
  "/:id/assign",
  authenticate,
  authorize("AGENT", "ADMIN"),
  assignTicketHandler,
);
export default router;
