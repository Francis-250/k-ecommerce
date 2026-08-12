"use client";

import { useQuery } from "@tanstack/react-query";
import { getStorefrontCatalog } from "./api";

export const storefrontCatalogQueryKey = ["storefront", "catalog"] as const;

export function useStorefrontCatalog() {
  return useQuery({
    queryKey: storefrontCatalogQueryKey,
    queryFn: getStorefrontCatalog,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
