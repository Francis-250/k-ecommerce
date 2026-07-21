"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { AddCartItem } from "./types";

export function AddToCartButton({
  item,
  children,
  className,
}: {
  item: AddCartItem;
  children?: ReactNode;
  className?: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(item);
        toast.success(`${item.name} added to your cart`, {
          description: `${item.quantity ?? 1} item${(item.quantity ?? 1) === 1 ? "" : "s"} added successfully.`,
          action: { label: "View cart", onClick: () => router.push("/cart") },
        });
      }}
    >
      {children ?? "Add to cart"}
    </button>
  );
}
