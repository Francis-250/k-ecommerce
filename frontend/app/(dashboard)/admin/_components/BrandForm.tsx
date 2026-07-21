"use client";
import { Upload } from "lucide-react";
import { toast } from "sonner";
export function BrandForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Brand created");
      }}
      className="grid gap-5 xl:grid-cols-[2fr_1fr]"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-800">Brand information</h2>
        {["Brand name", "Handle", "Country", "Website"].map((label) => (
          <label
            key={label}
            className="mb-4 block text-sm font-medium text-slate-700"
          >
            {label}
            <input
              required={label !== "Website"}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500"
            />
          </label>
        ))}
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea
            rows={4}
            className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-normal outline-none focus:border-emerald-500"
          />
        </label>
      </section>
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Brand logo</h2>
          <label className="flex h-36 cursor-pointer flex-col items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500">
            <Upload size={23} />
            <span className="mt-2">Upload logo</span>
            <input type="file" className="sr-only" />
          </label>
        </section>
        <button className="h-10 w-full rounded-md bg-emerald-600 text-sm font-medium text-white">
          Save brand
        </button>
      </div>
    </form>
  );
}
