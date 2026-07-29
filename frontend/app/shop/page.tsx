import { ShopExperience } from "@/features/storefront/shop/ShopExperience";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const gender =
    params.gender === "Women" ||
    params.gender === "Men" ||
    params.gender === "Unisex" ||
    params.gender === "Kids"
      ? params.gender
      : "All";
  const category = params.category?.trim() || "All";
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
