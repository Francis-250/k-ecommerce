"use client";

import Link from "next/link";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { CatalogProduct } from "@/features/storefront/shop/catalog-data";

export function ProductForm({ product }: { product?: CatalogProduct }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
    }, 400);
  };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        {/* Main column */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Product name"
              name="name"
              defaultValue={product?.name}
              required
            />
            <Field
              label="SKU"
              name="sku"
              defaultValue={product ? `SKU-00${product.id}` : ""}
              required
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-slate-700"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={
                product
                  ? `${product.name} is designed for comfort, quality, and effortless everyday styling.`
                  : ""
              }
              className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="h-px bg-slate-100" />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Price"
              name="price"
              type="number"
              defaultValue={product?.price}
              prefix="$"
              required
            />
            <Field
              label="Compare price"
              name="comparePrice"
              type="number"
              prefix="$"
            />
            <Field
              label="Stock quantity"
              name="stock"
              type="number"
              defaultValue="20"
              required
            />
          </div>

          <div className="h-px bg-slate-100" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              name="category"
              defaultValue={product?.category}
              options={["Accessories", "Dresses", "Tops", "Handbags"]}
            />
            <Select
              label="Audience"
              name="audience"
              defaultValue={product?.audience}
              options={["Women", "Men"]}
            />
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6 xl:border-l xl:border-slate-100 xl:pl-8">
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Image</p>
            {preview ? (
              <div className="group relative overflow-hidden rounded-md border border-slate-200">
                <Image
                  src={preview}
                  alt="Product preview"
                  width={500}
                  height={500}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-slate-600 shadow hover:text-red-600"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 text-center hover:border-emerald-400">
                <ImagePlus
                  size={20}
                  strokeWidth={1.75}
                  className="text-slate-400"
                />
                <span className="text-xs font-medium text-slate-600">
                  Click to upload
                </span>
                <span className="text-[11px] text-slate-400">
                  PNG or JPG, up to 5MB
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={onFile}
                />
              </label>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          <Select label="Status" name="status" options={["Active", "Draft"]} />

          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              defaultChecked
              className="size-4 rounded border-slate-300 accent-emerald-600"
            />
            Feature this product
          </label>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 py-4 backdrop-blur">
        <Link
          href="/admin/products"
          className="flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </Link>
        <button
          disabled={saving}
          className="flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  prefix,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  prefix?: string;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-medium text-slate-700"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          min={type === "number" ? 0 : undefined}
          className={`h-9 w-full rounded-md border border-slate-200 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${prefix ? "pl-6 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-medium text-slate-700"
        htmlFor={name}
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? options[0]}
        className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
