"use client";

import { useQuery } from "@tanstack/react-query";
import { getStorefrontAppearance } from "./api";

export const storefrontAppearanceQueryKey = [
  "storefront",
  "appearance",
] as const;

export function useStorefrontAppearance() {
  return useQuery({
    queryKey: storefrontAppearanceQueryKey,
    queryFn: getStorefrontAppearance,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
