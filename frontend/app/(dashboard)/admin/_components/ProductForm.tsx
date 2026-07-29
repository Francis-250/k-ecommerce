"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { CatalogProduct } from "@/features/storefront/shop/catalog-data";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5";
const labelClass = "block text-sm font-medium text-slate-700";

type VariantRow = {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity: string;
};

export function ProductForm({ product }: { product?: CatalogProduct }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [trackInventory, setTrackInventory] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [variants, setVariants] = useState<VariantRow[]>([]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) router.push("/admin/products");
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [router, saving]);

  function chooseImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG, or WebP image.");
      return;
    }
    setImageUrl(URL.createObjectURL(file));
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        sku: "",
        price: "",
        quantity: "0",
      },
    ]);
  }

  function updateVariant(
    id: number,
    field: keyof Omit<VariantRow, "id">,
    value: string,
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant,
      ),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
    }, 450);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-drawer-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          router.push("/admin/products");
        }
      }}
    >
      <section className="flex h-dvh w-full max-w-[1100px] flex-col bg-[#f7f7f5] shadow-2xl">
        <header className="z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => router.push("/admin/products")}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:opacity-50"
              aria-label="Close product form"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-slate-950 text-white">
                  <Package size={15} />
                </span>
                <h1
                  id="product-drawer-title"
                  className="truncate text-lg font-semibold text-slate-950"
                >
                  {product ? "Edit product" : "Create product"}
                </h1>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {product
                  ? `Editing ${product.name}`
                  : "Add a new item to your online catalog"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => router.push("/admin/products")}
            className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950 sm:hidden"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        <form
          id="product-form"
          onSubmit={submit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto grid max-w-[1040px] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px]">
            <main className="space-y-6">
              <ProductSection number="01" title="Product identity">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Product name" className="sm:col-span-2">
                    <input
                      name="name"
                      required
                      defaultValue={product?.name}
                      className={inputClass}
                      placeholder="e.g. Handwoven cotton dress"
                      autoFocus
                    />
                  </Field>
                  <Field label="SKU">
                    <input
                      name="sku"
                      required
                      defaultValue={product ? `SKU-00${product.id}` : ""}
                      className={inputClass}
                      placeholder="IRAS-001"
                    />
                  </Field>
                  <Field label="Barcode" optional>
                    <input
                      name="barcode"
                      className={inputClass}
                      placeholder="UPC, EAN, or ISBN"
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    name="description"
                    required
                    defaultValue={
                      product
                        ? `${product.name} is designed for comfort, quality, and effortless styling.`
                        : ""
                    }
                    className={`${inputClass} h-32 resize-y py-3 leading-6`}
                    placeholder="Describe the materials, fit, construction, and styling details."
                  />
                </Field>
              </ProductSection>

              <ProductSection number="02" title="Product media">
                <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Product preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-slate-400">
                        <ImagePlus size={32} strokeWidth={1.5} />
                      </span>
                    )}
                    <span className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 opacity-0 shadow-sm transition group-hover:opacity-100">
                      Replace cover
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center transition hover:border-slate-500 hover:bg-slate-50"
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-600">
                      <ImagePlus size={20} />
                    </span>
                    <strong className="mt-3 text-sm font-semibold text-slate-800">
                      Add product photography
                    </strong>
                    <span className="mt-1 text-xs leading-5 text-slate-500">
                      JPG, PNG, or WebP. Use square images for consistent product
                      cards.
                    </span>
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => chooseImage(event.target.files?.[0])}
                    className="sr-only"
                  />
                </div>
              </ProductSection>

              <ProductSection number="03" title="Pricing and stock">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Selling price">
                    <MoneyInput
                      name="price"
                      required
                      defaultValue={product?.price}
                    />
                  </Field>
                  <Field label="Compare-at price" optional>
                    <MoneyInput name="compareAtPrice" />
                  </Field>
                  <Field label="Cost per item" optional>
                    <MoneyInput name="costPrice" />
                  </Field>
                </div>
                <div className="flex items-center justify-between gap-5 rounded-xl bg-slate-950 px-5 py-4 text-white">
                  <div>
                    <p className="text-sm font-semibold">Inventory tracking</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Keep stock quantities updated after every sale.
                    </p>
                  </div>
                  <Switch
                    checked={trackInventory}
                    onChange={setTrackInventory}
                    label="Track inventory"
                  />
                </div>
                {trackInventory && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Available quantity">
                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Low-stock alert">
                      <input
                        name="reorderPoint"
                        type="number"
                        min="0"
                        defaultValue="5"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}
              </ProductSection>

              <ProductSection
                number="04"
                title="Variants"
                action={
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-500"
                  >
                    <Plus size={14} /> Add variant
                  </button>
                }
              >
                {variants.length === 0 ? (
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-left hover:border-slate-500"
                  >
                    <span>
                      <strong className="block text-sm text-slate-800">
                        Does this product have sizes or colors?
                      </strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Add variants with their own SKU, price, and quantity.
                      </span>
                    </span>
                    <Plus size={19} className="shrink-0 text-slate-500" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="grid items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_.8fr_.7fr_auto]"
                      >
                        <MiniField label="Variant">
                          <input
                            value={variant.name}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "name",
                                event.target.value,
                              )
                            }
                            className={inputClass}
                            placeholder="Black / Medium"
                          />
                        </MiniField>
                        <MiniField label="SKU">
                          <input
                            value={variant.sku}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "sku",
                                event.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </MiniField>
                        <MiniField label="Price">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "price",
                                event.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </MiniField>
                        <MiniField label="Qty">
                          <input
                            type="number"
                            min="0"
                            value={variant.quantity}
                            onChange={(event) =>
                              updateVariant(
                                variant.id,
                                "quantity",
                                event.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </MiniField>
                        <button
                          type="button"
                          onClick={() =>
                            setVariants((current) =>
                              current.filter((item) => item.id !== variant.id),
                            )
                          }
                          className="mb-0.5 grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove variant"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ProductSection>
            </main>

            <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Publishing
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Control storefront visibility.
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  <Field label="Product status">
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400"
                      />
                    </div>
                  </Field>
                  <SwitchRow
                    title="Featured product"
                    description="Show in curated homepage sections."
                    checked={featured}
                    onChange={setFeatured}
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Organization
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  <Field label="Category">
                    <select
                      name="category"
                      defaultValue={product?.category ?? "Dresses"}
                      className={`${inputClass} appearance-none`}
                    >
                      {["Accessories", "Dresses", "Tops", "Handbags"].map(
                        (item) => (
                          <option key={item}>{item}</option>
                        ),
                      )}
                    </select>
                  </Field>
                  <Field label="Brand">
                    <select
                      name="brand"
                      className={`${inputClass} appearance-none`}
                    >
                      <option>I-RAS STYLES</option>
                      <option>Independent designer</option>
                    </select>
                  </Field>
                  <Field label="Audience">
                    <select
                      name="audience"
                      defaultValue={product?.audience ?? "Women"}
                      className={`${inputClass} appearance-none`}
                    >
                      {["Women", "Men", "Unisex", "Kids"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tags" optional>
                    <input
                      name="tags"
                      className={inputClass}
                      placeholder="new, occasion, cotton"
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Before publishing
                </p>
                <ul className="mt-3 space-y-2 text-xs text-amber-900">
                  {[
                    "Add at least one clear product image",
                    "Confirm price and available stock",
                    "Assign the correct category",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </form>

        <footer className="z-20 flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <p className="hidden text-xs text-slate-500 sm:block">
            Changes are saved only when you submit the form.
          </p>
          <div className="ml-auto flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => router.push("/admin/products")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving && <LoaderCircle className="animate-spin" size={16} />}
              {product ? "Save product" : "Create product"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function ProductSection({
  number,
  title,
  action,
  children,
}: {
  number: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-slate-400">
            {number}
          </span>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        </div>
        {action}
      </header>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  optional,
  className = "",
  children,
}: {
  label: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`${labelClass} ${className}`}>
      <span className="flex justify-between gap-3">
        {label}
        {optional && (
          <span className="text-xs font-normal text-slate-400">Optional</span>
        )}
      </span>
      {children}
    </label>
  );
}

function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      {children}
    </label>
  );
}

function MoneyInput({
  name,
  required,
  defaultValue,
}: {
  name: string;
  required?: boolean;
  defaultValue?: number;
}) {
  return (
    <div className="relative">
      <span className="absolute bottom-3 left-3.5 text-sm text-slate-500">$</span>
      <input
        name={name}
        required={required}
        type="number"
        min="0"
        step="0.01"
        defaultValue={defaultValue}
        className={`${inputClass} pl-8`}
        placeholder="0.00"
      />
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-white" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full transition ${
          checked ? "left-6 bg-slate-950" : "left-1 bg-white"
        }`}
      />
    </button>
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-slate-950" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
