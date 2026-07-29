import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "Ecommerce API",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local server",
      },
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
            id: {
              type: "string",
              description: "The auto-generated id of the user",
              example: "cm7p6vx4x0000vswe5g7h5k9q",
            },
            name: {
              type: "string",
              description: "The name of the user",
              example: "John Doe",
            },
            email: {
              type: "string",
              description: "The email of the user",
              example: "john@example.com",
            },
            username: {
              type: "string",
              description: "The username of the user",
              example: "johndoe",
            },
            phone: {
              type: "string",
              nullable: true,
              description: "The phone number of the user",
              example: "+1234567890",
            },
            role: {
              type: "string",
              enum: ["host", "guest"],
              description: "The role of the user",
              example: "guest",
            },
            avatar: {
              type: "string",
              nullable: true,
              description: "The avatar URL of the user",
              example: "https://example.com/avatar.jpg",
            },
            bio: {
              type: "string",
              nullable: true,
              description: "The bio of the user",
              example: "Travel enthusiast",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
              example: "Resource not found",
            },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "username", "password", "role"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            username: { type: "string", example: "johndoe" },
            phone: { type: "string", example: "+1234567890" },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
            role: { type: "string", enum: ["host", "guest"], example: "guest" },
            avatar: {
              type: "string",
              format: "binary",
              description: "Profile picture",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "john@example.com" },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        ChangePasswordInput: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
              format: "password",
              example: "oldpassword123",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "newpassword123",
            },
          },
        },
        ForgotPasswordInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", example: "john@example.com" },
          },
        },
        ResetPasswordInput: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: { type: "string", example: "reset-token-12345" },
            newPassword: {
              type: "string",
              format: "password",
              example: "newpassword123",
            },
          },
        },
        VerifyOtpInput: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", example: "john@example.com" },
            otp: { type: "string", example: "123456" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: {
        withCredentials: true,
      },
    }),
  );

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log("Swagger docs available at http://localhost:4000/api-docs");
};
