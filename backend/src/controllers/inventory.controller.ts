import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";

const updateSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  reserved: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  continueSelling: z.boolean().optional(),
  location: z.string().trim().max(120).nullable().optional(),
});

export const listInventory = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const [inventory, total] = await prisma.$transaction([
    prisma.inventory.findMany({
      skip,
      take: limit,
      include: { variant: { include: { product: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inventory.count(),
  ]);
  return res.json(paginated(inventory, total, page, limit));
};

export const getInventory = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const inventory = await prisma.inventory.findUnique({
    where: { id },
    include: { variant: { include: { product: true } } },
  });
  if (!inventory)
    return res
      .status(404)
      .json({ success: false, message: "Inventory not found" });
  return res.json({ success: true, inventory });
};

export const updateInventory = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const inventory = await prisma.inventory.update({
    where: { id },
    data: { ...parsed.data, version: { increment: 1 } },
  });
  return res.json({ success: true, inventory });
};

import { runInventoryCronCheck } from "../services/inventory-cron";

export const getInventoryAlerts = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: "inventory_notifications" },
    });

    if (!setting || !setting.value) {
      const alerts = await runInventoryCronCheck();
      return res.json({ success: true, alerts, count: alerts.length });
    }

    const data = setting.value as { alerts: unknown[]; lastChecked: string };
    return res.json({
      success: true,
      alerts: data.alerts || [],
      count: (data.alerts || []).length,
      lastChecked: data.lastChecked,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

export const markAlertsAsRead = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: "inventory_notifications" },
    });

    if (setting && setting.value) {
      const data = setting.value as {
        alerts: Record<string, unknown>[];
        lastChecked: string;
      };
      const updatedAlerts = (data.alerts || []).map((alert) => ({
        ...alert,
        read: true,
      }));

      await prisma.storeSetting.update({
        where: { key: "inventory_notifications" },
        data: {
          value: JSON.parse(
            JSON.stringify({
              alerts: updatedAlerts,
              lastChecked: data.lastChecked,
            }),
          ),
        },
      });
    }

    return res.json({ success: true, message: "All alerts marked as read" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};


