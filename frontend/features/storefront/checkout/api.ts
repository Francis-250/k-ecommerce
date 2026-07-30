export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  company?: string | null;
  phone: string;
  countryCode: string;
  country: string;
  state: string;
  city: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
};

export type CreateOrderInput = {
  email: string;
  phone?: string | null;
  customerNote?: string | null;
  couponCode?: string | null;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  items: Array<{
    slug: string;
    variantId?: string | null;
    quantity: number;
    options?: Record<string, string>;
  }>;
};

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  total: string;
  currency: string;
};

type ApiResponse<T> = T & {
  success: boolean;
  message?: string;
};

import { getAuthToken } from "@/features/auth/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    const error = new Error(
      body.message ?? "Checkout request failed",
    ) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return body;
}

export async function createOrder(input: CreateOrderInput) {
  const response = await request<{ order: CreatedOrder }>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.order;
}

export function createCheckoutIntent(orderId: string) {
  return request<{
    orderId: string;
    amount: number;
    clientSecret: string;
    publishableKey: string;
  }>("/payments/checkout-intent", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export function confirmCheckoutPayment(
  orderId: string,
  paymentIntentId: string,
) {
  return request<{
    orderId: string;
    orderNumber: string;
    paymentStatus: "SUCCEEDED" | "PROCESSING" | "FAILED";
  }>("/payments/checkout-confirm", {
    method: "POST",
    body: JSON.stringify({ orderId, paymentIntentId }),
  });
}
