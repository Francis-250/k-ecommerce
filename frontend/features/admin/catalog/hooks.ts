"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogApi,
  type BrandInput,
  type CategoryInput,
  type CouponInput,
} from "./api";

export const brandsQueryKey = ["admin", "brands"] as const;
export const categoriesQueryKey = ["admin", "categories"] as const;
export const couponsQueryKey = ["admin", "coupons"] as const;

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
