
import { prisma } from "../../lib/prisma.js";
import type { CreateTicketInput } from "./ticket.schema.js";
import type { Prisma } from "../../../generated/prisma/client.js";
type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";
type ListTicketsOptions = {
  page: number;
  limit: number;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  userId: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
};
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

export async function getTickets(
  userId: string,
  role: UserRole,
  page: number,
  limit: number
) {
  const where =
    role === "CUSTOMER"
      ? { creatorId: userId }
      : {};

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
        assigneeId: true,
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


export async function listTickets(options: ListTicketsOptions) {
  const { page, limit, status, userId, role } = options;

  const where: Prisma.TicketWhereInput = {
    ...(role === "CUSTOMER" ? { creatorId: userId } : {}),
    ...(status ? { status } : {}),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        creatorId: true,
        assigneeId: true,
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}