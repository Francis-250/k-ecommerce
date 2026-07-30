export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: Pagination;
};

export type DashboardProduct = {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  audience: string;
  createdAt: string;
  category: { id: string; name: string; slug: string } | null;
  images: Array<{ id: string; url: string; altText: string | null }>;
  variants: Array<{
    id: string;
    inventory: {
      quantity: number;
      reserved: number;
      reorderPoint: number;
    } | null;
  }>;
};

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: string;
  currency: string;
  createdAt: string;
  _count: { items: number };
};

export type DashboardUser = {
  id: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
};

export type DashboardData = {
  products: PaginatedResponse<DashboardProduct>;
  orders: PaginatedResponse<DashboardOrder>;
  users: PaginatedResponse<DashboardUser>;
};

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

import { getAuthToken } from "@/features/auth/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function get<T>(path: string): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new AdminApiError(
      body.message ?? "Unable to load dashboard data",
      response.status,
    );
  }

  return body;
}

export function getAdminDashboard(): Promise<DashboardData> {
  return Promise.all([
    get<PaginatedResponse<DashboardProduct>>("/products?limit=100"),
    get<PaginatedResponse<DashboardOrder>>("/orders?limit=100"),
    get<PaginatedResponse<DashboardUser>>("/users?limit=100"),
  ]).then(([products, orders, users]) => ({ products, orders, users }));
}
