"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useAdminDashboard } from "@/features/admin/dashboard/useAdminDashboard";
import type {
  DashboardOrder,
  DashboardProduct,
} from "@/features/admin/dashboard/api";
import { DashboardPanel } from "./DashboardPanel";
import {
  SalesChart,
  ShipmentChart,
  type SalesChartPoint,
  type ShipmentChartPoint,
} from "./DashboardCharts";
import { StatCard } from "./StatCard";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const categoryColors = [
  "bg-violet-500",
  "bg-red-500",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-sky-500",
];
const shipmentColors: Record<string, string> = {
  FULFILLED: "#059669",
  PROCESSING: "#0ea5e9",
  PARTIALLY_FULFILLED: "#8b5cf6",
  UNFULFILLED: "#f59e0b",
  RETURNED: "#ef4444",
};
const productStatusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
};

function productStock(product: DashboardProduct) {
  return product.variants.reduce(
    (total, variant) =>
      total +
      Math.max(
        0,
        (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0),
      ),
    0,
  );
}

function monthlySales(orders: DashboardOrder[]): SalesChartPoint[] {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: monthFormatter.format(date),
      value: 0,
    };
  });
  const byMonth = new Map(months.map((month) => [month.key, month]));

  orders.forEach((order) => {
    if (!["SUCCEEDED", "PARTIALLY_REFUNDED"].includes(order.paymentStatus)) {
      return;
    }
    const date = new Date(order.createdAt);
    const month = byMonth.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (month) month.value += Number(order.total);
  });

  return months.map(({ month, value }) => ({
    month,
    value: Number(value.toFixed(2)),
  }));
}

function shipmentData(orders: DashboardOrder[]): ShipmentChartPoint[] {
  const counts = orders.reduce<Record<string, number>>((result, order) => {
    result[order.fulfillmentStatus] =
      (result[order.fulfillmentStatus] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({
    name: name
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/^\w/, (letter) => letter.toUpperCase()),
    value,
    color: shipmentColors[name] ?? "#64748b",
  }));
}

function DashboardLoading() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="mt-4 h-6 w-20 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white" />
        <div className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const dashboard = useAdminDashboard();

  if (dashboard.isPending) return <DashboardLoading />;

  if (dashboard.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-8 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={22} />
        </span>
        <h2 className="mt-4 text-base font-semibold text-slate-900">
          Dashboard data could not be loaded
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          {dashboard.error.message}
        </p>
        <button
          type="button"
          onClick={() => dashboard.refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }

  const { products, orders, users } = dashboard.data;
  const totalSales = orders.data
    .filter((order) =>
      ["SUCCEEDED", "PARTIALLY_REFUNDED"].includes(order.paymentStatus),
    )
    .reduce((total, order) => total + Number(order.total), 0);
  const customers = users.data.filter(
    (user) => user.role === "CUSTOMER",
  ).length;
  const recentProducts = products.data.slice(0, 5);
  const sales = monthlySales(orders.data);
  const shipments = shipmentData(orders.data);
  const categoryCounts = products.data.reduce<Record<string, number>>(
    (result, product) => {
      const category = product.category?.name ?? "Uncategorized";
      result[category] = (result[category] ?? 0) + 1;
      return result;
    },
    {},
  );
  const categoryMaximum = Math.max(1, ...Object.values(categoryCounts));
  const categories = Object.entries(categoryCounts)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Store statistics"
      >
        <StatCard
          label="Total sales"
          value={currency.format(totalSales)}
          caption="from loaded orders"
          icon={DollarSign}
          theme="violet"
        />
        <StatCard
          label="Total customers"
          value={customers.toLocaleString("en-US")}
          caption="registered customers"
          icon={Users}
          theme="blue"
        />
        <StatCard
          label="Total products"
          value={products.pagination.total.toLocaleString("en-US")}
          caption="active catalog products"
          icon={ShoppingBag}
          theme="orange"
        />
        <StatCard
          label="Total orders"
          value={orders.pagination.total.toLocaleString("en-US")}
          caption="all store orders"
          icon={PackageCheck}
          theme="green"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <DashboardPanel
          title="Sales statistics"
          action={
            <span className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
              Last 12 months
            </span>
          }
        >
          <SalesChart data={sales} />
        </DashboardPanel>
        <DashboardPanel
          title="Fulfillment status"
          action={
            <span className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
              Live
            </span>
          }
        >
          {shipments.length ? (
            <ShipmentChart data={shipments} />
          ) : (
            <div className="grid h-60 place-items-center text-center">
              <div>
                <Package className="mx-auto text-slate-300" size={28} />
                <p className="mt-2 text-sm text-slate-500">No orders yet</p>
              </div>
            </div>
          )}
        </DashboardPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <DashboardPanel
          title="Recent products"
          action={
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-950"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          }
        >
          {recentProducts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    {["Product", "Category", "Stock", "Price", "Status"].map(
                      (heading) => (
                        <th key={heading} className="px-3 py-3 font-medium">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <Image
                              className="size-10 rounded-md border border-slate-200 object-cover"
                              src={product.images[0].url}
                              alt={product.images[0].altText ?? product.name}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <span className="grid size-10 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-400">
                              <Package size={17} />
                            </span>
                          )}
                          <div>
                            <p className="max-w-56 truncate font-medium text-slate-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {product.sku ?? "No SKU"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {product.category?.name ?? "Uncategorized"}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {productStock(product)}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-800">
                        {currency.format(Number(product.price))}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                            productStatusStyles[product.status] ??
                            productStatusStyles.ARCHIVED
                          }`}
                        >
                          {product.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center text-center">
              <div>
                <Package className="mx-auto text-slate-300" size={30} />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  No products found
                </p>
                <Link
                  href="/admin/products/new"
                  className="mt-2 inline-block text-xs font-medium text-slate-500 hover:text-slate-950"
                >
                  Add your first product
                </Link>
              </div>
            </div>
          )}
        </DashboardPanel>
        <DashboardPanel
          title="Product overview"
          action={
            <span className="text-xs font-medium text-slate-500">
              By category
            </span>
          }
        >
          <div className="mb-5">
            <p className="text-xs text-slate-500">Catalog products</p>
            <p className="text-2xl font-semibold text-slate-900">
              {products.pagination.total.toLocaleString("en-US")}
            </p>
          </div>
          {categories.length ? (
            <div className="space-y-5">
              {categories.map(([label, value], index) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-400">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${categoryColors[index]}`}
                      style={{ width: `${(value / categoryMaximum) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Category data will appear after products are added.
            </p>
          )}
        </DashboardPanel>
      </section>
    </div>
  );
}
