import { notFound } from "next/navigation";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
const customers = [
  {
    id: "1",
    name: "Bella Chao",
    email: "bella@example.com",
    orders: "12",
    spent: "$1,420.00",
  },
  {
    id: "2",
    name: "Alex Almond",
    email: "alex@example.com",
    orders: "8",
    spent: "$940.00",
  },
  {
    id: "3",
    name: "Anitra Sen",
    email: "anitra@example.com",
    orders: "5",
    spent: "$670.00",
  },
  {
    id: "4",
    name: "John Doe",
    email: "john@example.com",
    orders: "3",
    spent: "$270.00",
  },
];
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id);
  if (!customer) notFound();
  return (
    <>
      <AdminPageHeader
        title={customer.name}
        description="Customer profile, order history, contact details, and marketing preferences."
      />
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Recent orders</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="py-3 font-medium">Order</th>
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 font-medium">#127381</td>
                <td className="py-4 text-slate-500">21 Jul 2026</td>
                <td className="py-4">
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    Paid
                  </span>
                </td>
                <td className="py-4 text-right font-medium">$240.00</td>
              </tr>
            </tbody>
          </table>
        </section>
        <div className="space-y-5">
          <Section title="Customer">
            <p className="font-medium text-slate-800">{customer.name}</p>
            <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
            <p className="mt-1 text-sm text-slate-500">+250 788 000 000</p>
          </Section>
          <section className="grid grid-cols-2 gap-3">
            <Stat label="Orders" value={customer.orders} />
            <Stat label="Amount spent" value={customer.spent} />
          </section>
          <Section title="Marketing">
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
              Email subscribed
            </span>
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
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}
