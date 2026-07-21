import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { CustomerForm } from "../../_components/CustomerForm";
export default function NewCustomerPage() {
  return (
    <>
      <AdminPageHeader
        title="Add customer"
        description="Create a customer profile with contact and address information."
      />
      <CustomerForm />
    </>
  );
}
