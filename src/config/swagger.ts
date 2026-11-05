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
      url: "https://supportpilot-ai-g2xp.onrender.com",
      description: "Production server",
    },
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
    { name: "Users", description: "User and agent management" },
    { name: "Dashboard", description: "Dashboard statistics and activity" },
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
    "/api/v1/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user",
        description:
          "Returns the profile of the currently logged-in user. Requires a valid JWT.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        userId: { type: "string", format: "uuid" },
                        name: { type: "string", example: "Support Admin" },
                        email: {
                          type: "string",
                          format: "email",
                          example: "admin@example.com",
                        },
                        role: {
                          type: "string",
                          enum: ["CUSTOMER", "AGENT", "ADMIN"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
        },
      },
    },
"/api/v1/tickets": {
    get: {
      tags: ["Tickets"],
      summary: "List and search tickets",
      description:
        "Returns paginated tickets with optional search and status filtering. Customers see their own tickets, agents see tickets assigned to them, and admins see all tickets. Search matches ticket titles and descriptions.",
      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: "search",
          in: "query",
          required: false,
          description: "Search tickets by title or description.",
          schema: {
            type: "string",
            minLength: 1,
            maxLength: 150,
            example: "payment",
          },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number.",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of tickets per page.",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
        {
          name: "status",
          in: "query",
          required: false,
          description: "Filter tickets by status.",
          schema: {
            type: "string",
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
          },
        },
      ],

      responses: {
        "200": {
          description: "Tickets retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "object",
                    properties: {
                      tickets: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              format: "uuid",
                            },
                            title: {
                              type: "string",
                              example: "Payment issue",
                            },
                            description: {
                              type: "string",
                              example: "Unable to complete payment.",
                            },
                            status: {
                              type: "string",
                              enum: [
                                "OPEN",
                                "IN_PROGRESS",
                                "RESOLVED",
                                "CLOSED",
                              ],
                            },
                            priority: {
                              type: "string",
                              enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                            },
                            category: {
                              type: "string",
                              nullable: true,
                            },
                            createdAt: {
                              type: "string",
                              format: "date-time",
                            },
                            creatorId: {
                              type: "string",
                              format: "uuid",
                            },
                            assigneeId: {
                              type: "string",
                              format: "uuid",
                              nullable: true,
                            },
                          },
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: {
                            type: "integer",
                            example: 1,
                          },
                          limit: {
                            type: "integer",
                            example: 10,
                          },
                          total: {
                            type: "integer",
                            example: 25,
                          },
                          totalPages: {
                            type: "integer",
                            example: 3,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Invalid query parameters",
        },
        "401": {
          description: "Authentication required",
        },
        "500": {
          description: "Internal server error",
        },
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

    "/api/v1/users/agents": {
      get: {
        tags: ["Users"],
        summary: "Get available agents",
        description:
          "Returns all AGENT accounts. Requires an authenticated AGENT or ADMIN.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Agents retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string", example: "Support Agent" },
                          email: {
                            type: "string",
                            format: "email",
                            example: "agent@example.com",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "500": { description: "Internal server error" },
        },
      },
    },

    "/api/v1/users/agents/overview": {
      get: {
        tags: ["Users"],
        summary: "Get agent workload overview",
        description:
          "Returns every agent with their total assigned tickets and ticket counts by status. Requires ADMIN role.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Agent workload overview retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string", example: "Support Agent" },
                          email: {
                            type: "string",
                            format: "email",
                            example: "agent@example.com",
                          },
                          totalTickets: {
                            type: "integer",
                            example: 5,
                          },
                          openTickets: {
                            type: "integer",
                            example: 2,
                          },
                          inProgressTickets: {
                            type: "integer",
                            example: 1,
                          },
                          resolvedTickets: {
                            type: "integer",
                            example: 2,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
          "403": { description: "ADMIN role required" },
          "500": { description: "Unable to fetch agents overview" },
        },
      },
    },

    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description:
          "Returns a paginated list of users. Requires ADMIN role. Password hashes and authentication details are never returned.",
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
            name: "role",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["CUSTOMER", "AGENT", "ADMIN"],
            },
          },
        ],
        responses: {
          "200": { description: "Users retrieved successfully" },
          "400": { description: "Invalid query parameters" },
          "401": { description: "Authentication required" },
          "403": { description: "ADMIN role required" },
          "500": { description: "Unable to fetch users" },
        },
      },
    },

    "/api/v1/users/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Update a user's role",
        description:
          "Requires ADMIN role. Only CUSTOMER and AGENT roles can be assigned. Existing ADMIN accounts cannot be modified through this endpoint.",
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
                required: ["role"],
                properties: {
                  role: {
                    type: "string",
                    enum: ["CUSTOMER", "AGENT"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "User role updated successfully" },
          "400": { description: "Invalid user ID or role" },
          "401": { description: "Authentication required" },
          "403": { description: "ADMIN role required or target is an ADMIN" },
          "404": { description: "User not found" },
          "500": { description: "Unable to update user role" },
        },
      },
    },

    "/api/v1/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
        description:
          "Returns ticket counts by status and the five most recent tickets. CUSTOMER users see their own tickets, AGENT users see tickets assigned to them, and ADMIN users see all tickets. ADMIN responses also include global user counts.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      properties: {
                        totalTickets: { type: "integer", example: 12 },
                        openTickets: { type: "integer", example: 4 },
                        inProgressTickets: { type: "integer", example: 3 },
                        resolvedTickets: { type: "integer", example: 4 },
                        closedTickets: { type: "integer", example: 1 },
                        totalUsers: {
                          type: "integer",
                          example: 26,
                          description: "ADMIN only",
                        },
                        totalCustomers: {
                          type: "integer",
                          example: 23,
                          description: "ADMIN only",
                        },
                        totalAgents: {
                          type: "integer",
                          example: 2,
                          description: "ADMIN only",
                        },
                        recentTickets: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string", format: "uuid" },
                              title: {
                                type: "string",
                                example: "Unable to access my account",
                              },
                              status: {
                                type: "string",
                                enum: [
                                  "OPEN",
                                  "IN_PROGRESS",
                                  "RESOLVED",
                                  "CLOSED",
                                ],
                              },
                              priority: {
                                type: "string",
                                enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                              },
                              createdAt: {
                                type: "string",
                                format: "date-time",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
          "500": { description: "Unable to fetch dashboard statistics" },
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
