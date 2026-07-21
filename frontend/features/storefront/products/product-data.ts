import type { Product } from "./types";

const image = (file: string, alt: string) => ({
  src: `/storefront/assets/img/product/${file}`,
  alt,
});

export const products: Product[] = [
  {
    slug: "printed-summer-dress",
    name: "Printed Summer Dress",
    category: "Dresses",
    description:
      "A light, elegant summer dress with a flattering silhouette and an easy all-day fit.",
    longDescription:
      "Designed for warm days and effortless occasions, this printed dress pairs a soft drape with careful tailoring. Its versatile shape moves easily from relaxed afternoons to evening plans.",
    price: 118,
    previousPrice: 130,
    rating: 5,
    reviewCount: 12,
    stock: 29,
    sku: "COR-PSD-001",
    badge: "Sale",
    images: [
      image("product13.png", "Printed summer dress, front view"),
      image("product14.jpg", "Printed summer dress, side view"),
      image("product15.jpg", "Printed summer dress fabric detail"),
    ],
    options: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "Teal", "Coral"] },
    ],
    details: {
      Composition: "Polyester blend",
      Style: "Feminine",
      Fit: "Regular",
      Care: "Machine wash at 30°C",
    },
    relatedSlugs: [
      "aliquam-lobortis",
      "condimentum-posuere",
      "donec-eu-furniture",
    ],
  },
  {
    slug: "aliquam-lobortis",
    name: "Aliquam Lobortis",
    category: "New collection",
    description:
      "A refined everyday piece with modern lines and lasting comfort.",
    longDescription:
      "A signature I-RAS STYLES wardrobe staple designed with a clean profile, soft-touch fabric and considered details.",
    price: 80,
    rating: 4,
    reviewCount: 8,
    stock: 18,
    sku: "COR-ALI-002",
    badge: "New",
    images: [
      image("product1.png", "Aliquam Lobortis product view"),
      image("product6.png", "Aliquam Lobortis alternate view"),
    ],
    options: [
      { name: "Size", values: ["S", "M", "L"] },
      { name: "Color", values: ["Teal", "Black"] },
    ],
    details: {
      Composition: "Cotton blend",
      Style: "Contemporary",
      Fit: "Regular",
    },
    relatedSlugs: ["printed-summer-dress", "condimentum-posuere"],
  },
  {
    slug: "condimentum-posuere",
    name: "Condimentum Posuere",
    category: "Accessories",
    description:
      "A versatile finishing piece made for polished everyday styling.",
    longDescription:
      "Thoughtful materials and a timeless finish make this accessory a dependable addition to any collection.",
    price: 60,
    previousPrice: 72,
    rating: 4,
    reviewCount: 6,
    stock: 14,
    sku: "COR-CON-003",
    badge: "Sale",
    images: [
      image("product2.png", "Condimentum Posuere product view"),
      image("product7.png", "Condimentum Posuere alternate view"),
    ],
    options: [{ name: "Color", values: ["Coral", "Black", "Teal"] }],
    details: {
      Material: "Premium synthetic",
      Style: "Classic",
      Care: "Wipe clean",
    },
    relatedSlugs: ["printed-summer-dress", "aliquam-lobortis"],
  },
  {
    slug: "donec-eu-furniture",
    name: "Donec Eu Furniture",
    category: "Featured",
    description:
      "A bold I-RAS STYLES favorite balancing contemporary detail with a relaxed feel.",
    longDescription:
      "Made in a small production run, this design combines a distinctive silhouette with practical comfort.",
    price: 65,
    rating: 5,
    reviewCount: 10,
    stock: 9,
    sku: "COR-DON-004",
    images: [
      image("product3.png", "Donec Eu Furniture product view"),
      image("product8.png", "Donec Eu Furniture alternate view"),
    ],
    options: [{ name: "Size", values: ["M", "L", "XL"] }],
    details: { Composition: "Viscose blend", Style: "Modern", Fit: "Relaxed" },
    relatedSlugs: ["printed-summer-dress", "condimentum-posuere"],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product) {
  return product.relatedSlugs
    .map(getProduct)
    .filter((item): item is Product => Boolean(item));
}

export const formatPrice = (price: number) => `$${price.toFixed(2)}`;
