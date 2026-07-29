import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";
const schema = z.object({
  orderId: z.string().min(1),
  status: z
    .enum([
      "PENDING",
      "READY",
      "SHIPPED",
      "IN_TRANSIT",
      "DELIVERED",
      "FAILED",
      "RETURNED",
    ])
    .optional(),
  carrier: z.string().nullable().optional(),
  service: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  trackingUrl: z.string().url().nullable().optional(),
  shippedAt: z.coerce.date().nullable().optional(),
  deliveredAt: z.coerce.date().nullable().optional(),
});
export const listFulfillments = async (req: Request, res: Response) =>
  res.json({
    success: true,
    fulfillments: await prisma.fulfillment.findMany({
      where: req.query.orderId
        ? { orderId: String(req.query.orderId) }
        : undefined,
      include: { items: { include: { orderItem: true } } },
      orderBy: { createdAt: "desc" },
    }),
  });
export const createFulfillment = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res
    .status(201)
    .json({
      success: true,
      fulfillment: await prisma.fulfillment.create({ data: p.data }),
    });
};
export const updateFulfillment = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const p = schema.partial().safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.json({
    success: true,
    fulfillment: await prisma.fulfillment.update({
      where: { id },
      data: p.data,
    }),
  });
};
