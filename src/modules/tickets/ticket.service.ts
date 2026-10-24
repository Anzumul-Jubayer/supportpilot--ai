import { prisma } from "../../lib/prisma.js";
import type { CreateTicketInput } from "./ticket.schema.js";

export async function createTicket(
  input: CreateTicketInput,
  creatorId: string
) {
  return prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      creatorId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      category: true,
      createdAt: true,
      creatorId: true,
    },
  });
}