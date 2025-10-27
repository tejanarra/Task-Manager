import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const apiTitle = process.env.APP_NAME || "Task Manager API";
const serverUrl =
  process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: apiTitle,
      version: "1.0.0",
      description:
        "Interactive API documentation for the Task Manager backend.",
      contact: {
        name: "API Support",
        email: process.env.SUPPORT_EMAIL || "support@example.com",
      },
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Paste your JWT after logging in (format: Bearer <token>).",
        },
      },
      schemas: {
        // MODELS
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            firstName: { type: "string", example: "Teja" },
            lastName: { type: "string", example: "Narra" },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            phoneNumber: {
              type: "string",
              nullable: true,
              example: "+1 555-123-4567",
            },
            dob: {
              type: "string",
              format: "date",
              nullable: true,
              example: "1999-05-10",
            },
            isVerified: { type: "boolean", example: true },
            bio: {
              type: "string",
              nullable: true,
              example: "I build cool apps",
            },
            avatar: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/xxx/image/upload/...",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "integer", example: 42 },
            title: { type: "string", example: "Finish project report" },
            description: {
              type: "string",
              example: "Complete and proofread the final report",
            },
            status: {
              type: "string",
              enum: ["not-started", "in-progress", "completed"],
              example: "not-started",
            },
            userId: { type: "integer", example: 1 },
            priority: { type: "integer", example: 1 },
            deadline: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2025-12-31T18:00:00.000Z",
            },
            reminders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  remindBefore: {
                    type: "number",
                    description: "Hours before deadline",
                    example: 24,
                  },
                  type: {
                    type: "string",
                    enum: ["one-time", "daily", "weekly"],
                    example: "one-time",
                  },
                  dayNumber: { type: "integer", nullable: true },
                  weekNumber: { type: "integer", nullable: true },
                  customDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  sent: { type: "boolean", example: false },
                },
              },
              example: [{ remindBefore: 24, type: "one-time", sent: false }],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // REQUEST BODIES
        RegisterRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
          example: {
            firstName: "Teja",
            lastName: "Narra",
            email: "user@example.com",
            password: "StrongP@ssw0rd",
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
          example: { email: "user@example.com", password: "StrongP@ssw0rd" },
        },
        VerifyRegistrationRequest: {
          type: "object",
          required: ["email", "verificationCode"],
          properties: {
            email: { type: "string", format: "email" },
            verificationCode: { type: "string", example: "123456" },
          },
        },
        ResendVerificationRequest: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
        VerifyCodeResetRequest: {
          type: "object",
          required: ["email", "verificationCode", "newPassword"],
          properties: {
            email: { type: "string", format: "email" },
            verificationCode: { type: "string" },
            newPassword: { type: "string", format: "password" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", format: "password" },
            newPassword: { type: "string", format: "password" },
          },
        },
        GoogleLoginRequest: {
          type: "object",
          required: ["code"],
          properties: {
            code: {
              type: "string",
              description: "Google OAuth authorization code",
            },
          },
        },
        ContactRequest: {
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["yourName", "yourEmail", "subject", "message"],
              properties: {
                yourName: { type: "string" },
                yourEmail: { type: "string", format: "email" },
                subject: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            phoneNumber: { type: "string" },
            dob: { type: "string", format: "date" },
            bio: { type: "string", maxLength: 500 },
          },
        },
        CreateTaskRequest: {
          type: "object",
          required: ["title", "description", "status"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            status: {
              type: "string",
              enum: ["not-started", "in-progress", "completed"],
            },
            deadline: { type: "string", format: "date-time", nullable: true },
            reminders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  remindBefore: { type: "number" },
                  type: {
                    type: "string",
                    enum: ["one-time", "daily", "weekly"],
                  },
                  customDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                },
              },
            },
          },
        },
        UpdateTaskRequest: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            status: {
              type: "string",
              enum: ["not-started", "in-progress", "completed"],
            },
            deadline: { type: "string", format: "date-time", nullable: true },
            reminders: {
              $ref: "#/components/schemas/Task/properties/reminders",
            },
          },
        },
        UpdatePriorityRequest: {
          type: "object",
          required: ["priority"],
          properties: { priority: { type: "integer", minimum: 1 } },
          example: { priority: 2 },
        },
        AiGenerateTaskRequest: {
          type: "object",
          required: ["prompt"],
          properties: { prompt: { type: "string" } },
          example: { prompt: "Finish capstone report by next Friday 7pm" },
        },
        AiConversationRequest: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string" },
            conversationHistory: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["user", "assistant"] },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        // GENERIC RESPONSES
        AuthResponse: {
          type: "object",
          properties: {
            code: { type: "string", example: "AUTH008" },
            message: { type: "string", example: "Login successful." },
            token: { type: "string", example: "<jwt>" },
            userInfo: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string", format: "email" },
                avatar: { type: "string", nullable: true },
              },
            },
          },
        },
        VerificationSentResponse: {
          type: "object",
          properties: {
            code: { type: "string", example: "PWD002" },
            message: {
              type: "string",
              example: "Verification code sent if email exists.",
            },
          },
        },
        MessageResponse: {
          type: "object",
          properties: { message: { type: "string" } },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Bad Request" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication & verification" },
      { name: "Profile", description: "User profile operations" },
      { name: "Tasks", description: "Task CRUD & priority" },
      { name: "AI", description: "AI task generation & conversation" },
    ],
  },
  // Scan both routes and controllers for JSDoc annotations
  apis: ["./routes/**/*.js", "./controllers/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
