import { notFound } from "next/navigation";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
const records = [
  {
    id: "127381",
    customer: "Alex Almond",
    email: "alex@example.com",
    total: "$240.00",
    payment: "Paid",
    fulfillment: "Unfulfilled",
  },
  {
    id: "127382",
    customer: "Anitra Sen",
    email: "anitra@example.com",
    total: "$220.00",
    payment: "Paid",
    fulfillment: "Fulfilled",
  },
  {
    id: "127383",
    customer: "John Doe",
    email: "john@example.com",
    total: "$180.00",
    payment: "Pending",
    fulfillment: "Processing",
  },
];
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = records.find((item) => item.id === id);
  if (!order) notFound();
  return (
    <>
      <AdminPageHeader
        title={`Order #${order.id}`}
        description="Review payment, fulfillment, customer, and item information."
      />
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <Section title="Items">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
              <div>
                <strong className="block font-medium text-slate-800">
                  Printed Summer Dress
                </strong>
                <span className="text-slate-500">SKU-005 × 2</span>
              </div>
              <span className="font-medium">$90.00</span>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <strong>{order.total}</strong>
            </div>
          </Section>
          <Section title="Payment">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Payment status</span>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                {order.payment}
              </span>
            </div>
          </Section>
          <Section title="Fulfillment">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Fulfillment status</span>
              <span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                {order.fulfillment}
              </span>
            </div>
          </Section>
        </div>
        <div className="space-y-5">
          <Section title="Customer">
            <p className="font-medium text-slate-800">{order.customer}</p>
            <p className="mt-1 text-sm text-slate-500">{order.email}</p>
          </Section>
          <Section title="Shipping address">
            <p className="text-sm leading-6 text-slate-600">
              24 KN Street
              <br />
              Kigali, Rwanda
            </p>
          </Section>
          <Section title="Order summary">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total</dt>
                <dd className="font-semibold">{order.total}</dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}
