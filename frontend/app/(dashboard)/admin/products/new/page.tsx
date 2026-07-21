import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { ProductForm } from "../../_components/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader
        title="Add new product"
        description="Create a product and publish it to the Coron storefront."
      />
      <ProductForm />
    </>
  );
}
