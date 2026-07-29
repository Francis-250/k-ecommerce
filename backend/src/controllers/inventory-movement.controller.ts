import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { paginated, pagination, validationError } from "../utils/http";

const schema = z.object({
  variantId: z.string().min(1),
  type: z.enum([
    "STOCK_IN",
    "STOCK_OUT",
    "SALE",
    "RETURN",
    "CORRECTION",
    "RESERVATION",
    "RESERVATION_RELEASE",
  ]),
  quantity: z
    .number()
    .int()
    .refine((value) => value !== 0),
  referenceType: z.string().max(80).nullable().optional(),
  referenceId: z.string().max(120).nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
});

export const listInventoryMovements = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = req.query.variantId
    ? { variantId: String(req.query.variantId) }
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
  const result = await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUniqueOrThrow({
      where: { variantId: parsed.data.variantId },
    });
    const quantityAfter = inventory.quantity + parsed.data.quantity;
    if (quantityAfter < 0) throw new Error("Inventory cannot become negative");
    const updated = await tx.inventory.update({
      where: { id: inventory.id },
      data: { quantity: quantityAfter, version: { increment: 1 } },
    });
    const movement = await tx.inventoryMovement.create({
      data: {
        ...parsed.data,
        quantityAfter,
        createdById: req.auth!.sub,
      },
    });
    return { inventory: updated, movement };
  });
  return res.status(201).json({ success: true, ...result });
};
