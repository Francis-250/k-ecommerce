import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validationError } from "../utils/http";
const schema = z.object({
  fulfillmentId: z.string().min(1),
  orderItemId: z.string().min(1),
  quantity: z.number().int().min(1),
});
export const listFulfillmentItems = async (req: Request, res: Response) =>
  res.json({
    success: true,
    items: await prisma.fulfillmentItem.findMany({
      where: req.query.fulfillmentId
        ? { fulfillmentId: String(req.query.fulfillmentId) }
        : undefined,
      include: { orderItem: true },
    }),
  });
export const createFulfillmentItem = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res
    .status(201)
    .json({
      success: true,
      item: await prisma.fulfillmentItem.create({ data: p.data }),
    });
};
export const deleteFulfillmentItem = async (req: Request, res: Response) => {
  const p = schema
    .pick({ fulfillmentId: true, orderItemId: true })
    .safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  await prisma.fulfillmentItem.delete({
    where: { fulfillmentId_orderItemId: p.data },
  });
  return res.status(204).send();
};
