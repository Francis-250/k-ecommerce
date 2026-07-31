"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AddCartItem, CartItem } from "./types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addItem: (item: AddCartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "storefront-cart";

function itemId(item: AddCartItem) {
  const options = Object.entries(item.options ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `${item.slug}:${JSON.stringify(options)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved) as CartItem[]);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  function updateItems(updater: (current: CartItem[]) => CartItem[]) {
    setItems((current) => {
      const next = updater(current);
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      cartDrawerOpen,
      setCartDrawerOpen,
      openCartDrawer: () => setCartDrawerOpen(true),
      closeCartDrawer: () => setCartDrawerOpen(false),
      addItem: (item) => {
        updateItems((current) => {
          const id = itemId(item);
          const quantity = Math.max(1, item.quantity ?? 1);
          const existing = current.find((entry) => entry.id === id);
          if (existing)
            return current.map((entry) =>
              entry.id === id
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry,
            );
          return [...current, { ...item, id, quantity }];
        });
        setCartDrawerOpen(true);
      },
      updateQuantity: (id, quantity) =>
        updateItems((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        ),
      removeItem: (id) =>
        updateItems((current) => current.filter((item) => item.id !== id)),
      clearCart: () => updateItems(() => []),
    }),
    [items, cartDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
