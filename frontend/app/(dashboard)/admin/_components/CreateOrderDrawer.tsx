"use client";

import Image from "next/image";
import {
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProducts } from "@/features/admin/catalog/hooks";
import { useOrderMutations } from "@/features/admin/orders/hooks";
import type { ApiProduct } from "@/features/admin/catalog/api";
import { CatalogModal } from "./CatalogModal";

export type OrderDrawerItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  sku: string | null;
  quantity: number;
};

export function CreateOrderDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: availableProducts = [], isLoading: isLoadingProducts } = useProducts();
  const { create: createOrderMutation } = useOrderMutations();

  const [productSearch, setProductSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<OrderDrawerItem[]>([]);

  // Customer & Address Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("New York");
  const [postalCode, setPostalCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("REQUIRES_PAYMENT_METHOD");
  const [customerNote, setCustomerNote] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setProductSearch("");
    setSelectedItems([]);
    setEmail("");
    setPhone("");
    setFirstName("");
    setLastName("");
    setLine1("");
    setLine2("");
    setCity("");
    setState("New York");
    setPostalCode("");
    setPaymentStatus("REQUIRES_PAYMENT_METHOD");
    setCustomerNote("");
  };

  const matchingProducts = productSearch.trim()
    ? availableProducts.filter((product) =>
        `${product.name} ${product.sku || ""}`
          .toLowerCase()
          .includes(productSearch.toLowerCase()),
      )
    : [];

  const addProductToOrder = (product: ApiProduct) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.images[0]?.url ?? null,
          sku: product.sku,
          quantity: 1,
        },
      ];
    });
    setProductSearch("");
  };

  const subtotal = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 && subtotal < 100 ? 12 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Please search and add at least one product to the order.");
      return;
    }
    if (!email || !firstName || !lastName || !line1 || !city || !postalCode) {
      toast.error("Please fill in all required customer and shipping address fields.");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        email,
        phone: phone || null,
        customerNote: customerNote || null,
        status: paymentStatus === "SUCCEEDED" ? "PAID" : "PENDING_PAYMENT",
        paymentStatus,
        fulfillmentStatus: "UNFULFILLED",
        source: "ADMIN_MANUAL",
        shippingAddress: {
          firstName,
          lastName,
          phone: phone || "0000000000",
          countryCode: "US",
          country: "United States",
          state,
          city,
          line1,
          line2: line2 || null,
          postalCode,
        },
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      toast.success("Order created successfully!");
      resetForm();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create order");
    }
  };

  return (
    <CatalogModal
      title="Create New Order"
      description="Build a manual order, search catalog items, and add customer details."
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Products Search Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShoppingBag size={15} /> 1. Select Products
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              placeholder="Type product title or SKU to search..."
            />
            {isLoadingProducts && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />
            )}
          </div>

          {/* Search Dropdown Results */}
          {productSearch.trim() && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-md space-y-1">
              {matchingProducts.length > 0 ? (
                matchingProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => addProductToOrder(prod)}
                    className="flex w-full items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {prod.images[0]?.url ? (
                        <Image
                          src={prod.images[0].url}
                          alt={prod.name}
                          width={36}
                          height={36}
                          className="size-9 rounded border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="size-9 rounded bg-slate-100 border border-slate-200 grid place-items-center text-[10px] font-semibold text-slate-400">
                          No Img
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-slate-500">{prod.sku ? `SKU: ${prod.sku}` : "No SKU"}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      ${Number(prod.price).toFixed(2)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-3 text-center text-xs text-slate-500">No matching products found</p>
              )}
            </div>
          )}

          {/* Selected Line Items */}
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="size-10 rounded border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded bg-slate-100 border border-slate-200 grid place-items-center text-[10px] text-slate-400">
                      No Img
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">${item.price.toFixed(2)} each</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="inline-flex items-center rounded border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedItems((prev) =>
                          prev.map((i) =>
                            i.productId === item.productId
                              ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                              : i,
                          ),
                        )
                      }
                      className="grid size-7 place-items-center text-slate-500 hover:bg-slate-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="min-w-6 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedItems((prev) =>
                          prev.map((i) =>
                            i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i,
                          ),
                        )
                      }
                      className="grid size-7 place-items-center text-slate-500 hover:bg-slate-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-900 w-16 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedItems((prev) => prev.filter((i) => i.productId !== item.productId))
                    }
                    className="grid size-7 place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            {selectedItems.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center">
                <p className="text-xs text-slate-500">No products added. Search product title or SKU above to add.</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <UserRound size={15} /> 2. Customer Information
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 202 555 0124"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin size={15} /> 3. Shipping Address
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="123 Main Street"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">State *</label>
              <input
                type="text"
                required
                placeholder="NY"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">ZIP Code *</label>
              <input
                type="text"
                required
                placeholder="10001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Payment & Order Summary */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CreditCard size={15} /> 4. Payment & Summary
          </label>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="REQUIRES_PAYMENT_METHOD">Payment Pending (Requires payment)</option>
              <option value="SUCCEEDED">Mark as Paid (Succeeded)</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold">{shipping ? `$${shipping.toFixed(2)}` : "Free"}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {createOrderMutation.isPending && <Loader2 size={15} className="animate-spin" />}
            Create Order
          </button>
        </div>
      </form>
    </CatalogModal>
  );
}
