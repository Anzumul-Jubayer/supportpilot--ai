
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, updateMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    ticket: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

import { analyzeAndSaveTicket } from "./ai.service.js";

describe("analyzeAndSaveTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the ticket does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await analyzeAndSaveTicket(
      "missing-ticket-id",
    );

    expect(result).toBeNull();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("saves AI analysis without overwriting actual priority", async () => {
    findUniqueMock.mockResolvedValue({
      id: "ticket-123",
      title: "Production system is down",
      description: "Our entire technical system is down.",
    });

    updateMock.mockImplementation(
      async ({ data, select }) => ({
        id: "ticket-123",
        title: "Production system is down",
        category: data.category,
        priority: "MEDIUM",
        aiPriority: data.aiPriority,
        aiSummary: data.aiSummary,
        aiReply: data.aiReply,
        updatedAt: new Date(),
        select,
      }),
    );

    const result = await analyzeAndSaveTicket("ticket-123");

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket-123" },
        data: expect.objectContaining({
          category: "TECHNICAL_ISSUE",
          aiPriority: "URGENT",
          aiSummary: "Our entire technical system is down.",
          aiReply: expect.any(String),
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

  it("propagates database errors", async () => {
    findUniqueMock.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(
      analyzeAndSaveTicket("ticket-123"),
    ).rejects.toThrow("Database connection failed");

    expect(updateMock).not.toHaveBeenCalled();
  });
});
