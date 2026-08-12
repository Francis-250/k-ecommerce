import { catalogProducts } from "@/features/storefront/shop/catalog-data";

export const products = catalogProducts.map((product) => ({
  ...product,
  price: `$${product.price.toFixed(2)}`,
}));
