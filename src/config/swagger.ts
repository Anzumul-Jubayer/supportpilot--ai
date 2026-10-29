
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import type { OpenAPIV3 } from "openapi-types";

const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",

  info: {
    title: "SupportPilot AI API",
    version: "1.0.0",
    description:
      "API documentation for SupportPilot AI, a customer support ticket management API.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],

  tags: [
    { name: "Health", description: "API health checks" },
    { name: "Authentication", description: "Registration and login" },
    { name: "Tickets", description: "Support ticket management" },
    { name: "Comments", description: "Ticket comments" },
    { name: "AI", description: "AI-assisted ticket analysis" },
  ],

  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": { description: "API is running" },
        },
      },
    },

    "/api/v1/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a customer account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 100 },
                  email: { type: "string", format: "email" },
                  password: {
                    type: "string",
                    minLength: 8,
                    maxLength: 72,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User registered successfully" },
          "400": { description: "Invalid registration data" },
          "409": { description: "Email already exists" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: {
                    type: "string",
                    minLength: 1,
                    maxLength: 72,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "400": { description: "Invalid login data" },
          "401": { description: "Invalid email or password" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/tickets": {
      post: {
        tags: ["Tickets"],
        summary: "Create a ticket",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description"],
                properties: {
                  title: { type: "string", minLength: 5, maxLength: 150 },
                  description: {
                    type: "string",
                    minLength: 10,
                    maxLength: 5000,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Ticket created successfully" },
          "400": { description: "Invalid ticket data" },
          "401": { description: "Authentication required" },
          "500": { description: "Internal server error" },
        },
      },

      get: {
        tags: ["Tickets"],
        summary: "List tickets",
        description:
          "Customers see their own tickets. Results are paginated and can be filtered by status.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
            },
          },
        ],
        responses: {
          "200": { description: "Tickets retrieved successfully" },
          "400": { description: "Invalid query parameters" },
          "401": { description: "Authentication required" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Get ticket details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Ticket retrieved successfully" },
          "400": { description: "Invalid ticket ID" },
          "401": { description: "Authentication required" },
          "404": { description: "Ticket not found or inaccessible" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/tickets/{id}/status": {
      patch: {
        tags: ["Tickets"],
        summary: "Update ticket status",
        description: "Requires an AGENT or ADMIN role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Ticket status updated successfully" },
          "400": { description: "Invalid ticket ID or status" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Ticket not found" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/tickets/{id}/assign": {
      patch: {
        tags: ["Tickets"],
        summary: "Assign a ticket to an agent",
        description: "Requires an AGENT or ADMIN role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["assigneeId"],
                properties: {
                  assigneeId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Ticket assigned successfully" },
          "400": { description: "Invalid ticket ID or assignee ID" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Ticket or agent not found" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/tickets/{id}/comments": {
      post: {
        tags: ["Comments"],
        summary: "Add a comment to a ticket",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: { type: "string", minLength: 1, maxLength: 3000 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Comment created successfully" },
          "400": { description: "Invalid ticket ID or comment content" },
          "401": { description: "Authentication required" },
          "404": { description: "Ticket not found or access denied" },
          "500": { description: "Internal server error" },
        },
      },

      get: {
        tags: ["Comments"],
        summary: "List ticket comments",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Comments retrieved successfully" },
          "400": { description: "Invalid ticket ID" },
          "401": { description: "Authentication required" },
          "404": { description: "Ticket not found or access denied" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/ai/tickets/{id}/analyze": {
      post: {
        tags: ["AI"],
        summary: "Analyze a support ticket",
        description:
          "Analyzes a ticket and saves its category, AI priority, summary, and suggested reply. Requires an authenticated AGENT or ADMIN.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID of the ticket",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Ticket analyzed successfully" },
          "400": { description: "Invalid ticket ID" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Ticket not found" },
          "500": { description: "Internal server error" },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
