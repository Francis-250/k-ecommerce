"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { catalogProducts } from "@/features/storefront/shop/catalog-data";

const PAGE_SIZE = 5;
const STATUS_OPTIONS = ["Active", "Draft"] as const;

export function ProductTable() {
  const [products, setProducts] = useState(catalogProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );
  const audiences = useMemo(
    () => Array.from(new Set(products.map((p) => p.audience))).sort(),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery = [product.name, product.category, product.audience]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory =
          category === "all" || product.category === category;
        const matchesAudience =
          audience === "all" || product.audience === audience;
        const matchesStatus = status === "all" || status === "Active";
        return (
          matchesQuery && matchesCategory && matchesAudience && matchesStatus
        );
      }),
    [products, query, category, audience, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const remove = (id: number, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    setProducts((items) => items.filter((item) => item.id !== id));
    toast.success(`${name} deleted`);
  };

  const hasFilters =
    query !== "" ||
    category !== "all" ||
    audience !== "all" ||
    status !== "all";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setAudience("all");
    setStatus("all");
    setPage(1);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              placeholder="Search products"
            />
          </div>
          <p className="text-sm text-slate-500">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <SlidersHorizontal size={14} strokeWidth={1.75} />
            Filters
          </span>
          <FilterSelect
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            label="Category"
            options={categories}
          />
          <FilterSelect
            value={audience}
            onChange={(value) => {
              setAudience(value);
              setPage(1);
            }}
            label="Audience"
            options={audiences}
          />
          <FilterSelect
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            label="Status"
            options={[...STATUS_OPTIONS]}
          />
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={13} strokeWidth={2} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              {[
                "Product",
                "Category",
                "Audience",
                "Price",
                "Stock",
                "Status",
                "Actions",
              ].map((title) => (
                <th className="px-4 py-3 font-medium" key={title}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((product, index) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      className="size-10 rounded-md border border-slate-200 object-cover"
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="font-medium text-slate-800">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        SKU-00{product.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                <td className="px-4 py-3 text-slate-600">{product.audience}</td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-600">{12 + index * 4}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ActionLink
                      href={`/admin/products/${product.id}`}
                      label="View"
                    >
                      <Eye size={16} strokeWidth={1.75} />
                    </ActionLink>
                    <ActionLink
                      href={`/admin/products/${product.id}/edit`}
                      label="Edit"
                    >
                      <Pencil size={16} strokeWidth={1.75} />
                    </ActionLink>
                    <button
                      onClick={() => remove(product.id, product.name)}
                      className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No products match your search.
          </p>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} strokeWidth={1.75} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
              )
              .reduce<number[]>((acc, p) => {
                if (acc.length && p - acc[acc.length - 1] > 1) acc.push(-1);
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === -1 ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="grid size-8 place-items-center text-xs text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`grid size-8 place-items-center rounded-md text-xs font-medium ${
                      p === safePage
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 rounded-md border px-2.5 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
        value === "all"
          ? "border-slate-200 text-slate-500"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <option value="all">{label}: All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function ActionLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </Link>
  );
}
