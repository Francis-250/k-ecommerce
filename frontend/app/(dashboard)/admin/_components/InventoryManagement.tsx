"use client";
import Image from "next/image";
import { Download, History, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { catalogProducts } from "@/features/storefront/shop/catalog-data";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";
const startingStock = [24, 7, 18, 4, 30, 13, 9, 22];
export function InventoryManagement() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [stock, setStock] = useState(startingStock);
  const filtered = useMemo(
    () =>
      catalogProducts
        .map((product, index) => ({ ...product, index }))
        .filter((product) =>
          `${product.name} ${product.category} SKU-00${product.id}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [query],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  const update = (index: number, value: number) =>
    setStock((current) =>
      current.map((quantity, itemIndex) =>
        itemIndex === index ? Math.max(0, value) : quantity,
      ),
    );
  return (
    <>
      <header className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track available stock and adjust quantities by location.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option>Kigali warehouse</option>
            <option>Huye store</option>
          </select>
          <button
            onClick={() => toast.success("Inventory changes saved")}
            className="min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save changes
          </button>
        </div>
      </header>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Total units"
          value={stock.reduce((sum, value) => sum + value, 0).toString()}
        />
        <Metric
          label="Low stock products"
          value={stock
            .filter((value) => value > 0 && value < 10)
            .length.toString()}
        />
        <Metric
          label="Out of stock"
          value={stock.filter((value) => value === 0).length.toString()}
        />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex gap-2 border-b border-slate-200 p-4">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              placeholder="Search products or SKU"
            />
          </div>
          <button className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600">
            <History size={15} /> History
          </button>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500"
            aria-label="Export inventory"
          >
            <Download size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                {[
                  "Product",
                  "SKU",
                  "Unavailable",
                  "Committed",
                  "Available",
                  "On hand",
                  "Status",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((product) => {
                const quantity = stock[product.index];
                return (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          className="size-9 rounded-md border border-slate-200 object-cover"
                          src={product.image}
                          alt={product.name}
                          width={36}
                          height={36}
                        />
                        <span>
                          <strong className="block font-medium text-slate-800">
                            {product.name}
                          </strong>
                          <small className="text-slate-500">
                            {product.category}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      SKU-00{product.id}
                    </td>
                    <td className="px-4 py-3 text-slate-500">0</td>
                    <td className="px-4 py-3 text-slate-500">
                      {product.index % 3}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        aria-label={`Available stock for ${product.name}`}
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(event) =>
                          update(product.index, Number(event.target.value))
                        }
                        className="h-8 w-20 rounded-md border border-slate-200 bg-slate-50 px-2 outline-none focus:border-slate-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {quantity + (product.index % 3)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${quantity === 0 ? "bg-red-50 text-red-700" : quantity < 10 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {quantity === 0
                          ? "Out of stock"
                          : quantity < 10
                            ? "Low stock"
                            : "In stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>
    </>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
