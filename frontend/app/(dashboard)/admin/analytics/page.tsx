"use client";

import {
  CalendarDays,
  DollarSign,
  Loader2,
  MousePointerClick,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAnalyticsOverview } from "@/features/admin/analytics/hooks";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { SalesChart, ShipmentChart } from "../_components/DashboardCharts";
import { DashboardPanel } from "../_components/DashboardPanel";
import { StatCard } from "../_components/StatCard";

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError, error } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="text-sm font-medium">Fetching real-time analytics...</p>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="p-8 text-center text-red-600 font-medium">
        Failed to load analytics: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const chartSalesData = analytics.revenueTrend.map((point) => ({
    month: point.label,
    value: point.revenue,
  }));

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Sales, revenue, order statistics, and top performing product metrics."
      />

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <button className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 shadow-sm">
          <CalendarDays size={15} />
          Last 30 days
        </button>
        <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 shadow-sm">
          <option>USD ($)</option>
        </select>
      </div>

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+100% real"
          icon={DollarSign}
          theme="green"
        />
        <StatCard
          label="Total Customers"
          value={analytics.totalCustomers.toLocaleString()}
          change="Registered"
          icon={Users}
          theme="blue"
        />
        <StatCard
          label="Total Orders"
          value={analytics.totalOrders.toLocaleString()}
          change="Orders placed"
          icon={ShoppingCart}
          theme="orange"
        />
        <StatCard
          label="Avg Order Value"
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          change="per order"
          icon={MousePointerClick}
          theme="violet"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <DashboardPanel title="30-Day Revenue Trend">
          <SalesChart data={chartSalesData} />
        </DashboardPanel>
        <DashboardPanel title="Order Fulfillment Summary">
          <ShipmentChart />
        </DashboardPanel>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <DashboardPanel title="Sales by Channel">
          <div className="space-y-4">
            {analytics.channels.length > 0 ? (
              analytics.channels.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <strong className="font-semibold text-slate-900">
                      {item.value} ({item.orders} orders)
                    </strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(item.percent, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No sales channel data available yet.</p>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Top Performing Products">
          <div className="divide-y divide-slate-100">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 py-3 text-sm"
                >
                  <span className="grid size-7 place-items-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <span className="flex-1 font-semibold text-slate-800 truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-500">{item.units} units sold</span>
                  <strong className="font-bold text-slate-900">
                    ${item.sales.toFixed(2)}
                  </strong>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No product sales record found.</p>
            )}
          </div>
        </DashboardPanel>
      </section>
    </>
  );
}
