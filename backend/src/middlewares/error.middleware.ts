import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found`,
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      issues: error.issues,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with that unique value already exists",
      });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
    if (error.code === "P2003") {
      res.status(409).json({
        success: false,
        message: "This record is referenced by another resource",
      });
      return;
    }
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Internal server error",
  });
};
