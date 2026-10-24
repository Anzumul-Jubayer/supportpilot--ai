import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(10).max(5000),
});

export type CreateTicketInput = z.infer<
  typeof createTicketSchema
>;