import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";
const schema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});
export const listProductOptions = async (req: Request, res: Response) => {
  const options = await prisma.productOption.findMany({
    where: req.query.productId
      ? { productId: String(req.query.productId) }
      : undefined,
    include: { values: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return res.json({ success: true, options });
};
export const createProductOption = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const option = await prisma.productOption.create({ data: parsed.data });
  return res.status(201).json({ success: true, option });
};
export const updateProductOption = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const option = await prisma.productOption.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, option });
};
export const deleteProductOption = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.productOption.delete({ where: { id } });
  return res.status(204).send();
};
