import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";

import { listTicketsHandler } from "./ticket-list.controller.js";
import { getTicketByIdHandler } from "./ticket-details.controller.js";
import { authorize } from "../auth/authorize.js";
import {
  updateTicketStatusHandler,
  assignTicketHandler,
} from "./ticket-management.controller.js";
import { createTicketHandler } from "./ticket.controller.js";
const router = Router();

router.post("/", authenticate, createTicketHandler);

router.get("/", authenticate, listTicketsHandler);
router.get("/:id", authenticate, getTicketByIdHandler);
router.patch(
  "/:id/status",
  authenticate,
  authorize("AGENT", "ADMIN"),
  updateTicketStatusHandler,
);
import {
  createCommentHandler,
  listCommentsHandler,
} from "./comment.controller.js";
router.patch(
  "/:id/assign",
  authenticate,
  authorize("AGENT", "ADMIN"),
  assignTicketHandler,
);
router.post("/:id/comments", authenticate, createCommentHandler);

router.get("/:id/comments", authenticate, listCommentsHandler);
export default router;
