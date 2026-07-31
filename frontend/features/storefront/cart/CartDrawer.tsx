"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { CircleX, ShoppingCart, X } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    cartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!cartDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCartDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("cart-drawer-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("cart-drawer-open");
    };
  }, [cartDrawerOpen, closeCartDrawer]);

  return (
    <>
      <div
        className={`cart-drawer-backdrop ${cartDrawerOpen ? "is-open" : ""}`}
        onClick={closeCartDrawer}
        aria-hidden="true"
      />
      <aside
        id="cart-drawer"
        className={`cart-drawer-panel ${cartDrawerOpen ? "is-open" : ""}`}
        aria-label="Shopping Cart Drawer"
        aria-hidden={!cartDrawerOpen}
      >
        <div className="cart-drawer-header">
          <h3>
            <ShoppingCart size={18} aria-hidden="true" /> My Cart ({itemCount})
          </h3>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart drawer"
            onClick={closeCartDrawer}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="cart-drawer-content">
          {items.length === 0 ? (
            <div className="cart-drawer-empty-state">
              <p>Your cart is currently empty.</p>
              <Link
                href="/shop"
                className="coron-btn"
                onClick={closeCartDrawer}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="mini_cart_items">
              {items.map((item) => (
                <div className="cart_item" key={item.id}>
                  <div className="cart_img">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCartDrawer}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={75}
                        height={75}
                        unoptimized
                      />
                    </Link>
                  </div>
                  <div className="cart_info">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCartDrawer}
                    >
                      {item.name}
                    </Link>
                    {item.options && Object.keys(item.options).length > 0 && (
                      <small className="cart_item_options">
                        {Object.entries(item.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" | ")}
                      </small>
                    )}
                    <span className="cart_price">${item.price.toFixed(2)}</span>
                    <div className="cart_item_qty_controls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span>Qty: {item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart_remove">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      title={`Remove ${item.name}`}
                      aria-label={`Remove ${item.name}`}
                    >
                      <CircleX size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="shipping_price">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="total_price">
              <span>Total</span>
              <span className="prices">${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart_button">
              <Link href="/checkout" onClick={closeCartDrawer}>
                Check out
              </Link>
              <Link href="/cart" onClick={closeCartDrawer} className="view-cart-link">
                View cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
