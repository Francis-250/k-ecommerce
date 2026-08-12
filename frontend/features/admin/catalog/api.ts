import { getAuthToken } from "@/features/auth/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export class CatalogApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CatalogApiError";
  }
}

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  country: string | null;
  isActive: boolean;
};

export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
};

export type BrandInput = Pick<
  Brand,
  "name" | "slug" | "description" | "country" | "logoUrl" | "isActive"
>;

export type CategoryInput = Pick<
  Category,
  "name" | "slug" | "description" | "parentId" | "isActive" | "sortOrder"
>;

export type Coupon = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y";
  status: "DRAFT" | "ACTIVE" | "DISABLED" | "EXPIRED";
  value: string | null;
  currency: string;
  minimumSubtotal: string | null;
  minimumQuantity: number | null;
  maximumDiscount: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  isAutomatic: boolean;
  startsAt: string | null;
  endsAt: string | null;
  _count: { redemptions: number };
};

export type CouponInput = {
  code: string;
  name: string;
  description: string | null;
  type: Coupon["type"];
  status: Coupon["status"];
  value: number | null;
  currency: "USD";
  minimumSubtotal: number | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  isAutomatic: boolean;
  startsAt: string | null;
  endsAt: string | null;
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
    throw new CatalogApiError(
      fieldMessage ?? body.message ?? "The request could not be completed.",
      response.status,
    );
  }
  return body;
}

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  audience: "WOMEN" | "MEN" | "UNISEX" | "KIDS";
  isFeatured: boolean;
  publishedAt: string | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  images: Array<{ id: string; url: string; altText: string | null }>;
  variants?: Array<{
    id: string;
    sku: string;
    name: string | null;
    price: string | null;
    inventory: {
      id: string;
      quantity: number;
      reserved: number;
      reorderPoint: number;
      continueSelling: boolean;
      location: string | null;
    } | null;
  }>;
  createdAt: string;
};

export type InventoryMovementInput = {
  productId?: string;
  variantId?: string;
  type:
    | "STOCK_IN"
    | "STOCK_OUT"
    | "SALE"
    | "RETURN"
    | "CORRECTION"
    | "RESERVATION"
    | "RESERVATION_RELEASE";
  quantity: number;
  note?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
};

export type InventoryAlert = {
  id: string;
  productId?: string;
  variantId?: string;
  couponId?: string;
  orderId?: string;
  title: string;
  productName?: string;
  sku?: string;
  category?: string;
  quantity?: number;
  reorderPoint?: number;
  type:
    | "OUT_OF_STOCK"
    | "LOW_STOCK"
    | "FAILED_PAYMENT"
    | "NEW_ORDER"
    | "STAFF_ACTION"
    | "EXPIRED_COUPON";
  message: string;
  link: string;
  read?: boolean;
  updatedAt: string;
};

export const catalogApi = {
  getInventoryAlerts: () =>
    request<{
      success: boolean;
      alerts: InventoryAlert[];
      count: number;
      lastChecked?: string;
    }>("/inventory/alerts"),
  markAlertsAsRead: () =>
    request<{ success: boolean; message: string }>("/inventory/alerts/read", {
      method: "POST",
    }),
  recordInventoryMovement: (input: InventoryMovementInput) =>
    request<{ success: boolean; inventory: unknown; movement: unknown }>(
      "/inventory-movements",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    ),
  listProducts: () =>
    request<{
      data: ApiProduct[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>("/products?admin=true&limit=100").then((body) => body.data),
  createProduct: (input: Record<string, unknown>) =>
    request<{ product: ApiProduct }>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((body) => body.product),
  updateProduct: (id: string, input: Record<string, unknown>) =>
    request<{ product: ApiProduct }>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((body) => body.product),
  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  listBrands: () =>
    request<{ brands: Brand[] }>("/brands?admin=true").then(
      (body) => body.brands,
    ),
  createBrand: (input: BrandInput) =>
    request<{ brand: Brand }>("/brands", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((body) => body.brand),
  updateBrand: (id: string, input: BrandInput) =>
    request<{ brand: Brand }>(`/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((body) => body.brand),
  deleteBrand: (id: string) =>
    request<void>(`/brands/${id}`, { method: "DELETE" }),
  listCategories: () =>
    request<{ categories: Category[] }>("/categories?admin=true").then(
      (body) => body.categories,
    ),
  createCategory: (input: CategoryInput) =>
    request<{ category: Category }>("/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((body) => body.category),
  updateCategory: (id: string, input: CategoryInput) =>
    request<{ category: Category }>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((body) => body.category),
  deleteCategory: (id: string) =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
  listCoupons: () =>
    request<{
      data: Coupon[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>("/coupons?limit=100").then((body) => body.data),
  createCoupon: (input: CouponInput) =>
    request<{ coupon: Coupon }>("/coupons", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((body) => body.coupon),
  updateCoupon: (id: string, input: CouponInput) =>
    request<{ coupon: Coupon }>(`/coupons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((body) => body.coupon),
  disableCoupon: (id: string) =>
    request<void>(`/coupons/${id}`, { method: "DELETE" }),
};

function fileToDataUri(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the image."));
    reader.readAsDataURL(file);
  });
}

export async function uploadBrandLogo(file: File) {
  const dataUri = await fileToDataUri(file);
  return request<{ image: { url: string } }>("/media/images", {
    method: "POST",
    body: JSON.stringify({
      dataUri,
      folder: "brands",
      altText: file.name,
    }),
  }).then((body) => body.image.url);
}

export async function uploadProductImage(file: File) {
  const dataUri = await fileToDataUri(file);
  return request<{ image: { url: string } }>("/media/images", {
    method: "POST",
    body: JSON.stringify({
      dataUri,
      folder: "products",
      altText: file.name,
    }),
  }).then((body) => body.image.url);
}
