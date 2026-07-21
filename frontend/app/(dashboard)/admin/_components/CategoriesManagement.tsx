"use client";
import Link from "next/link";
import { Eye, MoreHorizontal, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";
const categories = [
  {
    id: 1,
    name: "Dresses",
    slug: "dresses",
    type: "Manual",
    products: 36,
    status: "Active",
  },
  {
    id: 2,
    name: "Tops",
    slug: "tops",
    type: "Automatic",
    products: 28,
    status: "Active",
  },
  {
    id: 3,
    name: "Accessories",
    slug: "accessories",
    type: "Automatic",
    products: 19,
    status: "Active",
  },
  {
    id: 4,
    name: "Handbags",
    slug: "handbags",
    type: "Manual",
    products: 14,
    status: "Active",
  },
  {
    id: 5,
    name: "Men",
    slug: "men",
    type: "Automatic",
    products: 22,
    status: "Active",
  },
  {
    id: 6,
    name: "New arrivals",
    slug: "new-arrivals",
    type: "Automatic",
    products: 12,
    status: "Draft",
  },
];
export function CategoriesManagement() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      categories.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Group products into manual or rule-based storefront collections."
        actionHref="/admin/categories/new"
        actionLabel="Add category"
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
              placeholder="Search categories"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                {[
                  "Category",
                  "Slug",
                  "Collection type",
                  "Products",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{category.type}</td>
                  <td className="px-4 py-3">{category.products}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${category.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/shop?category=${category.name}`}
                        className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                        aria-label={`View ${category.name}`}
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                        aria-label={`Actions for ${category.name}`}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </div>
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
