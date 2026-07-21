"use client";

import Image from "next/image";
import { useState } from "react";
import { Breadcrumb, CoronShell } from "@/components/coron/CoronShell";
import { useCart } from "@/features/storefront/cart";
import { toast } from "sonner";

const countries = [
  "bangladesh",
  "Algeria",
  "Afghanistan",
  "Ghana",
  "Albania",
  "Bahrain",
  "Colombia",
  "Dominican Republic",
];

function TextField({
  label,
  type = "text",
  placeholder,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <>
      {label && (
        <label>
          {label} <span>*</span>
        </label>
      )}
      <input type={type} placeholder={placeholder} />
    </>
  );
}

function AddressFields({ shipping = false }: { shipping?: boolean }) {
  return (
    <div className="row">
      <div className="col-lg-6 mb-30">
        <TextField label="First Name" />
      </div>
      <div className="col-lg-6 mb-30">
        <TextField label="Last Name" />
      </div>
      <div className="col-12 mb-30">
        <label>Company Name</label>
        <input type="text" />
      </div>
      <div className="col-12 mb-30">
        <div className={shipping ? "select_form_select" : undefined}>
          <label htmlFor={shipping ? "shipping-country" : "country"}>
            country <span>*</span>
          </label>
          <select
            name={shipping ? "shipping_country" : "country"}
            id={shipping ? "shipping-country" : "country"}
          >
            {countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="col-12 mb-30">
        <TextField
          label="Street address"
          placeholder="House number and street name"
        />
      </div>
      <div className="col-12 mb-30">
        <input
          aria-label="Apartment, suite or unit"
          placeholder="Apartment, suite, unit etc. (optional)"
          type="text"
        />
      </div>
      <div className="col-12 mb-30">
        <TextField label="Town / City" />
      </div>
      <div className="col-12 mb-30">
        <TextField label="State / County" />
      </div>
      <div className="col-lg-6 mb-30">
        <TextField label="Phone" type="tel" />
      </div>
      <div className={shipping ? "col-lg-6" : "col-lg-6 mb-30"}>
        <TextField label="Email Address" type="email" />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [payment, setPayment] = useState("");

  return (
    <CoronShell>
      <Breadcrumb title="checkout" />
      <div className="Checkout_section">
        <div className="row">
          <div className="col-12">
            <div className="user-actions mb-20">
              <h3>
                <i className="fa fa-file-o" aria-hidden="true" /> Returning
                customer?{" "}
                <button
                  className="Returning"
                  type="button"
                  aria-expanded={loginOpen}
                  aria-controls="checkout_login"
                  onClick={() => setLoginOpen(!loginOpen)}
                >
                  Click here to login
                </button>
              </h3>
              <div
                id="checkout_login"
                className={`collapse${loginOpen ? " show" : ""}`}
              >
                <div className="checkout_info">
                  <p>
                    If you have shopped with us before, please enter your
                    details in the boxes below. If you are a new customer please
                    proceed to the Billing &amp; Shipping section.
                  </p>
                  <form action="#">
                    <div className="form_group mb-20">
                      <TextField label="Username or email" />
                    </div>
                    <div className="form_group mb-25">
                      <TextField label="Password" type="password" />
                    </div>
                    <div className="form_group group_3">
                      <input value="Login" type="submit" />
                      <label htmlFor="remember_box">
                        <input id="remember_box" type="checkbox" />
                        <span> Remember me </span>
                      </label>
                    </div>
                    <a href="#">Lost your password?</a>
                  </form>
                </div>
              </div>
            </div>
            <div className="user-actions mb-20">
              <h3>
                <i className="fa fa-file-o" aria-hidden="true" /> Returning
                customer?{" "}
                <button
                  className="Returning"
                  type="button"
                  aria-expanded={couponOpen}
                  aria-controls="checkout_coupon"
                  onClick={() => setCouponOpen(!couponOpen)}
                >
                  Click here to enter your code
                </button>
              </h3>
              <div
                id="checkout_coupon"
                className={`collapse${couponOpen ? " show" : ""}`}
              >
                <div className="checkout_info">
                  <form action="#">
                    <label className="sr-only" htmlFor="checkout-coupon">
                      Coupon code
                    </label>
                    <input
                      id="checkout-coupon"
                      placeholder="Coupon code"
                      type="text"
                    />
                    <input value="Apply coupon" type="submit" />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="checkout_form">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <form action="#">
                <h3>Billing Details</h3>
                <AddressFields />
                <div className="row">
                  <div className="col-12 mb-30">
                    <input
                      id="account"
                      type="checkbox"
                      checked={accountOpen}
                      onChange={(event) => setAccountOpen(event.target.checked)}
                      aria-controls="collapseOne"
                      aria-expanded={accountOpen}
                    />
                    <label htmlFor="account">Create an account?</label>
                    <div
                      id="collapseOne"
                      className={`collapse one${accountOpen ? " show" : ""}`}
                    >
                      <div className="card-body1">
                        <TextField
                          label="Account password"
                          type="password"
                          placeholder="password"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 mb-30">
                    <input
                      id="address"
                      type="checkbox"
                      checked={shippingOpen}
                      onChange={(event) =>
                        setShippingOpen(event.target.checked)
                      }
                      aria-controls="collapsetwo"
                      aria-expanded={shippingOpen}
                    />
                    <label className="righ_0" htmlFor="address">
                      Ship to a different address?
                    </label>
                    <div
                      id="collapsetwo"
                      className={`collapse one${shippingOpen ? " show" : ""}`}
                    >
                      <AddressFields shipping />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="order-notes">
                      <label htmlFor="order_note">Order Notes</label>
                      <textarea
                        id="order_note"
                        placeholder="Notes about your order, e.g. special notes for delivery."
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-6 col-md-6">
              <form onSubmit={(event) => { event.preventDefault(); if (items.length) toast.success("Order details are ready", { description: "Your cart products have been included in checkout." }); }}>
                <h3>Your order</h3>
                <div className="order_table table-responsive mb-30">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>{items.length ? items.map((item) => <tr key={item.id}><td>{item.name} <strong>× {item.quantity}</strong>{item.options && <small>{Object.entries(item.options).map(([name, value]) => `${name}: ${value}`).join(" · ")}</small>}</td><td>${(item.price * item.quantity).toFixed(2)}</td></tr>) : <tr><td colSpan={2}>Your cart is empty. Add products before checking out.</td></tr>}</tbody>
                    <tfoot>
                      <tr>
                        <th>Cart Subtotal</th>
                        <td>${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th>Shipping</th>
                        <td>
                          <strong>Free</strong>
                        </td>
                      </tr>
                      <tr className="order_total">
                        <th>Order Total</th>
                        <td>
                          <strong>${subtotal.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="payment_method">
                  <div className="panel-default">
                    <input
                      id="payment"
                      name="check_method"
                      type="radio"
                      checked={payment === "check"}
                      onChange={() => setPayment("check")}
                      aria-controls="method"
                    />
                    <label htmlFor="payment">Create an account?</label>
                    <div
                      id="method"
                      className={`collapse one${payment === "check" ? " show" : ""}`}
                    >
                      <div className="card-body1">
                        <p>
                          Please send a check to Store Name, Store Street, Store
                          Town, Store State / County, Store Postcode.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="panel-default">
                    <input
                      id="payment_defult"
                      name="check_method"
                      type="radio"
                      checked={payment === "paypal"}
                      onChange={() => setPayment("paypal")}
                      aria-controls="collapsedefult"
                    />
                    <label htmlFor="payment_defult">
                      PayPal{" "}
                      <Image
                        src="/coron/assets/img/visha/papyel.png"
                        alt="PayPal"
                        width={120}
                        height={35}
                      />
                    </label>
                    <div
                      id="collapsedefult"
                      className={`collapse one${payment === "paypal" ? " show" : ""}`}
                    >
                      <div className="card-body1">
                        <p>
                          Pay via PayPal; you can pay with your credit card if
                          you don&apos;t have a PayPal account.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="order_button">
                    <button type="submit" disabled={!items.length}>{items.length ? "Place order" : "Cart is empty"}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </CoronShell>
  );
}
