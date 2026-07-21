import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { OrderForm } from "../../_components/OrderForm";
export default function NewOrderPage() {
  return (
    <>
      <AdminPageHeader
        title="Create order"
        description="Build a draft order, add a customer, and record payment."
      />
      <OrderForm />
    </>
  );
}
