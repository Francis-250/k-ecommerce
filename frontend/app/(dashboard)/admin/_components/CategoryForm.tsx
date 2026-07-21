"use client";
import { toast } from "sonner";
export function CategoryForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Category created");
      }}
      className="grid gap-5 xl:grid-cols-[2fr_1fr]"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-800">Category details</h2>
        <Field label="Title" />
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Description
          <textarea
            rows={5}
            className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-normal outline-none focus:border-emerald-500"
          />
        </label>
        <Field label="URL slug" />
      </section>
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Collection type</h2>
          <label className="flex gap-3 text-sm">
            <input defaultChecked name="type" type="radio" />
            Manual
          </label>
          <label className="mt-3 flex gap-3 text-sm">
            <input name="type" type="radio" />
            Automatic rules
          </label>
        </section>
        <button className="h-10 w-full rounded-md bg-emerald-600 text-sm font-medium text-white">
          Save category
        </button>
      </div>
    </form>
  );
}
function Field({ label }: { label: string }) {
  return (
    <label className="mt-4 block text-sm font-medium text-slate-700 first:mt-0">
      {label}
      <input
        required
        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500"
      />
    </label>
  );
}
