"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, PackageCheck, Truck, User } from "lucide-react";
import { toast } from "sonner";
import { useOrder, useOrderMutations } from "@/features/admin/orders/hooks";
import { AdminPageHeader } from "../../_components/AdminPageHeader";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError, error } = useOrder(id);
  const { update: updateOrderMutation } = useOrderMutations();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="text-sm font-medium">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-600 font-semibold">
          Order not found or error loading order: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to orders list
        </Link>
      </div>
    );
  }

  const shippingAddr = order.addresses?.find((a) => a.type === "SHIPPING");
  const customerName = shippingAddr
    ? `${shippingAddr.firstName} ${shippingAddr.lastName}`
    : order.user?.firstName
      ? `${order.user.firstName} ${order.user.lastName ?? ""}`
      : "Guest Customer";

  const handleUpdateStatus = async (updates: {
    paymentStatus?: typeof order.paymentStatus;
    fulfillmentStatus?: typeof order.fulfillmentStatus;
    status?: typeof order.status;
  }) => {
    try {
      await updateOrderMutation.mutateAsync({ id: order.id, input: updates });
      toast.success("Order status updated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
          title="Back to orders list"
        >
          <ArrowLeft size={18} />
        </Link>
        <AdminPageHeader
          title={`Order ${order.orderNumber}`}
          description={`Placed on ${new Date(order.createdAt).toLocaleString()} · ${order.source || "Online Store"}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Order Items */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
              <PackageCheck size={18} className="text-slate-500" /> Items Breakdown
            </h2>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <strong className="block font-semibold text-slate-900">
                      {item.productName}
                    </strong>
                    <span className="text-xs text-slate-500">
                      {item.sku ? `SKU: ${item.sku} · ` : ""}${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ${Number(item.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-${Number(order.discountTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium">${Number(order.shippingTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-medium">${Number(order.taxTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Payment Controls */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-slate-500" /> Payment Status
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Current Status</span>
                <span className="inline-block mt-1 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {order.paymentStatus}
                </span>
              </div>
              <select
                value={order.paymentStatus}
                onChange={(e) =>
                  handleUpdateStatus({
                    paymentStatus: e.target.value as typeof order.paymentStatus,
                    status: e.target.value === "SUCCEEDED" ? "PAID" : undefined,
                  })
                }
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-900"
              >
                <option value="REQUIRES_PAYMENT_METHOD">Requires Payment Method</option>
                <option value="PROCESSING">Processing</option>
                <option value="SUCCEEDED">Paid (Succeeded)</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </section>

          {/* Fulfillment Controls */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
              <Truck size={18} className="text-slate-500" /> Fulfillment Status
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Current Status</span>
                <span className="inline-block mt-1 rounded-md bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                  {order.fulfillmentStatus}
                </span>
              </div>
              <select
                value={order.fulfillmentStatus}
                onChange={(e) =>
                  handleUpdateStatus({
                    fulfillmentStatus: e.target.value as typeof order.fulfillmentStatus,
                  })
                }
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-900"
              >
                <option value="UNFULFILLED">Unfulfilled</option>
                <option value="PROCESSING">Processing</option>
                <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
          </section>
        </div>

        {/* Customer Sidebar */}
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-slate-500" /> Customer Details
            </h2>
            <div>
              <p className="font-semibold text-slate-900">{customerName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{order.email}</p>
              {order.phone && <p className="text-sm text-slate-500">{order.phone}</p>}
            </div>
            {shippingAddr && (
              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Shipping Address
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {shippingAddr.line1} {shippingAddr.line2 ? `, ${shippingAddr.line2}` : ""}
                  <br />
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                  <br />
                  {shippingAddr.country}
                </p>
              </div>
            )}
            {order.customerNote && (
              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Customer Note
                </span>
                <p className="text-xs italic text-slate-600">{order.customerNote}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
