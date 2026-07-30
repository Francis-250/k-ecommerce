import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { paginated, pagination, validationError } from "../utils/http";

const schema = z.object({
  variantId: z.string().optional(),
  productId: z.string().optional(),
  type: z.enum([
    "STOCK_IN",
    "STOCK_OUT",
    "SALE",
    "RETURN",
    "CORRECTION",
    "RESERVATION",
    "RESERVATION_RELEASE",
  ]),
  quantity: z.number().int(),
  referenceType: z.string().max(80).nullable().optional(),
  referenceId: z.string().max(120).nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
});

export const listInventoryMovements = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = req.query.variantId
    ? { variantId: String(req.query.variantId) }
    : req.query.productId
      ? { variant: { productId: String(req.query.productId) } }
      : undefined;

  const [movements, total] = await prisma.$transaction([
    prisma.inventoryMovement.findMany({
      where,
      skip,
      take: limit,
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryMovement.count({ where }),
  ]);
  return res.json(paginated(movements, total, page, limit));
};

export const createInventoryMovement = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  try {
    const result = await prisma.$transaction(async (tx) => {
      let variantId = parsed.data.variantId;
      if (!variantId && parsed.data.productId) {
        const product = await tx.product.findUnique({
          where: { id: parsed.data.productId },
          include: { variants: true },
        });
        if (!product) throw new Error("Product not found");
        if (product.variants.length > 0) {
          variantId = product.variants[0].id;
        } else {
          const sku = product.sku || `SKU-${product.id.slice(-6).toUpperCase()}`;
          const newVariant = await tx.productVariant.create({
            data: { productId: product.id, sku, name: "Default" },
          });
          variantId = newVariant.id;
        }
      }
      if (!variantId) throw new Error("Variant ID or Product ID is required");

      let inventory = await tx.inventory.findUnique({
        where: { variantId },
      });
      if (!inventory) {
        inventory = await tx.inventory.create({
          data: { variantId, quantity: 0, reserved: 0, reorderPoint: 5 },
        });
      }

      let delta = parsed.data.quantity;
      if (parsed.data.type === "STOCK_OUT" || parsed.data.type === "SALE") {
        delta = -Math.abs(parsed.data.quantity);
      } else if (
        parsed.data.type === "STOCK_IN" ||
        parsed.data.type === "RETURN"
      ) {
        delta = Math.abs(parsed.data.quantity);
      }

      const quantityAfter =
        parsed.data.type === "CORRECTION"
          ? Math.max(0, delta)
          : Math.max(0, inventory.quantity + delta);

      const actualChange =
        parsed.data.type === "CORRECTION"
          ? quantityAfter - inventory.quantity
          : delta;

      const updated = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: quantityAfter, version: { increment: 1 } },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          variantId,
          type: parsed.data.type,
          quantity: actualChange,
          quantityAfter,
          referenceType: parsed.data.referenceType ?? null,
          referenceId: parsed.data.referenceId ?? null,
          note: parsed.data.note ?? null,
          createdById: req.auth?.sub ?? null,
        },
      });
      return { inventory: updated, movement };
    });
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: (error as Error).message });
  }
};
