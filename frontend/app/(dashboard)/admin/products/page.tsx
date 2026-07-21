import { AdminPageHeader } from "../_components/AdminPageHeader";
import { ProductTable } from "../_components/ProductTable";

export default function ProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalogue and inventory."
        actionHref="/admin/products/new"
        actionLabel="Add new product"
      />
      <ProductTable />
    </>
  );
}
