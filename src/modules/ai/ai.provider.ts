
export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type TicketCategory =
  | "TECHNICAL_ISSUE"
  | "BILLING"
  | "ACCOUNT_ACCESS"
  | "OTHER";

export interface TicketAIInput {
  title: string;
  description: string;
}

export interface TicketAIResult {
  category: TicketCategory;
  priority: TicketPriority;
  summary: string;
  suggestedReply: string;
}

export function analyzeTicket(
  ticket: TicketAIInput,
): TicketAIResult {
  const text =
    `${ticket.title} ${ticket.description}`.toLowerCase();

  // 1. Classify the ticket.
  let category: TicketCategory = "OTHER";

  if (
    /refund|payment|billing|invoice|charged|subscription/.test(text)
  ) {
    category = "BILLING";
  } else if (
    /password|login|log in|sign in|account locked|access denied/.test(text)
  ) {
    category = "ACCOUNT_ACCESS";
  } else if (
    /bug|error|crash|broken|not working|failed|failure|technical/.test(text)
  ) {
    category = "TECHNICAL_ISSUE";
  }

  // 2. Suggest a priority.
  let priority: TicketPriority = "MEDIUM";

  if (
  /data loss|security breach|hacked|system down|system is down|entire system is down|service outage|service is down/.test(text)
) {
  priority = "URGENT";
}
  else if (
    /urgent|critical|cannot work|can't work|completely broken/.test(text)
  ) {
    priority = "HIGH";
  } else if (
    /minor|small issue|general question|when possible/.test(text)
  ) {
    priority = "LOW";
  }

  // 3. Create a short, extractive summary.
  const cleanDescription = ticket.description
    .trim()
    .replace(/\s+/g, " ");

  const summary =
    cleanDescription.length > 180
      ? `${cleanDescription.slice(0, 177)}...`
      : cleanDescription;

  // 4. Generate a draft reply.
  const suggestedReply =
    "Thank you for contacting SupportPilot support. " +
    `We've categorized your request as ${category.replace(/_/g, " ").toLowerCase()} ` +
    `with a suggested priority of ${priority.toLowerCase()}. ` +
    "Our support team will review the details and follow up with you.";

  return {
    category,
    priority,
    summary,
    suggestedReply,
  };
}
