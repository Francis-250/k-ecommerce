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
  { id: 1, slug: "aliquam-lobortis", name: "Curabitur sodales", price: 50, category: "Tops", audience: "Women", image: "/coron/assets/img/product/product1.png" },
  { id: 2, slug: "condimentum-posuere", name: "Quisque ornare dui", price: 40, category: "Accessories", audience: "Men", image: "/coron/assets/img/product/product2.png" },
  { id: 3, slug: "donec-eu-furniture", name: "Donec non est", price: 60, category: "Dresses", audience: "Women", image: "/coron/assets/img/product/product3.png" },
  { id: 4, slug: "aliquam-lobortis", name: "Etiam gravida", price: 55, category: "Tops", audience: "Men", image: "/coron/assets/img/product/product4.png" },
  { id: 5, slug: "printed-summer-dress", name: "Printed Summer", price: 45, category: "Dresses", audience: "Women", image: "/coron/assets/img/product/product5.png" },
  { id: 6, slug: "donec-eu-furniture", name: "Faded Short Sleeve", price: 70, category: "Tops", audience: "Men", image: "/coron/assets/img/product/product6.png" },
  { id: 7, slug: "condimentum-posuere", name: "Blouse Collection", price: 38, category: "Accessories", audience: "Women", image: "/coron/assets/img/product/product7.png" },
  { id: 8, slug: "printed-summer-dress", name: "Fashion Handbag", price: 85, category: "Handbags", audience: "Women", image: "/coron/assets/img/product/product8.png" },
];
