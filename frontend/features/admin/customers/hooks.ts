"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi, type CreateCustomerInput, type UpdateCustomerInput } from "./api";

export const customersQueryKey = ["admin", "customers"] as const;

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: [...customersQueryKey, search ?? ""],
    queryFn: () => customersApi.listCustomers(search),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...customersQueryKey, id],
    queryFn: () => customersApi.getCustomer(id),
    enabled: Boolean(id),
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: customersQueryKey });
  };

  return {
    create: useMutation({
      mutationFn: (input: CreateCustomerInput) => customersApi.createCustomer(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
        customersApi.updateCustomer(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => customersApi.deleteCustomer(id),
      onSuccess: refresh,
    }),
  };
}
