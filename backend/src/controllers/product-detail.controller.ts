import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";

const schema = z.object({
  productId: z.string().min(1),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(1000),
  sortOrder: z.number().int().min(0).optional(),
});

export const listProductDetails = async (req: Request, res: Response) => {
  const details = await prisma.productDetail.findMany({
    where: req.query.productId
      ? { productId: String(req.query.productId) }
      : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return res.json({ success: true, details });
};
export const createProductDetail = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const detail = await prisma.productDetail.create({ data: parsed.data });
  return res.status(201).json({ success: true, detail });
};
export const updateProductDetail = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const detail = await prisma.productDetail.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, detail });
};
export const deleteProductDetail = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.productDetail.delete({ where: { id } });
  return res.status(204).send();
};
