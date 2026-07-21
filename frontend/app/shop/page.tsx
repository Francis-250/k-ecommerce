import { ShopExperience } from "@/features/storefront/shop/ShopExperience";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const gender: "All" | "Women" | "Men" =
    params.gender === "Women" || params.gender === "Men"
      ? params.gender
      : "All";
  type ShopCategory = "All" | "Accessories" | "Dresses" | "Tops" | "Handbags";
  const categories: ShopCategory[] = [
    "Accessories",
    "Dresses",
    "Tops",
    "Handbags",
  ];
  const category: ShopCategory = categories.includes(
    params.category as ShopCategory,
  )
    ? (params.category as ShopCategory)
    : "All";
  const query = params.q?.trim() ?? "";
  return (
    <ShopExperience
      key={`${gender}-${category}-${query}`}
      initialGender={gender}
      initialCategory={category}
      query={query}
    />
  );
}
