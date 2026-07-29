import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";
const schema = z.object({
  orderId: z.string().min(1),
  type: z.enum(["SHIPPING", "BILLING"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().nullable().optional(),
  phone: z.string().min(7),
  countryCode: z.string().length(2).default("US"),
  country: z.string().default("United States"),
  state: z.string().min(1),
  city: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().nullable().optional(),
  postalCode: z.string().min(1),
});
export const listOrderAddresses = async (req: Request, res: Response) =>
  res.json({
    success: true,
    addresses: await prisma.orderAddress.findMany({
      where: req.query.orderId
        ? { orderId: String(req.query.orderId) }
        : undefined,
    }),
  });
export const createOrderAddress = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res
    .status(201)
    .json({
      success: true,
      address: await prisma.orderAddress.create({ data: p.data }),
    });
};
export const updateOrderAddress = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const p = schema.partial().safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.json({
    success: true,
    address: await prisma.orderAddress.update({ where: { id }, data: p.data }),
  });
};
export const deleteOrderAddress = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.orderAddress.delete({ where: { id } });
  return res.status(204).send();
};
