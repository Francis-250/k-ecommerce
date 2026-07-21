import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { CouponForm } from "../../_components/CouponForm";
export default function NewCouponPage() {
  return (
    <>
      <AdminPageHeader
        title="Create discount"
        description="Configure the method, value, eligibility, usage limits, and active dates."
      />
      <CouponForm />
    </>
  );
}
