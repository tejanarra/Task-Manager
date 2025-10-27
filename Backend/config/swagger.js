import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

const apiTitle = process.env.APP_NAME || "Task Manager API";
const port = process.env.PORT || 5001;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: apiTitle,
      version: "1.0.0",
      description:
        "Interactive API documentation for the Task Manager backend.",
      contact: {
        name: "Support",
        email: process.env.SUPPORT_EMAIL || "support@example.com",
      },
    },
    servers: [
      { url: serverUrl, description: "Local Server" },
      ...(process.env.CLIENT_URL
        ? [{ url: process.env.CLIENT_URL, description: "Production App" }]
        : []),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            phoneNumber: { type: "string", nullable: true },
            dob: { type: "string", format: "date", nullable: true },
            bio: { type: "string", nullable: true },
            avatar: { type: "string", nullable: true },
            isVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        TaskReminder: {
          type: "object",
          properties: {
            id: { type: "integer" },
            type: {
              type: "string",
              enum: ["ONE_TIME", "DAILY", "WEEKLY"],
            },
            triggerAtUTC: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            hourOfDayUTC: {
              type: "integer",
              minimum: 0,
              maximum: 23,
              nullable: true,
            },
            dayOfWeek: {
              type: "integer",
              minimum: 0,
              maximum: 6,
              nullable: true,
            },
          },
        },

        Task: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
            },
            priority: { type: "integer" },
            deadlineUTC: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            reminders: {
              type: "array",
              items: { $ref: "#/components/schemas/TaskReminder" },
            },
            userId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        CreateTaskRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
            },
            deadlineUTC: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },

        UpdateTaskRequest: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
            },
            deadlineUTC: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },

        UpdatePriorityRequest: {
          type: "object",
          required: ["priority"],
          properties: {
            priority: { type: "integer", minimum: 1 },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },

        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],

    tags: [
      { name: "Auth", description: "Authentication & Verification" },
      { name: "Profile", description: "User Profile Management" },
      { name: "Tasks", description: "Task & Priority Management" },
      { name: "AI", description: "AI Assistant for Task Creation" },
    ],
  },
  apis: ["./routes/**/*.js", "./controllers/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi, swaggerSpec };
