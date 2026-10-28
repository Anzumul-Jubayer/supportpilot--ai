
import { prisma } from "../../lib/prisma.js";
import { analyzeTicket } from "./ai.provider.js";

export async function analyzeAndSaveTicket(
  ticketId: string,
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  if (!ticket) {
    return null;
  }

  const analysis = analyzeTicket({
    title: ticket.title,
    description: ticket.description,
  });

  return prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      category: analysis.category,
      aiPriority: analysis.priority,
      aiSummary: analysis.summary,
      aiReply: analysis.suggestedReply,
    },
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      aiPriority: true,
      aiSummary: true,
      aiReply: true,
      updatedAt: true,
    },
  });
}
