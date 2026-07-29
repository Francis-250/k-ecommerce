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
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  stripeRefundId: z.string().nullable().optional(),
  status: z.enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELLED"]).optional(),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).default("USD"),
  reason: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  processedAt: z.coerce.date().nullable().optional(),
});
export const listRefunds = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = req.query.orderId
    ? { orderId: String(req.query.orderId) }
    : undefined;
  const [refunds, total] = await prisma.$transaction([
    prisma.refund.findMany({
      where,
      skip,
      take: limit,
      include: { payment: true, order: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.refund.count({ where }),
  ]);
  return res.json(paginated(refunds, total, page, limit));
};
export const createRefund = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  const refund = await prisma.refund.create({ data: p.data });
  return res.status(201).json({ success: true, refund });
};
export const updateRefund = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const p = schema.partial().safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.json({
    success: true,
    refund: await prisma.refund.update({ where: { id }, data: p.data }),
  });
};
