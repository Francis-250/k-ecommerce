import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  cloudinaryUrlSchema,
  idParamsSchema,
  validationError,
} from "../utils/http";
const schema = z.object({
  orderId: z.string().min(1),
  productId: z.string().nullable().optional(),
  variantId: z.string().nullable().optional(),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  sku: z.string().nullable().optional(),
  imageUrl: cloudinaryUrlSchema.nullable().optional(),
  options: z.record(z.string(), z.string()).optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.coerce.number().nonnegative(),
  discountTotal: z.coerce.number().nonnegative().optional(),
  taxTotal: z.coerce.number().nonnegative().optional(),
  total: z.coerce.number().nonnegative(),
});
export const listOrderItems = async (req: Request, res: Response) => {
  const items = await prisma.orderItem.findMany({
    where: req.query.orderId
      ? { orderId: String(req.query.orderId) }
      : undefined,
    orderBy: { createdAt: "asc" },
  });
  return res.json({ success: true, items });
};
export const createOrderItem = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const item = await prisma.orderItem.create({ data: parsed.data as any });
  return res.status(201).json({ success: true, item });
};
export const updateOrderItem = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const item = await prisma.orderItem.update({
    where: { id },
    data: parsed.data as any,
  });
  return res.json({ success: true, item });
};
export const deleteOrderItem = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.orderItem.delete({ where: { id } });
  return res.status(204).send();
};
