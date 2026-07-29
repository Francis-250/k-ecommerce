import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { idParamsSchema, validationError } from "../utils/http";
const createSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(99),
  options: z.record(z.string(), z.string()).optional(),
});
const updateSchema = z.object({ quantity: z.number().int().min(1).max(99) });
async function activeCart(userId: string) {
  return prisma.cart.upsert({
    where: { sessionId: `user:${userId}:active` },
    update: { userId, status: "ACTIVE" },
    create: {
      userId,
      sessionId: `user:${userId}:active`,
      status: "ACTIVE",
      currency: "USD",
    },
  });
}
export const createCartItem = async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: parsed.data.productId },
  });
  const variant = parsed.data.variantId
    ? await prisma.productVariant.findFirstOrThrow({
        where: {
          id: parsed.data.variantId,
          productId: product.id,
          isActive: true,
        },
      })
    : null;
  const inventory = variant
    ? await prisma.inventory.findUnique({ where: { variantId: variant.id } })
    : null;
  if (
    inventory &&
    !inventory.continueSelling &&
    inventory.quantity - inventory.reserved < parsed.data.quantity
  ) {
    return res
      .status(409)
      .json({ success: false, message: "Not enough inventory" });
  }
  const cart = await activeCart(req.auth!.sub);
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: product.id,
      variantId: variant?.id ?? null,
    },
  });
  const unitPrice = variant?.price ?? product.price;
  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + parsed.data.quantity,
          unitPrice,
          options: parsed.data.options,
        },
      })
    : await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant?.id,
          quantity: parsed.data.quantity,
          unitPrice,
          options: parsed.data.options,
        },
      });
  return res.status(201).json({ success: true, item });
};
export const updateCartItem = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const owned = await prisma.cartItem.findFirst({
    where: { id, cart: { userId: req.auth!.sub, status: "ACTIVE" } },
  });
  if (!owned)
    return res
      .status(404)
      .json({ success: false, message: "Cart item not found" });
  const item = await prisma.cartItem.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, item });
};
export const deleteCartItem = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.cartItem.deleteMany({
    where: { id, cart: { userId: req.auth!.sub, status: "ACTIVE" } },
  });
  if (!result.count)
    return res
      .status(404)
      .json({ success: false, message: "Cart item not found" });
  return res.status(204).send();
};
