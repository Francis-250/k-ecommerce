"use client";
import { toast } from "sonner";
export function CustomerForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Customer created");
      }}
      className="grid gap-5 xl:grid-cols-[2fr_1fr]"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-800">
          Customer information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" />
          <Field label="Last name" />
          <Field label="Email" type="email" />
          <Field label="Phone" type="tel" />
          <Field label="Address" wide />
          <Field label="City" />
          <Field label="Country" />
          <Field label="Postal code" />
        </div>
      </section>
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Preferences</h2>
          <label className="flex gap-3 text-sm text-slate-700">
            <input type="checkbox" className="accent-emerald-600" />
            Customer agreed to receive marketing emails
          </label>
          <label className="mt-4 flex gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              defaultChecked
              className="accent-emerald-600"
            />
            Collect tax for this customer
          </label>
        </section>
        <button className="h-10 w-full rounded-md bg-emerald-600 text-sm font-medium text-white">
          Save customer
        </button>
      </div>
    </form>
  );
}
function Field({
  label,
  type = "text",
  wide,
}: {
  label: string;
  type?: string;
  wide?: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label
      className={`text-sm font-medium text-slate-700 ${wide ? "sm:col-span-2" : ""}`}
      htmlFor={id}
    >
      {label}
      <input
        id={id}
        required
        type={type}
        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500"
      />
    </label>
  );
}
