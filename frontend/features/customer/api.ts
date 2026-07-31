import { getAuthToken } from "@/features/auth/api";
import { type ApiOrder } from "@/features/admin/orders/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export class CustomerApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CustomerApiError";
  }
}

export type CustomerProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  role: string;
  isVerified: boolean;
  createdAt?: string;
};

export type CustomerAddress = {
  id: string;
  type?: "SHIPPING" | "BILLING";
  fullName: string;
  company?: string | null;
  phone: string;
  countryCode: string;
  country: string;
  province?: string | null;
  city: string;
  district?: string | null;
  sector?: string | null;
  street: string;
  street2?: string | null;
  postalCode?: string | null;
  isDefault?: boolean;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    error?: { fieldErrors?: Record<string, string[]> };
  };

  if (!response.ok) {
    const fieldMessage = body.error?.fieldErrors
      ? Object.values(body.error.fieldErrors).flat()[0]
      : undefined;
    throw new CustomerApiError(
      fieldMessage ?? body.message ?? "Request failed.",
      response.status,
    );
  }

  return body;
}

export const customerApi = {
  getProfile: () =>
    request<{ success: boolean; user: CustomerProfile }>("/users/me").then(
      (res) => res.user,
    ),

  updateProfile: (data: Partial<CustomerProfile>) =>
    request<{ success: boolean; user: CustomerProfile }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((res) => res.user),

  listOrders: () =>
    request<{
      data: ApiOrder[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>("/orders?limit=50").then((res) => res.data),

  listAddresses: () =>
    request<{ success: boolean; addresses: CustomerAddress[] }>("/addresses").then(
      (res) => res.addresses,
    ),

  createAddress: (data: Omit<CustomerAddress, "id">) =>
    request<{ success: boolean; address: CustomerAddress }>("/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.address),

  deleteAddress: (id: string) =>
    request<void>(`/addresses/${id}`, {
      method: "DELETE",
    }),
};
