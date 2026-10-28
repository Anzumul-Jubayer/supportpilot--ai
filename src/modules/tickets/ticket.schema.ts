import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(10).max(5000),
});
export const listTicketsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ]).optional(),
});
export const updateTicketStatusSchema = z.object({
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ]),
});

export const assignTicketSchema = z.object({
  assigneeId: z.string().uuid(),
});
export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(3000),
});
export type CreateTicketInput = z.infer<
  typeof createTicketSchema
>;
export type ListTicketsInput = z.infer<
  typeof listTicketsSchema
>;
