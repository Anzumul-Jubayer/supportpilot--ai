
import { beforeEach, describe, expect, it, vi } from "vitest";
process.env.GEMINI_API_KEY = "test-api-key";
const { findUniqueMock, updateMock, generateContentMock } =
  vi.hoisted(() => ({
    findUniqueMock: vi.fn(),
    updateMock: vi.fn(),
    generateContentMock: vi.fn(),
  }));

vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    ticket: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: generateContentMock,
    };
  },
}));

import { analyzeAndSaveTicket } from "./ai.service.js";

describe("analyzeAndSaveTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
  });

  it("returns null when the ticket does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await analyzeAndSaveTicket("missing-ticket-id");

    expect(result).toBeNull();
    expect(generateContentMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("saves AI analysis without overwriting actual priority", async () => {
    findUniqueMock.mockResolvedValue({
      id: "ticket-123",
      title: "Production system is down",
      description: "Our entire technical system is down.",
    });

    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        category: "TECHNICAL_ISSUE",
        priority: "URGENT",
        summary: "The production system is down.",
        suggestedReply: "We are investigating this issue urgently.",
      }),
    });

    updateMock.mockImplementation(async ({ data }) => ({
      id: "ticket-123",
      title: "Production system is down",
      category: data.category,
      priority: "MEDIUM",
      aiPriority: data.aiPriority,
      aiSummary: data.aiSummary,
      aiReply: data.aiReply,
      updatedAt: new Date(),
    }));

    const result = await analyzeAndSaveTicket("ticket-123");

    expect(generateContentMock).toHaveBeenCalledOnce();

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket-123" },
        data: expect.objectContaining({
          category: "TECHNICAL_ISSUE",
          aiPriority: "URGENT",
          aiSummary: "The production system is down.",
          aiReply: "We are investigating this issue urgently.",
        }),
      }),
    );

    const updateArguments = updateMock.mock.calls[0][0];

    expect(updateArguments.data).not.toHaveProperty("priority");

    expect(result).toMatchObject({
      priority: "MEDIUM",
      aiPriority: "URGENT",
      category: "TECHNICAL_ISSUE",
    });
  });

  it("rejects invalid AI priority", async () => {
    findUniqueMock.mockResolvedValue({
      id: "ticket-123",
      title: "Test ticket",
      description: "Test description",
    });

    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        category: "TECHNICAL_ISSUE",
        priority: "CRITICAL",
        summary: "Test summary",
        suggestedReply: "Test reply",
      }),
    });

    await expect(
      analyzeAndSaveTicket("ticket-123"),
    ).rejects.toThrow("Gemini returned invalid ticket analysis");

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("propagates database errors", async () => {
    findUniqueMock.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(
      analyzeAndSaveTicket("ticket-123"),
    ).rejects.toThrow("Database connection failed");

    expect(generateContentMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });
});
