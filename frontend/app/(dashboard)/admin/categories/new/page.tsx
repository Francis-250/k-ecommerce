import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { CategoryForm } from "../../_components/CategoryForm";
export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader
        title="Add category"
        description="Create a manual category or define automatic product rules."
      />
      <CategoryForm />
    </>
  );
}
