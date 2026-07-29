import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";
const schema = z.object({
  optionId: z.string().min(1),
  value: z.string().trim().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});
export const listProductOptionValues = async (req: Request, res: Response) => {
  const values = await prisma.productOptionValue.findMany({
    where: req.query.optionId
      ? { optionId: String(req.query.optionId) }
      : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return res.json({ success: true, values });
};
export const createProductOptionValue = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const value = await prisma.productOptionValue.create({ data: parsed.data });
  return res.status(201).json({ success: true, value });
};
export const updateProductOptionValue = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const value = await prisma.productOptionValue.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, value });
};
export const deleteProductOptionValue = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.productOptionValue.delete({ where: { id } });
  return res.status(204).send();
};
