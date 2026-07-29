import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validationError } from "../utils/http";
const schema = z.object({
  variantId: z.string().min(1),
  optionValueId: z.string().min(1),
});
export const listVariantOptionValues = async (req: Request, res: Response) => {
  const values = await prisma.variantOptionValue.findMany({
    where: req.query.variantId
      ? { variantId: String(req.query.variantId) }
      : undefined,
    include: { optionValue: { include: { option: true } } },
  });
  return res.json({ success: true, values });
};
export const createVariantOptionValue = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const value = await prisma.variantOptionValue.create({ data: parsed.data });
  return res.status(201).json({ success: true, value });
};
export const deleteVariantOptionValue = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  await prisma.variantOptionValue.delete({
    where: { variantId_optionValueId: parsed.data },
  });
  return res.status(204).send();
};
