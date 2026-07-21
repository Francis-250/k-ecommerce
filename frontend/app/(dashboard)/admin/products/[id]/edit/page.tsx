import { notFound } from "next/navigation";
import { AdminPageHeader } from "../../../_components/AdminPageHeader";
import { ProductForm } from "../../../_components/ProductForm";
import { catalogProducts } from "@/features/storefront/shop/catalog-data";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = catalogProducts.find((item) => item.id === Number(id));
  if (!product) notFound();
  return (
    <>
      <AdminPageHeader
        title="Edit product"
        description={`Update ${product.name} and save your changes.`}
      />
      <ProductForm product={product} />
    </>
  );
}
