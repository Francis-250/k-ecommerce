const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export class CustomersApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CustomersApiError";
  }
}

export type ApiUserAddress = {
  id: string;
  type: "SHIPPING" | "BILLING";
  fullName: string;
  phone: string;
  city: string;
  province?: string | null;
  street: string;
  postalCode?: string | null;
  country: string;
};

export type ApiUserOrder = {
  id: string;
  orderNumber: string;
  total: string | number;
  status: string;
  createdAt: string;
};

export type ApiCustomer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  avatar: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  acceptsMarketing: boolean;
  taxExempt: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { orders: number };
  orders?: ApiUserOrder[];
  addresses?: ApiUserAddress[];
};

export type CreateCustomerInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  role?: "CUSTOMER" | "STAFF" | "ADMIN";
  acceptsMarketing?: boolean;
  taxExempt?: boolean;
};

export type UpdateCustomerInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "CUSTOMER" | "STAFF" | "ADMIN";
  isActive?: boolean;
  isBanned?: boolean;
  acceptsMarketing?: boolean;
  taxExempt?: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
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
    throw new CustomersApiError(
      fieldMessage ?? body.message ?? "The customer request failed.",
      response.status,
    );
  }
  return body;
}

export const customersApi = {
  listCustomers: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=100` : `?limit=100`;
    return request<{
      data: ApiCustomer[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/users${query}`).then((res) => res.data);
  },
  getCustomer: (id: string) =>
    request<{ success: boolean; user: ApiCustomer }>(`/users/${id}`).then(
      (res) => res.user,
    ),
  createCustomer: (input: CreateCustomerInput) =>
    request<{ success: boolean; user: ApiCustomer }>("/users", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((res) => res.user),
  updateCustomer: (id: string, input: UpdateCustomerInput) =>
    request<{ success: boolean; user: ApiCustomer }>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((res) => res.user),
  deleteCustomer: (id: string) =>
    request<void>(`/users/${id}`, {
      method: "DELETE",
    }),
};
