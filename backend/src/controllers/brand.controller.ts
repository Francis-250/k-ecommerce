import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { brandSchema } from "../utils/catalog.schemas";
import { idParamsSchema, validationError } from "../utils/http";

export const listBrands = async (req: Request, res: Response) => {
  const brands = await prisma.brand.findMany({
    where: req.query.admin === "true" ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });
  return res.json({ success: true, brands });
};

export const createBrand = async (req: Request, res: Response) => {
  const parsed = brandSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const brand = await prisma.brand.create({ data: parsed.data });
  return res.status(201).json({ success: true, brand });
};

export const updateBrand = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = brandSchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const brand = await prisma.brand.update({ where: { id }, data: parsed.data });
  return res.json({ success: true, brand });
};

export const deleteBrand = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.brand.delete({ where: { id } });
  return res.status(204).send();
};
