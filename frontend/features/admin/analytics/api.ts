import { getAuthToken } from "@/features/auth/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export class AnalyticsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AnalyticsApiError";
  }
}

export type ApiAnalyticsOverview = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    units: number;
    sales: number;
  }>;
  channels: Array<{
    label: string;
    value: string;
    orders: number;
    percent: number;
  }>;
  revenueTrend: Array<{
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }>;
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
  };
  if (!response.ok) {
    throw new AnalyticsApiError(
      body.message ?? "The analytics request failed.",
      response.status,
    );
  }
  return body;
}

export const analyticsApi = {
  getOverview: () =>
    request<{ success: boolean; data: ApiAnalyticsOverview }>("/analytics/overview").then(
      (res) => res.data,
    ),
};
