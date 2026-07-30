import cron from "node-cron";
import { prisma } from "../lib/prisma";

export type InventoryAlert = {
  id: string;
  productId?: string;
  variantId?: string;
  couponId?: string;
  title: string;
  sku?: string;
  category?: string;
  quantity?: number;
  reorderPoint?: number;
  type: "OUT_OF_STOCK" | "LOW_STOCK" | "EXPIRED_COUPON";
  message: string;
  link: string;
  read?: boolean;
  updatedAt: string;
};

export async function runInventoryCronCheck(): Promise<InventoryAlert[]> {
  try {
    const alerts: InventoryAlert[] = [];
    const now = new Date();

    // 1. Check Inventory Stock (Out of stock & Low stock)
    const inventories = await prisma.inventory.findMany({
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    for (const item of inventories) {
      const product = item.variant?.product;
      if (!product || product.status === "ARCHIVED") continue;

      const categoryName = product.category?.name || "General";
      const sku =
        item.variant?.sku ||
        product.sku ||
        `SKU-${product.id.slice(-6).toUpperCase()}`;

      if (item.quantity === 0) {
        alerts.push({
          id: `alert-out-${item.id}`,
          productId: product.id,
          variantId: item.variantId,
          title: product.name,
          sku,
          category: categoryName,
          quantity: 0,
          reorderPoint: item.reorderPoint,
          type: "OUT_OF_STOCK",
          message: `"${product.name}" is out of stock. Immediate restock required.`,
          link: `/admin/inventory?search=${encodeURIComponent(product.name)}`,
          read: false,
          updatedAt: new Date().toISOString(),
        });
      } else if (item.quantity <= item.reorderPoint) {
        alerts.push({
          id: `alert-low-${item.id}`,
          productId: product.id,
          variantId: item.variantId,
          title: product.name,
          sku,
          category: categoryName,
          quantity: item.quantity,
          reorderPoint: item.reorderPoint,
          type: "LOW_STOCK",
          message: `"${product.name}" is low in stock (${item.quantity} remaining).`,
          link: `/admin/inventory?search=${encodeURIComponent(product.name)}`,
          read: false,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Check Expired Coupons
    const expiredCoupons = await prisma.coupon.findMany({
      where: {
        OR: [
          { status: "EXPIRED" },
          { endsAt: { lt: now } },
        ],
      },
    });

    for (const coupon of expiredCoupons) {
      alerts.push({
        id: `alert-coupon-${coupon.id}`,
        couponId: coupon.id,
        title: `Coupon ${coupon.code}`,
        type: "EXPIRED_COUPON",
        message: `Discount code "${coupon.code}" has expired.`,
        link: `/admin/coupons`,
        read: false,
        updatedAt: new Date().toISOString(),
      });
    }

    // Save compiled inventory & promo alerts to StoreSetting
    await prisma.storeSetting.upsert({
      where: { key: "inventory_notifications" },
      update: {
        value: JSON.parse(
          JSON.stringify({ alerts, lastChecked: new Date().toISOString() }),
        ),
      },
      create: {
        key: "inventory_notifications",
        value: JSON.parse(
          JSON.stringify({ alerts, lastChecked: new Date().toISOString() }),
        ),
      },
    });

    console.log(
      `[Cron] Inventory & Promo check completed. Alerts count: ${alerts.length} (${
        alerts.filter((a) => a.type === "OUT_OF_STOCK").length
      } out of stock, ${
        alerts.filter((a) => a.type === "LOW_STOCK").length
      } low stock, ${
        alerts.filter((a) => a.type === "EXPIRED_COUPON").length
      } expired coupons).`,
    );

    return alerts;
  } catch (error) {
    console.error("[Cron] Failed to run inventory check:", error);
    return [];
  }
}

export function initInventoryCron() {
  runInventoryCronCheck().catch((err) =>
    console.error("[Cron] Startup check failed:", err),
  );

  cron.schedule("*/5 * * * *", () => {
    console.log("[Cron] Running 5-minute scheduled check...");
    runInventoryCronCheck().catch((err) =>
      console.error("[Cron] Scheduled check error:", err),
    );
  });
}
