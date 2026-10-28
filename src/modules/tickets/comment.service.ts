import { prisma } from "../../lib/prisma.js";

type CommentRole = "CUSTOMER" | "AGENT" | "ADMIN";

async function canAccessTicket(
  ticketId: string,
  userId: string,
  role: CommentRole,
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      creatorId: true,
      assigneeId: true,
    },
  });

  if (!ticket) return false;

  if (role === "ADMIN") return true;

  if (role === "CUSTOMER") {
    return ticket.creatorId === userId;
  }

  // Agents can access tickets assigned to them.
  return ticket.assigneeId === userId;
}

export async function createComment(
  ticketId: string,
  authorId: string,
  content: string,
  role: CommentRole,
) {
  const allowed = await canAccessTicket(ticketId, authorId, role);

  if (!allowed) return null;

  return prisma.comment.create({
    data: {
      content,
      ticketId,
      authorId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      ticketId: true,
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function listComments(
  ticketId: string,
  userId: string,
  role: CommentRole,
) {
  const allowed = await canAccessTicket(ticketId, userId, role);

  if (!allowed) return null;

  return prisma.comment.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}