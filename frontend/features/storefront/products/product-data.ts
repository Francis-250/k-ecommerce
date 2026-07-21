import type { Product } from "./types";

const image = (file: string, alt: string) => ({
  src: `/storefront/assets/img/product/${file}`,
  alt,
});

export const products: Product[] = [
  {
    slug: "printed-summer-dress",
    name: "Indigo Ankara Midi Dress",
    category: "Dresses",
    description:
      "A vibrant Ankara midi dress with a sculpted waist, flowing skirt and confident contemporary silhouette.",
    longDescription:
      "Cut from richly patterned African wax cotton, this statement dress balances traditional textile craft with modern tailoring. The tie waist and full skirt make it equally suited to celebrations and elevated everyday wear.",
    price: 118,
    previousPrice: 130,
    rating: 5,
    reviewCount: 12,
    stock: 29,
    sku: "IRAS-DRE-001",
    badge: "Sale",
    images: [
      image("product13.png", "Indigo Ankara midi dress, front view"),
      image("product7.png", "Coordinating African wax-print headwrap"),
      image("product4.png", "Coordinating African beaded jewelry"),
    ],
    options: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "Teal", "Coral"] },
    ],
    details: {
      Composition: "African wax cotton",
      Style: "Contemporary heritage",
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
    name: "Heritage Ankara Shirt",
    category: "Men's collection",
    description:
      "A refined everyday piece with modern lines and lasting comfort.",
    longDescription:
      "A signature I-RAS STYLES wardrobe staple designed with a clean profile, soft-touch fabric and considered details.",
    price: 80,
    rating: 4,
    reviewCount: 8,
    stock: 18,
    sku: "IRAS-MEN-002",
    badge: "New",
    images: [
      image("product5.png", "Heritage Ankara shirt on model"),
      image("product8.png", "Mudcloth leather backpack"),
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
    name: "Emerald Ankara Handbag",
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
    sku: "IRAS-BAG-003",
    badge: "Sale",
    images: [
      image("product2.png", "Emerald Ankara handbag"),
      image("product4.png", "African beaded jewelry set"),
    ],
    options: [{ name: "Color", values: ["Coral", "Black", "Teal"] }],
    details: {
      Material: "Wax cotton and leather",
      Style: "Artisan structured",
      Care: "Wipe clean",
    },
    relatedSlugs: ["printed-summer-dress", "aliquam-lobortis"],
  },
  {
    slug: "donec-eu-furniture",
    name: "Kente Panel Sneakers",
    category: "Footwear",
    description:
      "A bold I-RAS STYLES favorite balancing contemporary detail with a relaxed feel.",
    longDescription:
      "Made in a small production run, this design combines a distinctive silhouette with practical comfort.",
    price: 65,
    rating: 5,
    reviewCount: 10,
    stock: 9,
    sku: "IRAS-SHO-004",
    images: [
      image("product3.png", "Kente panel sneakers"),
      image("product6.png", "African print leather sandals"),
    ],
    options: [{ name: "Size", values: ["M", "L", "XL"] }],
    details: { Composition: "Leather and woven textile", Style: "Modern heritage", Fit: "Regular" },
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
