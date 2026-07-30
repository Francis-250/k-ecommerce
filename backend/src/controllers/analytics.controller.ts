import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getAnalyticsOverview = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      total: true,
      subtotal: true,
      status: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      source: true,
      createdAt: true,
      items: {
        select: {
          productId: true,
          productName: true,
          quantity: true,
          total: true,
        },
      },
    },
  });

  const totalOrders = orders.length;
  const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.total);
  }, 0);

  const channelBreakdown: Record<string, { count: number; total: number }> = {};
  const productSalesMap: Record<string, { name: string; units: number; sales: number }> = {};

  for (const order of orders) {
    const channel = order.source || "ONLINE_STORE";
    if (!channelBreakdown[channel]) {
      channelBreakdown[channel] = { count: 0, total: 0 };
    }
    channelBreakdown[channel].count += 1;
    channelBreakdown[channel].total += Number(order.total);

    for (const item of order.items) {
      const prodKey = item.productId || item.productName;
      if (!productSalesMap[prodKey]) {
        productSalesMap[prodKey] = {
          name: item.productName,
          units: 0,
          sales: 0,
        };
      }
      productSalesMap[prodKey].units += item.quantity;
      productSalesMap[prodKey].sales += Number(item.total);
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const channelsList = Object.entries(channelBreakdown).map(([channel, data]) => ({
    label: channel === "ONLINE_STORE" ? "Online Store" : channel === "ADMIN_MANUAL" ? "Admin POS / Manual" : channel,
    value: `$${data.total.toFixed(2)}`,
    orders: data.count,
    percent: totalOrders > 0 ? Math.round((data.count / totalOrders) * 100) : 0,
  }));

  const now = new Date();
  const dailyTrendMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyTrendMap[key] = { revenue: 0, orders: 0 };
  }

  for (const order of orders) {
    const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
    if (dailyTrendMap[dateKey]) {
      dailyTrendMap[dateKey].orders += 1;
      dailyTrendMap[dateKey].revenue += Number(order.total);
    }
  }

  const revenueTrend = Object.entries(dailyTrendMap).map(([date, data]) => ({
    date,
    label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Number(data.revenue.toFixed(2)),
    orders: data.orders,
  }));

  return res.json({
    success: true,
    data: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalCustomers,
      averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      topProducts,
      channels: channelsList,
      revenueTrend,
    },
  });
};
