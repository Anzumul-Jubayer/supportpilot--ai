
import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

type DashboardOptions = {
  userId: string;
  role: UserRole;
};

export async function getDashboardStats({
  userId,
  role,
}: DashboardOptions) {
  const where: Prisma.TicketWhereInput =
    role === "CUSTOMER"
      ? { creatorId: userId }
      : role === "AGENT"
        ? { assigneeId: userId }
        : {};

  const [totalTickets, statusCounts, recentTickets] = await Promise.all([
    prisma.ticket.count({ where }),

    prisma.ticket.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.ticket.findMany({
      where,
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    }),
  ]);

  const counts = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  for (const item of statusCounts) {
    counts[item.status] = item._count._all;
  }

  return {
    totalTickets,
    openTickets: counts.OPEN,
    inProgressTickets: counts.IN_PROGRESS,
    resolvedTickets: counts.RESOLVED,
    closedTickets: counts.CLOSED,
    recentTickets,
  };
}
