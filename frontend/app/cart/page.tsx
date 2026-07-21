"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { useCart } from "@/features/storefront/cart";

const money = (value: number) => `$${value.toFixed(2)}`;

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <StorefrontShell>
      <Breadcrumb title="Shopping Cart" />
      <div className="shopping_cart_area">
        <div className="row">
          <div className="col-12">
            <div className="table_desc">
              <div className="cart_page table-responsive">
                <table>
                  <caption className="sr-only">
                    Products in your shopping cart
                  </caption>
                  <thead>
                    <tr>
                      <th className="product_remove">Delete</th>
                      <th className="product_thumb">Image</th>
                      <th className="product_name">Product</th>
                      <th className="product-price">Price</th>
                      <th className="product_quantity">Quantity</th>
                      <th className="product_total">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="product_remove">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </td>
                        <td className="product_thumb">
                          <Link href={`/products/${item.slug}`}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={100}
                              height={100}
                            />
                          </Link>
                        </td>
                        <td className="product_name">
                          <Link href={`/products/${item.slug}`}>
                            {item.name}
                          </Link>
                          {item.options && (
                            <small>
                              {Object.entries(item.options)
                                .map(([name, value]) => `${name}: ${value}`)
                                .join(" · ")}
                            </small>
                          )}
                        </td>
                        <td className="product-price">{money(item.price)}</td>
                        <td className="product_quantity">
                          <label
                            className="sr-only"
                            htmlFor={`quantity-${item.id}`}
                          >
                            Quantity for {item.name}
                          </label>
                          <input
                            id={`quantity-${item.id}`}
                            min="1"
                            max="100"
                            value={item.quantity}
                            onChange={(event) =>
                              updateQuantity(
                                item.id,
                                Number(event.target.value),
                              )
                            }
                            type="number"
                          />
                        </td>
                        <td className="product_total">
                          {money(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <div className="error_form">
                    <h2>Your cart is empty</h2>
                    <p>Products you add will appear here.</p>
                    <Link href="/shop">Continue shopping</Link>
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="cart_submit">
                  <button type="button" onClick={clearCart}>
                    Clear cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {items.length > 0 && (
          <div className="coupon_area">
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="coupon_code">
                  <h3>Coupon</h3>
                  <div className="coupon_inner">
                    <p>Enter your coupon code if you have one.</p>
                    <label className="sr-only" htmlFor="coupon-code">
                      Coupon code
                    </label>
                    <input
                      id="coupon-code"
                      placeholder="Coupon code"
                      type="text"
                    />
                    <button type="button">Apply coupon</button>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="coupon_code">
                  <h3>Cart Totals</h3>
                  <div className="coupon_inner">
                    <div className="cart_subtotal">
                      <p>Subtotal</p>
                      <p className="cart_amount">{money(subtotal)}</p>
                    </div>
                    <div className="cart_subtotal">
                      <p>Shipping</p>
                      <p className="cart_amount">
                        <span>Flat Rate:</span> Free
                      </p>
                    </div>
                    <div className="cart_subtotal">
                      <p>Total</p>
                      <p className="cart_amount">{money(subtotal)}</p>
                    </div>
                    <div className="checkout_btn">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
