import { catalogProducts } from "@/features/storefront/shop/catalog-data";

// Compatibility data for the shared homepage catalog presentation.
// Product ownership remains in the storefront shop feature.
export const products = catalogProducts.map((product) => ({
  ...product,
  price: `$${product.price.toFixed(2)}`,
}));
