import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validationError } from "../utils/http";
const schema = z.object({ productId: z.string().min(1) });
export const listWishlistItems = async (req: Request, res: Response) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.auth!.sub },
    include: {
      product: {
        include: {
          images: { take: 1 },
          variants: { include: { inventory: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, items });
};
export const createWishlistItem = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const item = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: req.auth!.sub,
        productId: parsed.data.productId,
      },
    },
    update: {},
    create: { userId: req.auth!.sub, productId: parsed.data.productId },
  });
  return res.status(201).json({ success: true, item });
};
export const deleteWishlistItem = async (req: Request, res: Response) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.auth!.sub, productId: String(req.params.productId) },
  });
  return res.status(204).send();
};
