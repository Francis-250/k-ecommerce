import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validationError } from "../utils/http";
const schema = z
  .object({
    productId: z.string().min(1),
    relatedProductId: z.string().min(1),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => data.productId !== data.relatedProductId,
    "A product cannot relate to itself",
  );
export const listProductRelations = async (req: Request, res: Response) => {
  const relations = await prisma.productRelation.findMany({
    where: req.query.productId
      ? { productId: String(req.query.productId) }
      : undefined,
    include: { relatedProduct: { include: { images: { take: 1 } } } },
    orderBy: { sortOrder: "asc" },
  });
  return res.json({ success: true, relations });
};
export const createProductRelation = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const relation = await prisma.productRelation.create({ data: parsed.data });
  return res.status(201).json({ success: true, relation });
};
export const deleteProductRelation = async (req: Request, res: Response) => {
  const parsed = schema
    .pick({ productId: true, relatedProductId: true })
    .safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  await prisma.productRelation.delete({
    where: { productId_relatedProductId: parsed.data },
  });
  return res.status(204).send();
};
