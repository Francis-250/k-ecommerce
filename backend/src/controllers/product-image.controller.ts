import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { productImageSchema } from "../utils/catalog.schemas";
import { idParamsSchema, validationError } from "../utils/http";

const createSchema = productImageSchema.extend({
  productId: z.string().min(1),
});

export const listProductImages = async (req: Request, res: Response) => {
  const images = await prisma.productImage.findMany({
    where: req.query.productId
      ? { productId: String(req.query.productId) }
      : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return res.json({ success: true, images });
};

import { saveImageEmbedding } from "../services/visual-search.service";

export const createProductImage = async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  if (parsed.data.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: parsed.data.productId },
      data: { isPrimary: false },
    });
  }
  const image = await prisma.productImage.create({ data: parsed.data });
  saveImageEmbedding(image.id, image.url).catch((err) =>
    console.error(`Failed background embedding generation for image ${image.id}:`, err)
  );

  return res.status(201).json({ success: true, image });
};

export const updateProductImage = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = productImageSchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const existing = await prisma.productImage.findUniqueOrThrow({
    where: { id },
  });
  if (parsed.data.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: existing.productId, id: { not: id } },
      data: { isPrimary: false },
    });
  }
  const image = await prisma.productImage.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, image });
};

export const deleteProductImage = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.productImage.delete({ where: { id } });
  return res.status(204).send();
};
