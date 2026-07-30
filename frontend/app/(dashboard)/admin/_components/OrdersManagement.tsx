"use client";

import Link from "next/link";
import { ChevronDown, Download, Eye, Loader2, MoreHorizontal, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrderMutations, useOrders } from "@/features/admin/orders/hooks";
import { type ApiOrder } from "@/features/admin/orders/api";
import { AdminPageHeader } from "./AdminPageHeader";
import { CatalogModal } from "./CatalogModal";
import { CreateOrderDrawer } from "./CreateOrderDrawer";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

export function OrdersManagement() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("All");
  const [page, setPage] = useState(1);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<ApiOrder | null>(null);

  const { data: orders = [], isLoading, isError, error } = useOrders();
  const { update: updateOrderMutation } = useOrderMutations();

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.addresses?.find((a) => a.type === "SHIPPING")
        ? `${order.addresses.find((a) => a.type === "SHIPPING")?.firstName} ${order.addresses.find((a) => a.type === "SHIPPING")?.lastName}`
        : order.email;
      
      const paymentFormatted = formatPaymentStatus(order.paymentStatus);
      const fulfillmentFormatted = formatFulfillmentStatus(order.fulfillmentStatus);

      const searchableText = `${order.orderNumber} ${order.id} ${customerName} ${order.email} ${paymentFormatted} ${fulfillmentFormatted} ${order.source}`.toLowerCase();
      const matchesQuery = searchableText.includes(query.toLowerCase());

      const matchesView =
        view === "All" ||
        fulfillmentFormatted.toLowerCase() === view.toLowerCase() ||
        paymentFormatted.toLowerCase() === view.toLowerCase();

      return matchesQuery && matchesView;
    });
  }, [orders, query, view]);

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  const handleUpdateStatus = async (
    orderId: string,
    updates: {
      paymentStatus?: ApiOrder["paymentStatus"];
      fulfillmentStatus?: ApiOrder["fulfillmentStatus"];
      status?: ApiOrder["status"];
    },
  ) => {
    try {
      const updated = await updateOrderMutation.mutateAsync({
        id: orderId,
        input: updates,
      });
      toast.success("Order status updated successfully");
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder(updated);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update order status",
      );
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Review payments, fulfillment, returns, and customer orders."
        onAction={() => setIsCreateDrawerOpen(true)}
        actionLabel="Create order"
      />
      <CreateOrderDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-4 pt-3">
          {["All", "Unfulfilled", "Processing", "Fulfilled", "Pending"].map(
            (item) => (
              <button
                key={item}
                onClick={() => {
                  setView(item);
                  setPage(1);
                }}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  view === item
                    ? "border-emerald-600 font-semibold text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
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
              placeholder="Search order number, customer, or email"
            />
          </div>
          <button className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50">
            <span>More filters</span>
            <ChevronDown size={14} />
          </button>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Export orders"
          >
            <Download size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
            <p className="text-sm font-medium">Fetching orders...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            <p className="text-sm font-medium">
              Failed to load orders: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="text-slate-300 mb-2" size={36} />
            <p className="text-sm font-semibold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {query
                ? `No orders matching "${query}". Try adjusting your search query.`
                : "No customer orders have been placed yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 bg-slate-50/50">
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
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((order) => {
                  const shippingAddr = order.addresses?.find((a) => a.type === "SHIPPING");
                  const customerName = shippingAddr
                    ? `${shippingAddr.firstName} ${shippingAddr.lastName}`
                    : order.user?.firstName
                      ? `${order.user.firstName} ${order.user.lastName ?? ""}`
                      : order.email;

                  const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const paymentFormatted = formatPaymentStatus(order.paymentStatus);
                  const fulfillmentFormatted = formatFulfillmentStatus(order.fulfillmentStatus);
                  const itemsCount = order.items?.length ?? 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" aria-label={`Select ${order.orderNumber}`} />
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline hover:text-emerald-700"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{dateFormatted}</td>
                      <td className="px-3 py-3 text-slate-800 font-medium">{customerName}</td>
                      <td className="px-3 py-3 text-xs text-slate-500 capitalize">{order.source?.toLowerCase().replace("_", " ") || "Online store"}</td>
                      <td className="px-3 py-3 font-bold text-slate-900">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge value={paymentFormatted} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge value={fulfillmentFormatted} />
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">{itemsCount} {itemsCount === 1 ? "item" : "items"}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="View order details drawer"
                            aria-label={`View order ${order.orderNumber}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Actions for ${order.orderNumber}`}
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <TablePagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>

      {/* View Order Details Drawer */}
      {viewingOrder && (
        <CatalogModal
          title={`Order Details (${viewingOrder.orderNumber})`}
          description={`Placed on ${new Date(viewingOrder.createdAt).toLocaleString()} · ${viewingOrder.source || "Online store"}`}
          onClose={() => setViewingOrder(null)}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <span className="font-mono text-xl font-bold text-slate-900 block">{viewingOrder.orderNumber}</span>
                <p className="text-xs text-slate-500 mt-0.5">{viewingOrder.email}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 block">
                  ${Number(viewingOrder.total).toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">
                  {viewingOrder.items?.length ?? 0} {viewingOrder.items?.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {/* Quick Status Control Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Manage Order Status</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Payment Status</label>
                  <select
                    value={viewingOrder.paymentStatus}
                    onChange={(e) =>
                      handleUpdateStatus(viewingOrder.id, {
                        paymentStatus: e.target.value as ApiOrder["paymentStatus"],
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="REQUIRES_PAYMENT_METHOD">Requires Payment Method</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SUCCEEDED">Paid (Succeeded)</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Fulfillment Status</label>
                  <select
                    value={viewingOrder.fulfillmentStatus}
                    onChange={(e) =>
                      handleUpdateStatus(viewingOrder.id, {
                        fulfillmentStatus: e.target.value as ApiOrder["fulfillmentStatus"],
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="UNFULFILLED">Unfulfilled</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordered Items</h4>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                  viewingOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-xs text-slate-500">
                          {item.sku ? `SKU: ${item.sku} · ` : ""}${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-900 pl-4">
                        ${Number(item.total).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-xs text-slate-500">No items record found.</p>
                )}
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <span className="text-xs text-slate-500 block">Customer Info</span>
                <span className="font-semibold text-slate-900 mt-1 block">
                  {viewingOrder.addresses?.find((a) => a.type === "SHIPPING")
                    ? `${viewingOrder.addresses.find((a) => a.type === "SHIPPING")?.firstName} ${viewingOrder.addresses.find((a) => a.type === "SHIPPING")?.lastName}`
                    : viewingOrder.user?.firstName
                      ? `${viewingOrder.user.firstName} ${viewingOrder.user.lastName ?? ""}`
                      : "Guest"}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">{viewingOrder.email}</span>
                {viewingOrder.phone && <span className="text-xs text-slate-500 block">{viewingOrder.phone}</span>}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <span className="text-xs text-slate-500 block">Shipping Address</span>
                {(() => {
                  const addr = viewingOrder.addresses?.find((a) => a.type === "SHIPPING");
                  if (!addr) return <span className="text-xs text-slate-500 mt-1 block">No address provided</span>;
                  return (
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {addr.line1} {addr.line2 ? `, ${addr.line2}` : ""}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">${Number(viewingOrder.subtotal).toFixed(2)}</span>
              </div>
              {Number(viewingOrder.discountTotal) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-${Number(viewingOrder.discountTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium">${Number(viewingOrder.shippingTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax</span>
                <span className="font-medium">${Number(viewingOrder.taxTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>${Number(viewingOrder.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                href={`/admin/orders/${viewingOrder.id}`}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Open Full Order Page
              </Link>
            </div>
          </div>
        </CatalogModal>
      )}
    </>
  );
}

function formatPaymentStatus(status: string) {
  switch (status) {
    case "SUCCEEDED":
    case "PAID":
      return "Paid";
    case "REQUIRES_PAYMENT_METHOD":
    case "REQUIRES_CONFIRMATION":
    case "PROCESSING":
      return "Pending";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "Refunded";
    case "FAILED":
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function formatFulfillmentStatus(status: string) {
  switch (status) {
    case "UNFULFILLED":
      return "Unfulfilled";
    case "PROCESSING":
      return "Processing";
    case "PARTIALLY_FULFILLED":
      return "Partially Fulfilled";
    case "FULFILLED":
      return "Fulfilled";
    case "RETURNED":
      return "Returned";
    default:
      return status;
  }
}

function StatusBadge({ value }: { value: string }) {
  const color =
    value === "Paid" || value === "Fulfilled"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : value === "Pending" || value === "Unfulfilled"
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : value === "Refunded" || value === "Returned" || value === "Cancelled"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-sky-50 text-sky-700 border border-sky-200";
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${color}`}>
      {value}
    </span>
  );
}
