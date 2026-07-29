import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { categorySchema } from "../utils/catalog.schemas";
import { idParamsSchema, validationError } from "../utils/http";

export const listCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: req.query.admin === "true" ? undefined : { isActive: true },
    include: { children: true, _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return res.json({ success: true, categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const category = await prisma.category.create({ data: parsed.data });
  return res.status(201).json({ success: true, category });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, category });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.category.delete({ where: { id } });
  return res.status(204).send();
};
