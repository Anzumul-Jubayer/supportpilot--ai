import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { analyzeMock, authenticateMock } = vi.hoisted(() => ({
  analyzeMock: vi.fn(),
  authenticateMock: vi.fn(),
}));

vi.mock("./ai.service.js", () => ({
  analyzeAndSaveTicket: analyzeMock,
}));

vi.mock("../auth/auth.middleware.js", () => ({
  authenticate: authenticateMock,
}));

import app from "../../app.js";

describe("AI analysis API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authenticateMock.mockImplementation((req, _res, next) => {
      req.user = {
        id: "agent-123",
        role: "AGENT",
      };
      next();
    });
  });

  it("returns 200 when ticket analysis succeeds", async () => {
    analyzeMock.mockResolvedValue({
      id: "ticket-123",
      title: "Production system is down",
      category: "TECHNICAL_ISSUE",
      priority: "MEDIUM",
      aiPriority: "URGENT",
      aiSummary: "Our technical system is down.",
      aiReply: "Thank you for contacting support.",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await request(app).post(
      "/api/v1/ai/tickets/550e8400-e29b-41d4-a716-446655440000/analyze",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.aiPriority).toBe("URGENT");
    expect(analyzeMock).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });

  it("returns 400 for an invalid ticket ID", async () => {
    const response = await request(app).post(
      "/api/v1/ai/tickets/not-a-uuid/analyze",
    );

    expect(response.status).toBe(400);
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the ticket does not exist", async () => {
    analyzeMock.mockResolvedValue(null);

    const response = await request(app).post(
      "/api/v1/ai/tickets/550e8400-e29b-41d4-a716-446655440000/analyze",
    );

    expect(response.status).toBe(404);
  });

  it("returns 403 for a customer", async () => {
    authenticateMock.mockImplementation((req, _res, next) => {
      req.user = {
        id: "customer-123",
        role: "CUSTOMER",
      };
      next();
    });

    const response = await request(app).post(
      "/api/v1/ai/tickets/550e8400-e29b-41d4-a716-446655440000/analyze",
    );

    expect(response.status).toBe(403);
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it("returns 401 when authentication fails", async () => {
    authenticateMock.mockImplementation((_req, res, _next) => {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    });

    const response = await request(app).post(
      "/api/v1/ai/tickets/550e8400-e29b-41d4-a716-446655440000/analyze",
    );

    expect(response.status).toBe(401);
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the AI service throws an error", async () => {
    analyzeMock.mockRejectedValue(new Error("Database connection failed"));

    const response = await request(app).post(
      "/api/v1/ai/tickets/550e8400-e29b-41d4-a716-446655440000/analyze",
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal server error",
    });
  });
});
