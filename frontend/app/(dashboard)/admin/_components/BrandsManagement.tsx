"use client";
import { MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";
const brands = [
  {
    id: 1,
    initials: "CO",
    name: "I-RAS STYLES",
    handle: "iras-styles",
    products: 42,
    country: "Rwanda",
    status: "Active",
  },
  {
    id: 2,
    initials: "UE",
    name: "Urban Edit",
    handle: "urban-edit",
    products: 18,
    country: "France",
    status: "Active",
  },
  {
    id: 3,
    initials: "SF",
    name: "Studio Form",
    handle: "studio-form",
    products: 13,
    country: "Italy",
    status: "Active",
  },
  {
    id: 4,
    initials: "NR",
    name: "Norr Atelier",
    handle: "norr-atelier",
    products: 8,
    country: "Sweden",
    status: "Draft",
  },
];
export function BrandsManagement() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = brands.filter((brand) =>
    Object.values(brand).join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Manage product manufacturers, labels, and storefront brand pages."
        actionHref="/admin/brands/new"
        actionLabel="Add brand"
      />
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
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
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Search brands"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                {["Brand", "Handle", "Products", "Country", "Status", ""].map(
                  (heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                        {brand.initials}
                      </span>
                      <strong className="font-medium text-slate-800">
                        {brand.name}
                      </strong>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{brand.handle}</td>
                  <td className="px-4 py-3">{brand.products}</td>
                  <td className="px-4 py-3 text-slate-500">{brand.country}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${brand.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {brand.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                      aria-label={`Actions for ${brand.name}`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
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
