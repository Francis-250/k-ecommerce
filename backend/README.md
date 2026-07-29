# Express + TypeScript + Better Auth + Prisma + Swagger

A production-ready Express.js API template with Better Auth, Prisma (Neon PostgreSQL), Brevo email, and Swagger UI documentation.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [1. Initialize the Project](#1-initialize-the-project)
- [2. Install Dependencies](#2-install-dependencies)
- [3. TypeScript Configuration](#3-typescript-configuration)
- [4. Environment Variables](#4-environment-variables)
- [5. Prisma Setup](#5-prisma-setup)
- [6. Lib: Prisma Client](#6-lib-prisma-client)
- [7. Lib: Email (Brevo)](#7-lib-email-brevo)
- [8. Email Templates](#8-email-templates)
- [9. Better Auth Config](#9-better-auth-config)
- [10. Auth Client](#10-auth-client)
- [11. Swagger Docs](#11-swagger-docs)
- [12. Middleware](#12-middleware)
- [13. Express Types Declaration](#13-express-types-declaration)
- [14. User Service, Controller, and Route](#14-user-service-controller-and-route)
- [15. Main App Entry](#15-main-app-entry)
- [16. Package.json Scripts](#16-packagejson-scripts)
- [17. Running the App](#17-running-the-app)

---

## Project Structure

```
├── src/
│   ├── lib/
│   │   ├── auth.ts           # Better Auth config
│   │   ├── prisma.ts         # Prisma client
│   │   └── brevo.ts          # Brevo email sender
│   ├── docs/
│   │   └── swagger.ts        # Swagger UI router
│   ├── utils/
│   │   └── email.temp.ts     # Email HTML templates
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── services/
│   │   └── user.service.ts   # User database operations
│   ├── controllers/
│   │   └── user.controller.ts # User request handlers
│   ├── routes/
│   │   └── user.routes.ts    # User API routes
│   ├── types/
│   │   └── express.d.ts      # Express type augmentation
│   └── app.ts                # App entry point
├── prisma/
│   └── schema.prisma
├── .env
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)
- Brevo account for email
- Google OAuth credentials (optional)

---

## 1. Initialize the Project

```bash
mkdir my-api && cd my-api
pnpm init
```

---

## 2. Install Dependencies

```bash
# Core
pnpm add express better-auth @prisma/client @prisma/adapter-neon dotenv cors

# Email
pnpm add node-fetch

# Swagger
pnpm add swagger-ui-express

# Dev
pnpm add -D typescript ts-node tsx @types/node @types/express @types/cors \
  @types/swagger-ui-express prisma openapi-types
```

---

## 3. TypeScript Configuration

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "rootDir": "./src",
    "outDir": "./dist",
    "noEmitOnError": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "ignoreDeprecations": "6.0"
  },
  "include": ["src/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 4. Environment Variables

**`.env`**

```env
# App
PORT=5000

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:5000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Brevo Email
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="no-reply@yourdomain.com"
BREVO_SENDER_NAME="Your App"

# Doctor alerts (optional)
DOCTOR_ALERT_EMAIL="doctor@yourdomain.com"
```

---

## 5. Prisma Setup

```bash
pnpm prisma init
```

**`prisma/schema.prisma`**

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run Better Auth's CLI to generate the auth schema:

```bash
pnpm dlx better-auth generate
```

Apply migrations:

```bash
pnpm prisma migrate dev --name init
# or for Neon (no shadow DB):
pnpm prisma db push
```

---

## 6. Lib: Prisma Client

**`src/lib/prisma.ts`**

```ts
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

// ── Local PostgreSQL alternative ──────────────────────────────
// import { PrismaPg } from "@prisma/adapter-pg";
// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// export const prisma = new PrismaClient({ adapter });
```

---

## 7. Lib: Email (Brevo)

**`src/lib/brevo.ts`**

```ts
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail =
      process.env.BREVO_SENDER_EMAIL ?? process.env.BREVO_EMAIL_USER;
    const senderName = process.env.BREVO_SENDER_NAME || "";

    if (!apiKey) {
      console.error("Email error: BREVO_API_KEY is not configured");
      return false;
    }

    if (!senderEmail) {
      console.error("Email error: BREVO_SENDER_EMAIL is not configured");
      return false;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
    });

    const responseText = await response.text();
    let responseBody: unknown = responseText;

    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      // Brevo can return a non-JSON proxy response
    }

    if (!response.ok) {
      console.error("Brevo email error:", { status: response.status, response: responseBody });
      return false;
    }

    console.log("Email sent to:", to);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

export const sendEmailOrThrow = async (options: EmailOptions) => {
  const sent = await sendEmail(options);
  if (!sent) {
    throw new Error("Email delivery failed. Check the Brevo sender configuration.");
  }
};
```

---

## 8. Email Templates

**`src/utils/email.temp.ts`**

```ts
// ─── Reset Password ───────────────────────────────────────────
export const resetPasswordTemplate = ({
  username,
  resetUrl,
}: {
  username: string;
  resetUrl: string;
}) => ({
  subject: "Reset your password — MyApp",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e;">Reset your password</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #888; font-size: 13px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #aaa; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `,
  text: `Reset your password\n\nHi ${username},\n\n${resetUrl}\n\nExpires in 1 hour.`,
});

// ─── Verification OTP ─────────────────────────────────────────
export const verificationOtpTemplate = ({
  username,
  otp,
  expiresInMinutes = 10,
}: {
  username: string;
  otp: string;
  expiresInMinutes?: number;
}) => ({
  subject: "Your verification code — MyApp",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e;">Your verification code</h2>
      <p>Hi ${username},</p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: #1a1a2e; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px 36px; border-radius: 8px;">
          ${otp}
        </div>
      </div>
      <p style="text-align: center; color: #888; font-size: 13px;">Expires in <strong>${expiresInMinutes} minutes</strong>.</p>
      <p style="color: #aaa; font-size: 12px;">If you didn't request this, ignore this email.</p>
    </div>
  `,
  text: `Your code: ${otp}\n\nExpires in ${expiresInMinutes} minutes.`,
});
```

---

## 9. Better Auth Config

**`src/lib/auth.ts`**

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  admin,
  emailOTP,
  lastLoginMethod,
  openAPI,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";
import { prisma } from "./prisma";
import { sendEmail } from "./brevo";
import { resetPasswordTemplate, verificationOtpTemplate } from "../utils/email.temp";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 3,
    maxPasswordLength: 100,
    sendResetPassword: async ({ user, url }) => {
      const template = resetPasswordTemplate({
        username: user.name ?? user.email,
        resetUrl: url,
      });
      // no await — avoids timing attacks
      sendEmail({ to: user.email, ...template });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    phoneNumber(),
    username(),
    admin(),
    lastLoginMethod(),

    emailOTP({
      otpLength: 6,
      expiresIn: 20 * 60,       // 20 minutes
      sendVerificationOnSignUp: true,
      allowedAttempts: 3,

      async sendVerificationOTP({ email, otp, type }) {
        const subjects: Record<string, string> = {
          "sign-in":            "Your sign-in code — MyApp",
          "email-verification": "Verify your email — MyApp",
          "forget-password":    "Reset your password — MyApp",
        };
        await sendEmail({
          to: email,
          subject: subjects[type] ?? "Your code — MyApp",
          ...verificationOtpTemplate({ username: email, otp, expiresInMinutes: 20 }),
        });
      },
    }),

    twoFactor(),
    openAPI(),
  ],
});

export type Session = typeof auth.$Infer.Session;
```

---

## 10. Auth Client

**`src/lib/auth-client.ts`**

```ts
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  emailOTPClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5000",

  plugins: [
    adminClient(),
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
      // or use callback to avoid full page reload:
      // onTwoFactorRedirect({ twoFactorMethods }) {
      //   window.location.href = "/two-factor";
      // },
    }),
    lastLoginMethodClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
```

**Client usage reference:**

```ts
// Sign in
await authClient.signIn.email({ email, password });
await authClient.signIn.username({ username, password });
await authClient.signIn.social({ provider: "google" });
await authClient.signOut();

// Email OTP
await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
await authClient.emailOtp.sendVerificationOtp({ email, type: "forget-password" });
await authClient.signIn.emailOtp({ email, otp });
await authClient.emailOtp.verifyEmail({ email, otp });
await authClient.emailOtp.resetPassword({ email, otp, password });

// OTP flow for password reset
// POST /email-otp/request-password-reset  { email }
// POST /email-otp/check-verification-otp  { email, otp, type: "forget-password" }
// POST /email-otp/reset-password          { email, otp, password }

// Phone
await authClient.phoneNumber.sendOtp({ phoneNumber: "+1234567890" });
await authClient.phoneNumber.verify({ phoneNumber: "+1234567890", code: "123456" });
await authClient.phoneNumber.requestPasswordReset({ phoneNumber: "+1234567890" });

// Two factor
await authClient.twoFactor.enable({ password, issuer: "MyApp" });
await authClient.twoFactor.disable({ password });
await authClient.twoFactor.verifyTotp({ code: "123456" });

// Admin
await authClient.admin.createUser({ email, password, name, role: "user" });
await authClient.admin.listUsers({ query: { limit: 10 } });
await authClient.admin.banUser({ userId: "abc123" });
await authClient.admin.setRole({ userId: "abc123", role: "admin" });

// Last login method
const lastMethod = authClient.getLastUsedLoginMethod();
// returns "google" | "email" | etc.
```

---

## 11. Swagger Docs

**`src/docs/swagger.ts`**

```ts
import swaggerUi from "swagger-ui-express";
import { auth } from "../lib/auth";
import { Router } from "express";

const router = Router();

router.use(swaggerUi.serve);

router.get("/", async (req, res, next) => {
  try {
    const schema = await auth.api.generateOpenAPISchema();

    const enrichedSchema = {
      ...schema,
      info: {
        ...schema.info,
        title: "My API",
        description: "Full API reference powered by Better Auth",
      },
      servers: [
        { url: "http://localhost:5000", description: "Local" },
      ],
    };

    const html = swaggerUi.generateHTML(enrichedSchema, {
      customSiteTitle: "My API Docs",
      customCss: `
        .topbar { background-color: #1a1a2e; }
        .topbar-wrapper img { display: none; }
        .topbar-wrapper::after {
          content: 'My API';
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
        }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    });

    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
```

---

## 12. Middleware

**`src/middlewares/auth.middleware.ts`**

```ts
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const requireRole = (role: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      req.user = session.user;
      req.session = session.session;

      const userRole = session.user.role;
      const allowedRoles = Array.isArray(role) ? role : [role];

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Required role: ${allowedRoles.join(" or ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
```

**Usage:**

```ts
// Single role
router.get("/admin", requireRole("admin"), handler);

// Multiple roles
router.get("/dashboard", requireRole(["admin", "moderator"]), handler);

// Auth only (no role check)
router.get("/profile", requireAuth, handler);
```

---

## 13. Express Types Declaration

**`src/types/express.d.ts`**

```ts
import { Session } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      user?: Session["user"];
      session?: Session["session"];
    }
  }
}

export {};
```

---

## 14. User Service, Controller, and Route

### Service

**`src/services/user.service.ts`**

```ts
import { prisma } from "../lib/prisma";

export class UserService {
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany();

      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }
}
```

### Controller

**`src/controllers/user.controller.ts`**

```ts
import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
```

### Route

**`src/routes/user.routes.ts`**

```ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireRole } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.get("/", requireRole("admin"), userController.getAllUsers.bind(userController));

export default router;
```

The route is mounted in `src/app.ts` at:

```ts
app.use("/api/users", UserRoutes);
```

`GET /api/users` requires an authenticated user with the `admin` role.

---

## 15. Main App Entry

**`src/app.ts`**

```ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import swaggerRouter from "./docs/swagger";
import UserRoutes from "./routes/user.routes";

const app = express();
const port = process.env.PORT;

// ── CORS ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// ── Better Auth — must be before express.json() ───────────────
app.all("/api/auth/*splat", toNodeHandler(auth));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json());

// ── Swagger UI ────────────────────────────────────────────────
app.use("/api-docs", swaggerRouter);

// ── Raw OpenAPI JSON schema ───────────────────────────────────
app.get("/api-docs.json", async (req, res) => {
  const schema = await auth.api.generateOpenAPISchema();
  res.json(schema);
});

// ── User routes ───────────────────────────────────────────────
app.use("/api/users", UserRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

> **Important:** `app.all("/api/auth/*splat", toNodeHandler(auth))` must be registered **before** `app.use(express.json())`. Better Auth handles its own body parsing.

---

## 16. Package.json Scripts

**`package.json`**

```json
{
  "scripts": {
    "start": "tsx src/app.ts",
    "dev": "nodemon --exec tsx src/app.ts",
    "build": "tsc",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

---

## 17. Running the App

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm db:generate

# 3. Push schema to DB
pnpm db:push

# 4. Start dev server
pnpm dev
```

### Available URLs

| URL | Description |
|---|---|
| `http://localhost:5000/api/auth/reference` | Scalar UI (Better Auth built-in) |
| `http://localhost:5000/api-docs` | Swagger UI |
| `http://localhost:5000/api-docs.json` | Raw OpenAPI JSON |
| `http://localhost:5000/api/auth/*` | All Better Auth endpoints |
| `http://localhost:5000/api/users` | Admin-only user list endpoint |

---

## Notes

- `toNodeHandler(auth)` must be registered before `express.json()`
- For Neon DB use `PrismaNeon`; for local Postgres use `PrismaPg` (see `prisma.ts`)
- The deprecated endpoint `/forget-password/email-otp` — use `/email-otp/request-password-reset` instead
