"use client";

import Image from "next/image";
import { useState } from "react";
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
import { toast } from "sonner";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  required = true,
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
        required={required}
      />
    </label>
  );
}

function DeliveryFields({ prefix = "billing" }: { prefix?: string }) {
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
  const { items, subtotal } = useCart();
  const [shippingOpen, setShippingOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");

  function applyCoupon() {
    if (!coupon.trim()) {
      toast.error("Enter a coupon code first.");
      return;
    }
    toast.info("Coupon received", {
      description: "The code will be verified before your order is completed.",
    });
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
          <div className="pc-details">
            <section className="pc-card">
              <div className="pc-section-heading">
                <span>1</span>
                <div>
                  <h2>Contact information</h2>
                  <p>We’ll send your receipt and delivery updates here.</p>
                </div>
                <a href="/login">Sign in</a>
              </div>
              <div className="pc-fields">
                <div className="pc-field-full">
                  <Field
                    id="checkout-email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
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
                  checked={shippingOpen}
                  onChange={(event) => setShippingOpen(event.target.checked)}
                />
                <span>
                  <strong>Use a different billing address</strong>
                  <small>
                    Enter an address different from the delivery address.
                  </small>
                </span>
              </label>
              {shippingOpen && (
                <div className="pc-nested-fields">
                  <DeliveryFields prefix="shipping" />
                </div>
              )}
              <label className="pc-check pc-option">
                <input
                  type="checkbox"
                  checked={accountOpen}
                  onChange={(event) => setAccountOpen(event.target.checked)}
                />
                <span>
                  <strong>Save my details for next time</strong>
                  <small>Create an account after completing your order.</small>
                </span>
              </label>
              {accountOpen && (
                <div className="pc-nested-fields">
                  <Field
                    id="account-password"
                    label="Create a password"
                    type="password"
                    autoComplete="new-password"
                  />
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
          </div>

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
                  <dd className="pc-free">Free</dd>
                </div>
                <div className="pc-total">
                  <dt>
                    Total <small>USD</small>
                  </dt>
                  <dd>${subtotal.toFixed(2)}</dd>
                </div>
              </dl>

              <div className="pc-payment">
                <StripeCheckout items={items} total={subtotal} />
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
