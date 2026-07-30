"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
import {
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
  FormTextarea,
  ToggleRow,
} from "./AdminFormUI";

export type OrderFormItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  sku: string | null;
  quantity: number;
};

export function OrderForm() {
  const router = useRouter();
  const { data: availableProducts = [], isLoading: isLoadingProducts } = useProducts();
  const { create: createOrderMutation } = useOrderMutations();

  const [productSearch, setProductSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<OrderFormItem[]>([]);

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
      toast.error("Please fill in all required customer and address fields.");
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
      router.push("/admin/orders");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create order");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl pb-10">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Product Search & Selection */}
          <FormCard
            title="Products"
            description="Search the catalogue and add items to this order."
            icon={<ShoppingBag size={18} />}
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
                placeholder="Type to search product by title or SKU..."
              />
              {isLoadingProducts && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />
              )}
            </div>

            {/* Matching Search Results Dropdown */}
            {productSearch.trim() && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg space-y-1 z-10">
                {matchingProducts.length > 0 ? (
                  matchingProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addProductToOrder(prod)}
                      className="flex w-full items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prod.images[0]?.url ? (
                          <Image
                            src={prod.images[0].url}
                            alt={prod.name}
                            width={40}
                            height={40}
                            className="size-10 rounded-md border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-slate-100 border border-slate-200 grid place-items-center text-xs font-semibold text-slate-400">
                            No Img
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-xs text-slate-500">{prod.sku ? `SKU: ${prod.sku}` : "No SKU"}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 shrink-0">
                        ${Number(prod.price).toFixed(2)}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-center text-xs text-slate-500">No products matching "{productSearch}"</p>
                )}
              </div>
            )}

            {/* Selected Products List */}
            <div className="mt-4 space-y-3">
              {selectedItems.map((item) => (
                <article
                  key={item.productId}
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50/50"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="size-14 rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="size-14 rounded-lg bg-slate-100 border border-slate-200 grid place-items-center text-xs text-slate-400">
                      No Img
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      ${item.price.toFixed(2)} each
                    </p>
                    <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItems((current) =>
                            current.map((entry) =>
                              entry.productId === item.productId
                                ? {
                                    ...entry,
                                    quantity: Math.max(1, entry.quantity - 1),
                                  }
                                : entry,
                            ),
                          )
                        }
                        className="grid size-8 place-items-center text-slate-500 hover:bg-slate-50"
                        aria-label={`Reduce ${item.name} quantity`}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-8 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItems((current) =>
                            current.map((entry) =>
                              entry.productId === item.productId
                                ? { ...entry, quantity: entry.quantity + 1 }
                                : entry,
                            ),
                          )
                        }
                        className="grid size-8 place-items-center text-slate-500 hover:bg-slate-50"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedItems((current) =>
                          current.filter((entry) => entry.productId !== item.productId),
                        )
                      }
                      className="mt-3 inline-grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </article>
              ))}

              {selectedItems.length === 0 && (
                <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center p-6">
                  <div>
                    <ShoppingBag className="mx-auto text-slate-400" size={28} />
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      No products added yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Type product name above in the search box to add items to order.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </FormCard>

          {/* Customer Information */}
          <FormCard
            title="Customer and contact"
            description="Enter customer contact email and phone details."
            icon={<UserRound size={18} />}
          >
            <div className="space-y-5">
              <FormGrid>
                <FormField
                  label="Email address"
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FormField
                  label="Phone number"
                  type="tel"
                  placeholder="+1 202 555 0124"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  optional
                />
              </FormGrid>
            </div>
          </FormCard>

          {/* Shipping Address */}
          <FormCard title="Shipping address" icon={<MapPin size={18} />}>
            <div className="space-y-5">
              <FormGrid>
                <FormField
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
                <FormField
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </FormGrid>
              <FormField
                label="Street address"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="123 Main Street"
                required
              />
              <FormField
                label="Apartment, suite, etc."
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="Apt 4B"
                optional
              />
              <FormGrid columns={3}>
                <FormField
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  required
                />
                <FormSelect
                  label="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="New York">New York</option>
                  <option value="California">California</option>
                  <option value="Texas">Texas</option>
                  <option value="Florida">Florida</option>
                  <option value="Other">Other</option>
                </FormSelect>
                <FormField
                  label="ZIP code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10001"
                  required
                />
              </FormGrid>
              <ToggleRow
                title="Billing address is the same"
                description="Use this address for payment records."
                defaultChecked
              />
            </div>
          </FormCard>

          <FormCard title="Notes">
            <FormTextarea
              label="Customer note"
              placeholder="Delivery instructions visible on the order."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              optional
            />
          </FormCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20">
          <FormCard title="Order summary">
            <dl className="space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <SummaryRow
                label="Shipping"
                value={shipping ? `$${shipping.toFixed(2)}` : "Free"}
              />
              <SummaryRow label="Estimated tax (8%)" value={`$${tax.toFixed(2)}`} />
              <div className="border-t border-slate-200 pt-3">
                <SummaryRow
                  label="Total"
                  value={`$${total.toFixed(2)}`}
                  strong
                />
              </div>
            </dl>
          </FormCard>

          <FormCard title="Payment Status" icon={<CreditCard size={18} />}>
            <FormSelect
              label="Payment status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="REQUIRES_PAYMENT_METHOD">Payment Pending (Requires payment)</option>
              <option value="SUCCEEDED">Mark as Paid (Succeeded)</option>
            </FormSelect>
          </FormCard>
        </aside>
      </div>

      <FormActions
        cancelHref="/admin/orders"
        submitLabel="Create order"
        saving={createOrderMutation.isPending}
      />
    </form>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        strong ? "text-base font-semibold text-slate-950" : "text-slate-600"
      }`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
