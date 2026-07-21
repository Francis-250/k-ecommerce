"use client";

import Link from "next/link";
import { ChevronDown, Download, MoreHorizontal, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

const orders = [
  {
    id: "#127381",
    date: "21 Jul, 10:42",
    customer: "Alex Almond",
    channel: "Online store",
    total: "$240.00",
    payment: "Paid",
    fulfillment: "Unfulfilled",
    items: "2 items",
  },
  {
    id: "#127382",
    date: "21 Jul, 09:18",
    customer: "Anitra Sen",
    channel: "Mobile",
    total: "$220.00",
    payment: "Paid",
    fulfillment: "Fulfilled",
    items: "1 item",
  },
  {
    id: "#127383",
    date: "20 Jul, 16:05",
    customer: "John Doe",
    channel: "Online store",
    total: "$180.00",
    payment: "Pending",
    fulfillment: "Processing",
    items: "2 items",
  },
  {
    id: "#127384",
    date: "20 Jul, 12:34",
    customer: "Alisha Madrin",
    channel: "Online store",
    total: "$195.00",
    payment: "Refunded",
    fulfillment: "Returned",
    items: "3 items",
  },
  {
    id: "#127385",
    date: "19 Jul, 15:22",
    customer: "Bella Chao",
    channel: "Mobile",
    total: "$120.00",
    payment: "Paid",
    fulfillment: "Fulfilled",
    items: "1 item",
  },
];

export function OrdersManagement() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("All");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          `${Object.values(order).join(" ")} ${order.payment} ${order.fulfillment}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (view === "All" ||
            order.fulfillment === view ||
            order.payment === view),
      ),
    [query, view],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Review payments, fulfillment, returns, and customer orders."
        actionHref="/admin/orders/new"
        actionLabel="Create order"
      />
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-4 pt-3">
          {["All", "Unfulfilled", "Processing", "Fulfilled", "Pending"].map(
            (item) => (
              <button
                key={item}
                onClick={() => {
                  setView(item);
                  setPage(1);
                }}
                className={`border-b-2 px-3 py-2 text-sm ${view === item ? "border-emerald-600 font-medium text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
              placeholder="Search order, customer, product"
            />
          </div>
          <button className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600">
            <span>More filters</span>
            <ChevronDown size={14} />
          </button>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500"
            aria-label="Export orders"
          >
            <Download size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" aria-label="Select all orders" />
                </th>
                {[
                  "Order",
                  "Date",
                  "Customer",
                  "Channel",
                  "Total",
                  "Payment",
                  "Fulfillment",
                  "Items",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" aria-label={`Select ${order.id}`} />
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    <Link href={`/admin/orders/${order.id.slice(1)}`}>
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{order.date}</td>
                  <td className="px-3 py-3 text-slate-700">{order.customer}</td>
                  <td className="px-3 py-3 text-slate-500">{order.channel}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {order.total}
                  </td>
                  <td className="px-3 py-3">
                    <Status value={order.payment} />
                  </td>
                  <td className="px-3 py-3">
                    <Status value={order.fulfillment} />
                  </td>
                  <td className="px-3 py-3 text-slate-500">{order.items}</td>
                  <td className="px-3 py-3">
                    <button
                      className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                      aria-label={`Actions for ${order.id}`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>
    </>
  );
}
function Status({ value }: { value: string }) {
  const color =
    value === "Paid" || value === "Fulfilled"
      ? "bg-emerald-50 text-emerald-700"
      : value === "Pending" || value === "Unfulfilled"
        ? "bg-amber-50 text-amber-700"
        : value === "Refunded" || value === "Returned"
          ? "bg-red-50 text-red-700"
          : "bg-sky-50 text-sky-700";
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${color}`}>
      {value}
    </span>
  );
}
