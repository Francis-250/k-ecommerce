export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  price: string;
  currency: string;
  category: { id: string; name: string; slug: string } | null;
  audience: "WOMEN" | "MEN" | "UNISEX" | "KIDS";
  images: Array<{ id: string; url: string; altText: string | null }>;
  isFeatured: boolean;
  createdAt: string;
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

export type StorefrontBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

type ProductsResponse = {
  success: boolean;
  data: StorefrontProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type CategoriesResponse = {
  success: boolean;
  categories: StorefrontCategory[];
};

type BrandsResponse = {
  success: boolean;
  brands: StorefrontBrand[];
};

export type StorefrontCatalog = {
  products: ProductsResponse;
  categories: StorefrontCategory[];
  brands: StorefrontBrand[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to load the store catalog");
  }

  return body;
}

export async function getStorefrontCatalog(): Promise<StorefrontCatalog> {
  const [products, categories, brands] = await Promise.all([
    get<ProductsResponse>("/products?limit=100"),
    get<CategoriesResponse>("/categories"),
    get<BrandsResponse>("/brands"),
  ]);

  return {
    products,
    categories: categories.categories,
    brands: brands.brands,
  };
}
