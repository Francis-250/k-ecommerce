"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type CreateOrderInput, type UpdateOrderInput } from "./api";

export const ordersQueryKey = ["admin", "orders"] as const;

export function useOrders(statusFilter?: string) {
  return useQuery({
    queryKey: [...ordersQueryKey, statusFilter ?? "All"],
    queryFn: () => ordersApi.listOrders(statusFilter),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [...ordersQueryKey, id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: Boolean(id),
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  return {
    create: useMutation({
      mutationFn: (input: CreateOrderInput) => ordersApi.createOrder(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateOrderInput }) =>
        ordersApi.updateOrder(id, input),
      onSuccess: refresh,
    }),
    cancel: useMutation({
      mutationFn: (id: string) => ordersApi.cancelOrder(id),
      onSuccess: refresh,
    }),
  };
}
