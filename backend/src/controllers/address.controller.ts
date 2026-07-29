import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";
const schema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]).optional(),
  fullName: z.string().trim().min(2).max(160),
  company: z.string().trim().max(160).nullable().optional(),
  phone: z.string().trim().min(7).max(30),
  countryCode: z.string().length(2).default("US"),
  country: z.string().trim().min(2).max(100).default("United States"),
  province: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().max(100).nullable().optional(),
  sector: z.string().trim().max(100).nullable().optional(),
  street: z.string().trim().min(2).max(200),
  street2: z.string().trim().max(200).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  isDefault: z.boolean().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});
export const listAddresses = async (req: Request, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.auth!.sub },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, addresses });
};
export const createAddress = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const address = await prisma.address.create({
    data: { ...parsed.data, userId: req.auth!.sub },
  });
  return res.status(201).json({ success: true, address });
};
export const updateAddress = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const result = await prisma.address.updateMany({
    where: { id, userId: req.auth!.sub },
    data: parsed.data,
  });
  if (!result.count)
    return res
      .status(404)
      .json({ success: false, message: "Address not found" });
  const address = await prisma.address.findUnique({ where: { id } });
  return res.json({ success: true, address });
};
export const deleteAddress = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.address.deleteMany({
    where: { id, userId: req.auth!.sub },
  });
  if (!result.count)
    return res
      .status(404)
      .json({ success: false, message: "Address not found" });
  return res.status(204).send();
};
