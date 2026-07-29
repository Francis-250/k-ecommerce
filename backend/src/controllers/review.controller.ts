import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";
const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(160).nullable().optional(),
  body: z.string().trim().max(3000).nullable().optional(),
});
export const listReviews = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = {
    status: "APPROVED" as const,
    ...(req.query.productId ? { productId: String(req.query.productId) } : {}),
  };
  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where }),
  ]);
  return res.json(paginated(reviews, total, page, limit));
};
export const createReview = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const verified = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: {
        userId: req.auth!.sub,
        status: { in: ["COMPLETED", "PARTIALLY_REFUNDED"] },
      },
    },
    select: { id: true },
  });
  const review = await prisma.review.create({
    data: {
      ...parsed.data,
      userId: req.auth!.sub,
      isVerified: Boolean(verified),
      status: "PENDING",
    },
  });
  return res.status(201).json({ success: true, review });
};
export const updateReview = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.omit({ productId: true }).partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const result = await prisma.review.updateMany({
    where: { id, userId: req.auth!.sub },
    data: { ...parsed.data, status: "PENDING", publishedAt: null },
  });
  if (!result.count)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  return res.json({ success: true });
};
export const deleteReview = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.review.deleteMany({
    where: { id, userId: req.auth!.sub },
  });
  if (!result.count)
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  return res.status(204).send();
};
export const moderateReview = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = z
    .object({ status: z.enum(["APPROVED", "REJECTED"]) })
    .safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const review = await prisma.review.update({
    where: { id },
    data: {
      status: parsed.data.status,
      publishedAt: parsed.data.status === "APPROVED" ? new Date() : null,
    },
  });
  return res.json({ success: true, review });
};
