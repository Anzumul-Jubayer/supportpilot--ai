
import { describe, expect, it } from "vitest";
import { analyzeTicket } from "./ai.provider.js";

describe("analyzeTicket", () => {
  it("classifies account access issues", () => {
    const result = analyzeTicket({
      title: "Unable to access my account",
      description: "I cannot log in even with the correct password.",
    });

    expect(result.category).toBe("ACCOUNT_ACCESS");
    expect(result.priority).toBe("MEDIUM");
  });

  it("classifies billing issues", () => {
    const result = analyzeTicket({
      title: "Incorrect billing charge",
      description: "I was charged twice for my subscription.",
    });

    expect(result.category).toBe("BILLING");
  });

  it("classifies technical issues", () => {
    const result = analyzeTicket({
      title: "Application crash",
      description: "The application crashes whenever I open it.",
    });

    expect(result.category).toBe("TECHNICAL_ISSUE");
  });

  it("suggests urgent priority for a system outage", () => {
    const result = analyzeTicket({
      title: "Production outage",
      description: "Our entire system is down.",
    });

    expect(result.priority).toBe("URGENT");
  });

  it("suggests high priority for a critical issue", () => {
    const result = analyzeTicket({
      title: "Critical problem",
      description: "This is urgent and we cannot work.",
    });

    expect(result.priority).toBe("HIGH");
  });

  it("generates a summary and a draft reply", () => {
    const result = analyzeTicket({
      title: "Login issue",
      description: "I cannot log in to my account.",
    });

    expect(result.summary).toBe(
      "I cannot log in to my account.",
    );

    expect(result.suggestedReply.length).toBeGreaterThan(0);
  });

  it("trims and summarizes long descriptions", () => {
    const description = `  ${"a".repeat(200)}  `;

    const result = analyzeTicket({
      title: "General question",
      description,
    });

    expect(result.summary).toHaveLength(180);
    expect(result.summary.endsWith("...")).toBe(true);
  });
});
