import express, { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import { setupSwagger } from "./docs/swagger";

import usersRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const isProduction = process.env.NODE_ENV === "production";
const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:4000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  ...envAllowedOrigins,
].filter(Boolean) as string[];

const devOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;

function isAllowedOrigin(origin: string) {
  return (
    allowedOrigins.includes(origin) ||
    (!isProduction && devOriginPattern.test(origin))
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Ecommerce API" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Api is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
