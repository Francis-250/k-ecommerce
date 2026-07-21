import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { BrandForm } from "../../_components/BrandForm";
export default function NewBrandPage() {
  return (
    <>
      <AdminPageHeader
        title="Add brand"
        description="Create a brand profile for products and storefront discovery."
      />
      <BrandForm />
    </>
  );
}
