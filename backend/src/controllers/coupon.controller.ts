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
  code: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(160),
  description: z.string().max(1000).nullable().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING", "BUY_X_GET_Y"]),
  status: z.enum(["DRAFT", "ACTIVE", "DISABLED", "EXPIRED"]).optional(),
  value: z.coerce.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional(),
  minimumSubtotal: z.coerce.number().nonnegative().nullable().optional(),
  minimumQuantity: z.number().int().min(1).nullable().optional(),
  maximumDiscount: z.coerce.number().nonnegative().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  perCustomerLimit: z.number().int().min(1).nullable().optional(),
  isAutomatic: z.boolean().optional(),
  customerEligibility: z.record(z.string(), z.unknown()).optional(),
  buyRules: z.record(z.string(), z.unknown()).optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});
export const listCoupons = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const [coupons, total] = await prisma.$transaction([
    prisma.coupon.findMany({
      skip,
      take: limit,
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coupon.count(),
  ]);
  return res.json(paginated(coupons, total, page, limit));
};
export const validateCoupon = async (req: Request, res: Response) => {
  const parsed = z
    .object({
      code: z.string().trim(),
      subtotal: z.coerce.number().nonnegative(),
      quantity: z.number().int().min(1),
    })
    .safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const coupon = await prisma.coupon.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
    include: { _count: { select: { redemptions: true } } },
  });
  const now = new Date();
  const invalid =
    !coupon ||
    coupon.status !== "ACTIVE" ||
    (coupon.startsAt && coupon.startsAt > now) ||
    (coupon.endsAt && coupon.endsAt < now) ||
    (coupon.usageLimit && coupon._count.redemptions >= coupon.usageLimit) ||
    (coupon.minimumSubtotal &&
      Number(coupon.minimumSubtotal) > parsed.data.subtotal) ||
    (coupon.minimumQuantity && coupon.minimumQuantity > parsed.data.quantity);
  if (invalid)
    return res
      .status(422)
      .json({ success: false, message: "Coupon is not valid for this order" });
  return res.json({ success: true, coupon });
};
export const createCoupon = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const coupon = await prisma.coupon.create({ data: parsed.data as any });
  return res.status(201).json({ success: true, coupon });
};
export const updateCoupon = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const coupon = await prisma.coupon.update({
    where: { id },
    data: parsed.data as any,
  });
  return res.json({ success: true, coupon });
};
export const deleteCoupon = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.coupon.update({ where: { id }, data: { status: "DISABLED" } });
  return res.status(204).send();
};
