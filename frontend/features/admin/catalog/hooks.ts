"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogApi,
  type BrandInput,
  type CategoryInput,
  type CouponInput,
} from "./api";

export const productsQueryKey = ["admin", "products"] as const;
export const brandsQueryKey = ["admin", "brands"] as const;
export const categoriesQueryKey = ["admin", "categories"] as const;
export const couponsQueryKey = ["admin", "coupons"] as const;

export function useProducts() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: catalogApi.listProducts,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: productsQueryKey });
    queryClient.invalidateQueries({ queryKey: ["storefront", "catalog"] });
  };
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        catalogApi.createProduct(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: Record<string, unknown>;
      }) => catalogApi.updateProduct(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: catalogApi.deleteProduct,
      onSuccess: refresh,
    }),
  };
}

export function useBrands() {
  return useQuery({ queryKey: brandsQueryKey, queryFn: catalogApi.listBrands });
}

export function useBrandMutations() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: brandsQueryKey });
  return {
    create: useMutation({
      mutationFn: (input: BrandInput) => catalogApi.createBrand(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: BrandInput }) =>
        catalogApi.updateBrand(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: catalogApi.deleteBrand,
      onSuccess: refresh,
    }),
  };
}

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: catalogApi.listCategories,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
  return {
    create: useMutation({
      mutationFn: (input: CategoryInput) => catalogApi.createCategory(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
        catalogApi.updateCategory(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: catalogApi.deleteCategory,
      onSuccess: refresh,
    }),
  };
}

export function useCoupons() {
  return useQuery({
    queryKey: couponsQueryKey,
    queryFn: catalogApi.listCoupons,
  });
}

export function useCouponMutations() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: couponsQueryKey });
  return {
    create: useMutation({
      mutationFn: (input: CouponInput) => catalogApi.createCoupon(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: CouponInput }) =>
        catalogApi.updateCoupon(id, input),
      onSuccess: refresh,
    }),
    disable: useMutation({
      mutationFn: catalogApi.disableCoupon,
      onSuccess: refresh,
    }),
  };
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: productsQueryKey });
    queryClient.invalidateQueries({ queryKey: ["admin", "inventory-movements"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "inventory-alerts"] });
  };
  return {
    adjustStock: useMutation({
      mutationFn: (input: import("./api").InventoryMovementInput) =>
        catalogApi.recordInventoryMovement(input),
      onSuccess: refresh,
    }),
  };
}

export function useInventoryAlerts() {
  return useQuery({
    queryKey: ["admin", "inventory-alerts"] as const,
    queryFn: catalogApi.getInventoryAlerts,
    refetchInterval: 30000,
  });
}

export function useMarkAlertsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: catalogApi.markAlertsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory-alerts"] });
    },
  });
}




