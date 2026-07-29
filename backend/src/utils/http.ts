import type { Request, Response } from "express";
import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().min(1),
});

export function pagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export function validationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    issues: error.issues,
  });
}

export function cloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "res.cloudinary.com" ||
        url.hostname.endsWith(".cloudinary.com"))
    );
  } catch {
    return false;
  }
}

export const cloudinaryUrlSchema = z
  .string()
  .url()
  .refine(cloudinaryUrl, "Image URL must be hosted by Cloudinary");
