"use client";

import Image from "next/image";
import {
  CreditCard,
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
import {
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
  FormTextarea,
  ToggleRow,
} from "./AdminFormUI";

const sampleProducts = [
  {
    id: 1,
    name: "Indigo Ankara Midi Dress",
    variant: "Small",
    price: 118,
    image: "/storefront/assets/img/african-products/ankara-midi-dress.png",
  },
  {
    id: 2,
    name: "Emerald Ankara Handbag",
    variant: "Default",
    price: 96,
    image: "/storefront/assets/img/african-products/ankara-handbag.png",
  },
];

export function OrderForm() {
  const [items, setItems] = useState([{ ...sampleProducts[0], quantity: 1 }]);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 100 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Draft order created");
      }}
      className="mx-auto max-w-6xl"
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <FormCard
            title="Products"
            description="Search the catalogue and add variants to this draft order."
            icon={<ShoppingBag size={18} />}
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
                placeholder="Search products by title, SKU, or barcode"
              />
            </div>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="size-14 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.variant} · ${item.price.toFixed(2)}
                    </p>
                    <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((current) =>
                            current.map((entry) =>
                              entry.id === item.id
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
                          setItems((current) =>
                            current.map((entry) =>
                              entry.id === item.id
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
                        setItems((current) =>
                          current.filter((entry) => entry.id !== item.id),
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
              {items.length === 0 && (
                <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                  <div>
                    <ShoppingBag className="mx-auto text-slate-400" size={25} />
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      No products added
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Search above to build the order.
                    </p>
                  </div>
                </div>
              )}
              {items.length === 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) => [
                      ...current,
                      { ...sampleProducts[1], quantity: 1 },
                    ])
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={15} /> Add sample product
                </button>
              )}
            </div>
          </FormCard>

          <FormCard
            title="Customer and contact"
            description="Choose an existing customer or enter guest details."
            icon={<UserRound size={18} />}
          >
            <div className="space-y-5">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
                  placeholder="Search existing customers"
                />
              </div>
              <FormGrid>
                <FormField
                  label="Email address"
                  type="email"
                  placeholder="customer@example.com"
                  required
                />
                <FormField
                  label="Phone number"
                  type="tel"
                  placeholder="+1 202 555 0124"
                  optional
                />
              </FormGrid>
            </div>
          </FormCard>

          <FormCard title="Shipping address" icon={<MapPin size={18} />}>
            <div className="space-y-5">
              <FormGrid>
                <FormField label="First name" required />
                <FormField label="Last name" required />
              </FormGrid>
              <FormField label="Street address" required />
              <FormField label="Apartment, suite, etc." optional />
              <FormGrid columns={3}>
                <FormField label="City" required />
                <FormSelect label="State">
                  <option>New York</option>
                  <option>California</option>
                  <option>Texas</option>
                </FormSelect>
                <FormField label="ZIP code" required />
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
              optional
            />
            <div className="mt-5">
              <FormTextarea
                label="Internal note"
                placeholder="Private information visible only to staff."
                optional
              />
            </div>
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
              <SummaryRow label="Estimated tax" value={`$${tax.toFixed(2)}`} />
              <div className="border-t border-slate-200 pt-3">
                <SummaryRow
                  label="Total"
                  value={`$${total.toFixed(2)}`}
                  strong
                />
              </div>
            </dl>
            <button
              type="button"
              className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add discount
            </button>
          </FormCard>

          <FormCard title="Payment" icon={<CreditCard size={18} />}>
            <FormSelect label="Payment status">
              <option>Payment pending</option>
              <option>Mark as paid</option>
              <option>Payment due later</option>
            </FormSelect>
            <div className="mt-5">
              <FormSelect label="Currency" defaultValue="USD">
                <option value="USD">USD — U.S. dollar</option>
              </FormSelect>
            </div>
          </FormCard>

          <FormCard title="Order options">
            <ToggleRow
              title="Reserve inventory"
              description="Hold stock immediately for this draft."
              defaultChecked
            />
            <ToggleRow
              title="Send invoice"
              description="Email the customer after the draft is created."
            />
          </FormCard>
        </aside>
      </div>
      <FormActions
        cancelHref="/admin/orders"
        submitLabel="Create draft order"
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
