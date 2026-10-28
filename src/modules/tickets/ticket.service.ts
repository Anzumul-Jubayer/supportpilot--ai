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
type TicketRole = "CUSTOMER" | "AGENT" | "ADMIN";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export async function createTicket(
  input: CreateTicketInput,
  creatorId: string,
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
  limit: number,
) {
  const where = role === "CUSTOMER" ? { creatorId: userId } : {};

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

export async function getTicketById(
  ticketId: string,
  userId: string,
  role: TicketRole,
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      category: true,
      aiSummary: true,
      aiReply: true,
      createdAt: true,
      updatedAt: true,
      creatorId: true,
      assigneeId: true,
    },
  });

  if (!ticket) {
    return null;
  }

  // Customers can only access their own tickets.
  if (role === "CUSTOMER" && ticket.creatorId !== userId) {
    return null;
  }

  return ticket;
}


export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
) {
  const existingTicket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!existingTicket) {
    return null;
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      updatedAt: true,
    },
  });
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string,
) {
  // Only existing AGENT accounts can be assigned tickets.
  const agent = await prisma.user.findFirst({
    where: {
      id: assigneeId,
      role: "AGENT",
    },
    select: { id: true },
  });

  if (!agent) {
    return { error: "AGENT_NOT_FOUND" } as const;
  }

  const existingTicket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!existingTicket) {
    return { error: "TICKET_NOT_FOUND" } as const;
  }

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { assigneeId: agent.id },
    select: {
      id: true,
      title: true,
      status: true,
      assigneeId: true,
      updatedAt: true,
    },
  });

  return { ticket } as const;
}