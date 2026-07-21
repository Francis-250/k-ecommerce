export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  previousPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  badge?: "New" | "Sale";
  images: ProductImage[];
  options: ProductOption[];
  details: Record<string, string>;
  relatedSlugs: string[];
};
