
import { prisma } from "../../lib/prisma.js";

export async function getAvailableAgents() {
  return prisma.user.findMany({
    where: {
      role: "AGENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
