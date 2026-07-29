import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const include = {
  items: {
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" as const } },
        },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export const getCart = async (req: Request, res: Response) => {
  let cart = await prisma.cart.findFirst({
    where: { userId: req.auth!.sub, status: "ACTIVE" },
    include,
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.auth!.sub, status: "ACTIVE", currency: "USD" },
      include,
    });
  }
  return res.json({ success: true, cart });
};

export const clearCart = async (req: Request, res: Response) => {
  const cart = await prisma.cart.findFirst({
    where: { userId: req.auth!.sub, status: "ACTIVE" },
  });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return res.status(204).send();
};
