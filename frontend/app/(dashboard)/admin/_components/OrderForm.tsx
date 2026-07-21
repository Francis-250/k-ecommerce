"use client";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
export function OrderForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Draft order created");
      }}
      className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_320px]"
    >
      <div className="space-y-5">
        <Section title="Products">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Search products to add"
            />
          </div>
          <div className="mt-4 flex min-h-32 flex-col items-center justify-center border border-dashed border-slate-300 text-slate-500">
            <ShoppingBag size={24} />
            <p className="mt-2 text-sm">No products added</p>
          </div>
        </Section>
        <Section title="Payment">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount" placeholder="0.00" />
            <Field label="Shipping" placeholder="0.00" />
            <Field label="Tax" placeholder="0.00" />
            <Field label="Currency" placeholder="USD" />
          </div>
        </Section>
        <Section title="Notes">
          <textarea
            className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-500"
            rows={4}
            placeholder="Add an internal note"
          />
        </Section>
      </div>
      <div className="space-y-5">
        <Section title="Customer">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Search customers"
            />
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-emerald-700"
          >
            + Create new customer
          </button>
        </Section>
        <Section title="Order summary">
          <dl className="space-y-3 text-sm">
            <Row label="Subtotal" value="$0.00" />
            <Row label="Shipping" value="$0.00" />
            <Row label="Tax" value="$0.00" />
            <div className="border-t border-slate-200 pt-3">
              <Row label="Total" value="$0.00" strong />
            </div>
          </dl>
        </Section>
        <button className="h-10 w-full rounded-md bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700">
          Create draft order
        </button>
      </div>
    </form>
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
      <h2 className="mb-4 text-base font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500"
        placeholder={placeholder}
      />
    </label>
  );
}
function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${strong ? "font-semibold text-slate-900" : "text-slate-600"}`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
