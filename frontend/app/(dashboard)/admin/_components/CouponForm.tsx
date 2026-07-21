"use client";
import { toast } from "sonner";
export function CouponForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Discount created");
      }}
      className="grid gap-5 xl:grid-cols-[2fr_1fr]"
    >
      <div className="space-y-5">
        <Section title="Discount method">
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice
              title="Discount code"
              description="Customers enter a code at checkout"
              checked
            />
            <Choice
              title="Automatic discount"
              description="Applied automatically when eligible"
            />
          </div>
        </Section>
        <Section title="Value">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Discount type"
              options={[
                "Percentage",
                "Fixed amount",
                "Free shipping",
                "Buy X get Y",
              ]}
            />
            <Field label="Discount value" type="number" />
          </div>
        </Section>
        <Section title="Customer eligibility">
          <Select
            label="Eligible customers"
            options={[
              "All customers",
              "Specific customer segments",
              "Specific customers",
            ]}
          />
        </Section>
        <Section title="Minimum requirements">
          <Select
            label="Requirement"
            options={[
              "No minimum requirements",
              "Minimum purchase amount",
              "Minimum quantity of items",
            ]}
          />
        </Section>
      </div>
      <div className="space-y-5">
        <Section title="Code">
          <Field label="Discount code" />
          <button
            type="button"
            className="mt-3 text-sm font-medium text-emerald-700"
          >
            Generate random code
          </button>
        </Section>
        <Section title="Usage limits">
          <label className="flex gap-3 text-sm">
            <input type="checkbox" />
            Limit number of times this discount can be used
          </label>
          <label className="mt-3 flex gap-3 text-sm">
            <input type="checkbox" />
            Limit to one use per customer
          </label>
        </Section>
        <Section title="Active dates">
          <Field label="Start date" type="date" />
          <div className="mt-4">
            <Field label="End date" type="date" />
          </div>
        </Section>
        <button className="h-10 w-full rounded-md bg-emerald-600 text-sm font-medium text-white">
          Save discount
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
      <h2 className="mb-4 font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}
function Choice({
  title,
  description,
  checked,
}: {
  title: string;
  description: string;
  checked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-md border border-slate-200 p-4">
      <input name="method" type="radio" defaultChecked={checked} />
      <span>
        <strong className="block text-sm font-medium text-slate-800">
          {title}
        </strong>
        <small className="text-slate-500">{description}</small>
      </span>
    </label>
  );
}
function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required
        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500"
        type={type}
      />
    </label>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
