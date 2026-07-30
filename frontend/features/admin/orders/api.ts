import { getAuthToken } from "@/features/auth/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export class OrdersApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "OrdersApiError";
  }
}

export type ApiOrderItem = {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  sku: string | null;
  imageUrl: string | null;
  options: Record<string, string> | null;
  quantity: number;
  unitPrice: string | number;
  total: string | number;
};

export type ApiOrderAddress = {
  id: string;
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string;
  countryCode: string;
  country: string;
  state: string;
  city: string;
  line1: string;
  line2: string | null;
  postalCode: string;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  status:
    | "DRAFT"
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "COMPLETED"
    | "CANCELLED"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED"
    | "RETURNED";
  paymentStatus:
    | "REQUIRES_PAYMENT_METHOD"
    | "REQUIRES_CONFIRMATION"
    | "PROCESSING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED";
  fulfillmentStatus:
    | "UNFULFILLED"
    | "PROCESSING"
    | "PARTIALLY_FULFILLED"
    | "FULFILLED"
    | "RETURNED";
  currency: string;
  subtotal: string | number;
  discountTotal: string | number;
  shippingTotal: string | number;
  taxTotal: string | number;
  total: string | number;
  customerNote: string | null;
  adminNote: string | null;
  source: string;
  createdAt: string;
  items: ApiOrderItem[];
  addresses: ApiOrderAddress[];
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export type CreateOrderInput = {
  email: string;
  phone?: string | null;
  customerNote?: string | null;
  couponCode?: string | null;
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  source?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string | null;
    phone: string;
    countryCode?: string;
    country?: string;
    state: string;
    city: string;
    line1: string;
    line2?: string | null;
    postalCode: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string | null;
    phone: string;
    countryCode?: string;
    country?: string;
    state: string;
    city: string;
    line1: string;
    line2?: string | null;
    postalCode: string;
  };
  items: Array<{
    productId?: string;
    slug?: string;
    variantId?: string | null;
    quantity: number;
  }>;
};

export type UpdateOrderInput = {
  status?: ApiOrder["status"];
  paymentStatus?: ApiOrder["paymentStatus"];
  fulfillmentStatus?: ApiOrder["fulfillmentStatus"];
  adminNote?: string | null;
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
    throw new OrdersApiError(
      fieldMessage ?? body.message ?? "The order request failed.",
      response.status,
    );
  }
  return body;
}

export const ordersApi = {
  listOrders: (statusFilter?: string) => {
    const query =
      statusFilter && statusFilter !== "All"
        ? `?status=${encodeURIComponent(statusFilter)}&limit=100`
        : `?limit=100`;
    return request<{
      data: ApiOrder[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/orders${query}`).then((res) => res.data);
  },
  getOrder: (id: string) =>
    request<{ success: boolean; order: ApiOrder }>(`/orders/${id}`).then(
      (res) => res.order,
    ),
  createOrder: (input: CreateOrderInput) =>
    request<{ success: boolean; order: ApiOrder }>("/orders", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((res) => res.order),
  updateOrder: (id: string, input: UpdateOrderInput) =>
    request<{ success: boolean; order: ApiOrder }>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((res) => res.order),
  cancelOrder: (id: string) =>
    request<{ success: boolean; order: ApiOrder }>(`/orders/${id}/cancel`, {
      method: "POST",
    }).then((res) => res.order),
};
