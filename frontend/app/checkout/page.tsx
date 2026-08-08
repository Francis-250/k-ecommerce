"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { useCart } from "@/features/storefront/cart";
import { StripeCheckout } from "@/features/storefront/checkout/StripeCheckout";
import {
  createOrder,
  type CheckoutAddress,
} from "@/features/storefront/checkout/api";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store";
import { customerApi } from "@/features/customer/api";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
};

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  required = true,
  defaultValue,
}: FieldProps) {
  return (
    <label className="pc-field" htmlFor={id}>
      <span>
        {label}
        {!required && <small>Optional</small>}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

type DeliveryValues = {
  firstName?: string;
  lastName?: string;
  company?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
};

function DeliveryFields({
  prefix = "shipping",
  defaultValues,
}: {
  prefix?: string;
  defaultValues?: DeliveryValues;
}) {
  return (
    <div className="pc-fields">
      <div className="pc-field pc-field-full">
        <label htmlFor={`${prefix}-country`}>Country/Region</label>
        <select
          id={`${prefix}-country`}
          name={`${prefix}-country`}
          defaultValue="US"
        >
          <option value="US">United States</option>
        </select>
      </div>
      <Field
        id={`${prefix}-first-name`}
        label="First name"
        autoComplete="given-name"
        defaultValue={defaultValues?.firstName}
        key={`${prefix}-fn-${defaultValues?.firstName || ""}`}
      />
      <Field
        id={`${prefix}-last-name`}
        label="Last name"
        autoComplete="family-name"
        defaultValue={defaultValues?.lastName}
        key={`${prefix}-ln-${defaultValues?.lastName || ""}`}
      />
      <div className="pc-field-full">
        <Field
          id={`${prefix}-company`}
          label="Company"
          autoComplete="organization"
          required={false}
          defaultValue={defaultValues?.company}
          key={`${prefix}-co-${defaultValues?.company || ""}`}
        />
      </div>
      <div className="pc-field-full">
        <Field
          id={`${prefix}-address`}
          label="Street address"
          autoComplete="address-line1"
          placeholder="House number and street name"
          defaultValue={defaultValues?.street}
          key={`${prefix}-st-${defaultValues?.street || ""}`}
        />
      </div>
      <div className="pc-field-full">
        <Field
          id={`${prefix}-apartment`}
          label="Apartment, suite, etc."
          autoComplete="address-line2"
          required={false}
          defaultValue={defaultValues?.apartment}
          key={`${prefix}-apt-${defaultValues?.apartment || ""}`}
        />
      </div>
      <Field
        id={`${prefix}-city`}
        label="City"
        autoComplete="address-level2"
        defaultValue={defaultValues?.city}
        key={`${prefix}-ct-${defaultValues?.city || ""}`}
      />
      <Field
        id={`${prefix}-state`}
        label="State"
        autoComplete="address-level1"
        defaultValue={defaultValues?.state}
        key={`${prefix}-stt-${defaultValues?.state || ""}`}
      />
      <Field
        id={`${prefix}-zip`}
        label="ZIP code"
        autoComplete="postal-code"
        defaultValue={defaultValues?.zip}
        key={`${prefix}-zp-${defaultValues?.zip || ""}`}
      />
      <Field
        id={`${prefix}-phone`}
        label="Phone"
        type="tel"
        autoComplete="tel"
        defaultValue={defaultValues?.phone}
        key={`${prefix}-ph-${defaultValues?.phone || ""}`}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const detailsForm = useRef<HTMLFormElement>(null);
  const { items, subtotal } = useCart();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [billingOpen, setBillingOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [completedOrder, setCompletedOrder] = useState("");

  useEffect(() => {
    if (status === "idle") {
      void initialize();
      return;
    }

    if (status === "unauthenticated" || (status !== "loading" && !user)) {
      toast.error("Please sign in to access checkout.");
      router.replace("/login?redirect=/checkout");
    }
  }, [initialize, router, status, user]);

  const { data: addresses = [] } = useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: customerApi.listAddresses,
    enabled: Boolean(user),
  });

  const selectedSavedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const defaultDeliveryValues: DeliveryValues = useMemo(() => {
    if (selectedSavedAddress) {
      const parts = selectedSavedAddress.fullName.split(" ");
      return {
        firstName: parts[0] || user?.firstName || "",
        lastName: parts.slice(1).join(" ") || user?.lastName || "",
        company: selectedSavedAddress.company || "",
        street: selectedSavedAddress.street || "",
        apartment: selectedSavedAddress.street2 || "",
        city: selectedSavedAddress.city || "",
        state: selectedSavedAddress.province || "",
        zip: selectedSavedAddress.postalCode || "",
        phone: selectedSavedAddress.phone || user?.phone || "",
      };
    }
    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    };
  }, [selectedSavedAddress, user]);
  const shipping = subtotal >= 100 ? 0 : items.length ? 12 : 0;
  const estimatedTotal = subtotal + shipping;

  function applyCoupon() {
    if (!coupon.trim()) {
      toast.error("Enter a coupon code first.");
      return;
    }
    toast.info("Coupon received", {
      description: "The code will be verified before your order is completed.",
    });
  }

  function address(form: FormData, prefix: string): CheckoutAddress {
    return {
      firstName: String(form.get(`${prefix}-first-name`) ?? ""),
      lastName: String(form.get(`${prefix}-last-name`) ?? ""),
      company: String(form.get(`${prefix}-company`) ?? "") || null,
      phone: String(form.get(`${prefix}-phone`) ?? ""),
      countryCode: "US",
      country: "United States",
      state: String(form.get(`${prefix}-state`) ?? ""),
      city: String(form.get(`${prefix}-city`) ?? ""),
      line1: String(form.get(`${prefix}-address`) ?? ""),
      line2: String(form.get(`${prefix}-apartment`) ?? "") || null,
      postalCode: String(form.get(`${prefix}-zip`) ?? ""),
    };
  }

  async function createPendingOrder() {
    if (status !== "authenticated" || !user) {
      router.push("/login");
      throw new Error("Sign in before completing checkout.");
    }
    if (!detailsForm.current?.reportValidity()) {
      throw new Error("Complete the required delivery information.");
    }

    const form = new FormData(detailsForm.current);
    const shippingAddress = address(form, "shipping");
    const billingAddress = billingOpen
      ? address(form, "billing")
      : shippingAddress;
    const order = await createOrder({
      email: String(form.get("checkout-email")),
      phone: shippingAddress.phone,
      customerNote: String(form.get("order-note") ?? "") || null,
      couponCode: coupon.trim() || null,
      shippingAddress,
      billingAddress,
      items: items.map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
        options: item.options,
      })),
    });

    // Save shipping address to customer address book in backend
    if (user && shippingAddress.line1 && shippingAddress.city) {
      const fullName = `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim();
      customerApi
        .createAddress({
          fullName,
          phone: shippingAddress.phone || "0000000000",
          street: shippingAddress.line1,
          street2: shippingAddress.line2 || null,
          city: shippingAddress.city,
          province: shippingAddress.state || null,
          country: shippingAddress.country || "United States",
          countryCode: shippingAddress.countryCode || "US",
          postalCode: shippingAddress.postalCode || null,
          company: shippingAddress.company || null,
        })
        .catch(() => {
          // Address saved or ignore duplicate
        });
    }

    return order.id;
  }

  if (status === "idle" || status === "loading") {
    return (
      <StorefrontShell>
        <Breadcrumb title="Checkout" />
        <div className="grid min-h-[450px] place-items-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div
              className="size-9 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
              role="status"
              aria-label="Checking authentication access"
            />
            <p className="text-sm font-medium text-slate-600">Verifying session...</p>
          </div>
        </div>
      </StorefrontShell>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <StorefrontShell>
        <Breadcrumb title="Checkout" />
        <div className="grid min-h-[450px] place-items-center bg-white">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <LockKeyhole size={36} className="text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900">Sign in to Checkout</h2>
            <p className="text-sm text-slate-600 max-w-sm">
              You must be logged in to access the checkout page. Redirecting to login...
            </p>
            <button
              type="button"
              onClick={() => router.replace("/login?redirect=/checkout")}
              className="mt-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </StorefrontShell>
    );
  }

  if (completedOrder) {
    return (
      <StorefrontShell>
        <Breadcrumb title="Order confirmed" />
        <main className="pc-checkout">
          <div className="mx-auto max-w-2xl rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <Check size={28} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-slate-950">
              Thank you for your order
            </h1>
            <p className="mt-2 text-slate-600">
              Payment was received and order {completedOrder} is confirmed.
            </p>
            <button
              type="button"
              onClick={() => router.push("/my-account")}
              className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              View my account
            </button>
          </div>
        </main>
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell>
      <Breadcrumb title="Checkout" />
      <main className="pc-checkout">
        <header className="pc-heading">
          <div>
            <span className="pc-eyebrow">
              <LockKeyhole size={14} aria-hidden="true" />
              Secure checkout
            </span>
            <h1>Complete your order</h1>
            <p>Enter your delivery details and pay securely through Stripe.</p>
          </div>
          <div className="pc-progress" aria-label="Checkout progress">
            <span className="is-complete">
              <Check size={13} aria-hidden="true" /> Cart
            </span>
            <i />
            <span className="is-current">Checkout</span>
            <i />
            <span>Confirmation</span>
          </div>
        </header>

        <div className="pc-layout">
          <form
            ref={detailsForm}
            className="pc-details"
            onSubmit={(event) => event.preventDefault()}
          >
            <section className="pc-card">
              <div className="pc-section-heading">
                <span>1</span>
                <div>
                  <h2>Contact information</h2>
                  <p>We’ll send your receipt and delivery updates here.</p>
                </div>
                {user?.email && (
                  <span className="text-xs font-medium text-slate-500">
                    Logged in as {user.email}
                  </span>
                )}
              </div>
              <div className="pc-fields">
                <div className="pc-field-full">
                  <Field
                    id="checkout-email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    defaultValue={user?.email}
                  />
                </div>
              </div>
              <label className="pc-check">
                <input type="checkbox" defaultChecked />
                <span>Send me order and delivery updates by email.</span>
              </label>
            </section>

            <section className="pc-card">
              <div className="pc-section-heading">
                <span>2</span>
                <div>
                  <h2>Delivery address</h2>
                  <p>Currently shipping to addresses in the United States.</p>
                </div>
              </div>

              {addresses.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <label
                    htmlFor="saved-address-select"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Use a saved address
                  </label>
                  <select
                    id="saved-address-select"
                    value={selectedSavedAddress?.id || ""}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded bg-white text-sm font-medium text-slate-800"
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.fullName} — {addr.street}, {addr.city}{" "}
                        {addr.postalCode || ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <DeliveryFields defaultValues={defaultDeliveryValues} />
            </section>

            <section className="pc-card pc-options">
              <label className="pc-check pc-option">
                <input
                  type="checkbox"
                  checked={billingOpen}
                  onChange={(event) => setBillingOpen(event.target.checked)}
                />
                <span>
                  <strong>Use a different billing address</strong>
                  <small>
                    Enter an address different from the delivery address.
                  </small>
                </span>
              </label>
              {billingOpen && (
                <div className="pc-nested-fields">
                  <DeliveryFields prefix="billing" />
                </div>
              )}
              <div className="pc-field pc-note">
                <label htmlFor="order-note">
                  Order note <small>Optional</small>
                </label>
                <textarea
                  id="order-note"
                  name="order-note"
                  placeholder="Add delivery instructions or a note about your order."
                />
              </div>
            </section>
          </form>

          <aside className="pc-summary" aria-label="Order summary">
            <div className="pc-summary-card">
              <div className="pc-summary-title">
                <h2>Order summary</h2>
                <span>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="pc-items">
                {items.length ? (
                  items.map((item) => (
                    <article className="pc-item" key={item.id}>
                      <div className="pc-item-image">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={72}
                          height={88}
                        />
                        <span>{item.quantity}</span>
                      </div>
                      <div className="pc-item-info">
                        <h3>{item.name}</h3>
                        {item.options && (
                          <p>
                            {Object.entries(item.options)
                              .map(([name, value]) => `${name}: ${value}`)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <strong>
                        ${(item.price * item.quantity).toFixed(2)}
                      </strong>
                    </article>
                  ))
                ) : (
                  <div className="pc-empty">
                    <PackageCheck size={30} aria-hidden="true" />
                    <p>Your cart is empty.</p>
                    <a href="/shop">Continue shopping</a>
                  </div>
                )}
              </div>

              <div className="pc-coupon">
                <button
                  type="button"
                  onClick={() => setCouponOpen((current) => !current)}
                  aria-expanded={couponOpen}
                >
                  <Tag size={15} aria-hidden="true" />
                  Have a coupon code?
                </button>
                {couponOpen && (
                  <div>
                    <label className="sr-only" htmlFor="coupon-code">
                      Coupon code
                    </label>
                    <input
                      id="coupon-code"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                      placeholder="Enter code"
                    />
                    <button type="button" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <dl className="pc-totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>${subtotal.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd className={shipping === 0 ? "pc-free" : undefined}>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </dd>
                </div>
                <div>
                  <dt>Sales tax</dt>
                  <dd>Calculated from delivery address</dd>
                </div>
                <div className="pc-total">
                  <dt>
                    Total <small>USD</small>
                  </dt>
                  <dd>${estimatedTotal.toFixed(2)}</dd>
                </div>
              </dl>

              <div className="pc-payment">
                <StripeCheckout
                  disabled={items.length === 0}
                  estimatedTotal={estimatedTotal}
                  createPendingOrder={createPendingOrder}
                  onSuccess={setCompletedOrder}
                />
                <p>
                  By placing your order, you agree to our terms and privacy
                  policy.
                </p>
              </div>

              <div className="pc-trust">
                <span>
                  <ShieldCheck size={18} aria-hidden="true" />
                  Secure Stripe payment
                </span>
                <span>
                  <Truck size={18} aria-hidden="true" />
                  Free U.S. shipping
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </StorefrontShell>
  );
}
