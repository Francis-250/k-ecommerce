import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { productVariantSchema } from "../utils/catalog.schemas";
import { idParamsSchema, validationError } from "../utils/http";

export const listProductVariants = async (req: Request, res: Response) => {
  const variants = await prisma.productVariant.findMany({
    where: req.query.productId
      ? { productId: String(req.query.productId) }
      : undefined,
    include: {
      inventory: true,
      optionValues: { include: { optionValue: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return res.json({ success: true, variants });
};

export const createProductVariant = async (req: Request, res: Response) => {
  const parsed = productVariantSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const variant = await prisma.productVariant.create({
    data: {
      ...parsed.data,
      inventory: { create: { quantity: 0, reserved: 0 } },
    },
    include: { inventory: true },
  });
  return res.status(201).json({ success: true, variant });
};

export const updateProductVariant = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = productVariantSchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const variant = await prisma.productVariant.update({
    where: { id },
    data: parsed.data,
    include: { inventory: true },
  });
  return res.json({ success: true, variant });
};

export const deleteProductVariant = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.productVariant.delete({ where: { id } });
  return res.status(204).send();
};
