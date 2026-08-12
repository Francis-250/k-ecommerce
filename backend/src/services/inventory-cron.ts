import cron from "node-cron";
import { prisma } from "../lib/prisma";

export type InventoryAlert = {
  id: string;
  productId?: string;
  variantId?: string;
  couponId?: string;
  orderId?: string;
  title: string;
  sku?: string;
  category?: string;
  quantity?: number;
  reorderPoint?: number;
  type:
    | "OUT_OF_STOCK"
    | "LOW_STOCK"
    | "FAILED_PAYMENT"
    | "NEW_ORDER"
    | "STAFF_ACTION"
    | "EXPIRED_COUPON";
  message: string;
  link: string;
  read?: boolean;
  updatedAt: string;
};

export async function runInventoryCronCheck(): Promise<InventoryAlert[]> {
  try {
    const alerts: InventoryAlert[] = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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

    const failedPayments = await prisma.payment.findMany({
      where: { status: "FAILED" },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    for (const payment of failedPayments) {
      alerts.push({
        id: `alert-failed-payment-${payment.id}`,
        orderId: payment.orderId,
        title: `Failed Payment (#${payment.order.orderNumber})`,
        type: "FAILED_PAYMENT",
        message: `Payment of $${payment.amount} failed for order #${payment.order.orderNumber}.`,
        link: `/admin/orders/${payment.orderId}`,
        read: false,
        updatedAt: payment.createdAt.toISOString(),
      });
    }

    const newOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
        status: { in: ["PENDING_PAYMENT", "PAID", "PROCESSING"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    for (const order of newOrders) {
      alerts.push({
        id: `alert-new-order-${order.id}`,
        orderId: order.id,
        title: `New Order (#${order.orderNumber})`,
        type: "NEW_ORDER",
        message: `New order #${order.orderNumber} placed for $${order.total.toFixed(2)}.`,
        link: `/admin/orders/${order.id}`,
        read: false,
        updatedAt: order.createdAt.toISOString(),
      });
    }

    const staffLogs = await prisma.auditLog.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    for (const log of staffLogs) {
      const staffName = log.actorId ? `Staff Member (${log.actorId.slice(0, 8)})` : "Staff Member";
      const targetEntity = log.entityType || "system";
      alerts.push({
        id: `alert-staff-${log.id}`,
        title: `Staff Action: ${log.action}`,
        type: "STAFF_ACTION",
        message: `${staffName} performed ${log.action} on ${targetEntity}.`,
        link: `/admin/analytics`,
        read: false,
        updatedAt: log.createdAt.toISOString(),
      });
    }

    const expiredCoupons = await prisma.coupon.findMany({
      where: {
        OR: [{ status: "EXPIRED" }, { endsAt: { lt: now } }],
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
      `[Cron] Background check completed. Alerts count: ${alerts.length} (${
        alerts.filter((a) => a.type === "OUT_OF_STOCK").length
      } out of stock, ${
        alerts.filter((a) => a.type === "LOW_STOCK").length
      } low stock, ${
        alerts.filter((a) => a.type === "FAILED_PAYMENT").length
      } failed payments, ${
        alerts.filter((a) => a.type === "NEW_ORDER").length
      } new orders, ${
        alerts.filter((a) => a.type === "STAFF_ACTION").length
      } staff updates).`,
    );

    return alerts;
  } catch (error) {
    console.error("[Cron] Failed to run background notification check:", error);
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
