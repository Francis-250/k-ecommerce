"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

function DeliveryFields({ prefix = "shipping" }: { prefix?: string }) {
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
      />
      <Field
        id={`${prefix}-last-name`}
        label="Last name"
        autoComplete="family-name"
      />
      <div className="pc-field-full">
        <Field
          id={`${prefix}-company`}
          label="Company"
          autoComplete="organization"
          required={false}
        />
      </div>
      <div className="pc-field-full">
        <Field
          id={`${prefix}-address`}
          label="Street address"
          autoComplete="address-line1"
          placeholder="House number and street name"
        />
      </div>
      <div className="pc-field-full">
        <Field
          id={`${prefix}-apartment`}
          label="Apartment, suite, etc."
          autoComplete="address-line2"
          required={false}
        />
      </div>
      <Field id={`${prefix}-city`} label="City" autoComplete="address-level2" />
      <Field
        id={`${prefix}-state`}
        label="State"
        autoComplete="address-level1"
      />
      <Field id={`${prefix}-zip`} label="ZIP code" autoComplete="postal-code" />
      <Field
        id={`${prefix}-phone`}
        label="Phone"
        type="tel"
        autoComplete="tel"
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
  const [billingOpen, setBillingOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [completedOrder, setCompletedOrder] = useState("");
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
    return order.id;
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
                {status !== "authenticated" && <a href="/login">Sign in</a>}
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
              <DeliveryFields />
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
