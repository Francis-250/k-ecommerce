export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: "Accessories" | "Dresses" | "Tops" | "Handbags";
  audience: "Women" | "Men";
  image: string;
};

export const catalogProducts: CatalogProduct[] = [
  {
    id: 1,
    slug: "indigo-ankara-midi-dress",
    name: "Indigo Ankara Midi Dress",
    price: 118,
    category: "Dresses",
    audience: "Women",
    image: "/storefront/assets/img/african-products/ankara-midi-dress.png",
  },
  {
    id: 2,
    slug: "emerald-ankara-handbag",
    name: "Emerald Ankara Handbag",
    price: 96,
    category: "Handbags",
    audience: "Women",
    image: "/storefront/assets/img/african-products/ankara-handbag.png",
  },
  {
    id: 3,
    slug: "kente-panel-sneakers",
    name: "Kente Panel Sneakers",
    price: 84,
    category: "Accessories",
    audience: "Men",
    image: "/storefront/assets/img/african-products/kente-sneakers.png",
  },
  {
    id: 4,
    slug: "maasai-beaded-jewelry-set",
    name: "Maasai Beaded Jewelry Set",
    price: 72,
    category: "Accessories",
    audience: "Women",
    image: "/storefront/assets/img/african-products/beaded-jewelry.png",
  },
  {
    id: 5,
    slug: "heritage-ankara-shirt",
    name: "Heritage Ankara Shirt",
    price: 78,
    category: "Tops",
    audience: "Men",
    image: "/storefront/assets/img/african-products/heritage-shirt.png",
  },
  {
    id: 6,
    slug: "indigo-print-leather-sandals",
    name: "Indigo Print Leather Sandals",
    price: 68,
    category: "Accessories",
    audience: "Women",
    image: "/storefront/assets/img/african-products/leather-sandals.png",
  },
  {
    id: 7,
    slug: "wax-print-headwrap-set",
    name: "Wax Print Headwrap Set",
    price: 48,
    category: "Accessories",
    audience: "Women",
    image: "/storefront/assets/img/african-products/wax-headwrap.png",
  },
  {
    id: 8,
    slug: "mudcloth-leather-backpack",
    name: "Mudcloth Leather Backpack",
    price: 124,
    category: "Handbags",
    audience: "Men",
    image: "/storefront/assets/img/african-products/mudcloth-backpack.png",
  },
];
