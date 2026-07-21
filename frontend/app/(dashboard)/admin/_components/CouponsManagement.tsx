"use client";
import { Copy, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "./AdminPageHeader";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";
const discounts = [
  {
    code: "WELCOME10",
    method: "Code",
    type: "10% off order",
    eligibility: "All customers",
    used: 84,
    starts: "1 Jan 2026",
    ends: "31 Dec 2026",
    status: "Active",
  },
  {
    code: "SUMMER20",
    method: "Code",
    type: "20% off products",
    eligibility: "Summer segment",
    used: 42,
    starts: "1 Jul 2026",
    ends: "30 Sep 2026",
    status: "Active",
  },
  {
    code: "FREE SHIPPING",
    method: "Automatic",
    type: "Free shipping",
    eligibility: "Orders over $100",
    used: 21,
    starts: "15 Jul 2026",
    ends: "15 Aug 2026",
    status: "Scheduled",
  },
  {
    code: "VIP15",
    method: "Code",
    type: "$15 off order",
    eligibility: "VIP customers",
    used: 63,
    starts: "1 Feb 2026",
    ends: "30 Jun 2026",
    status: "Expired",
  },
];
export function CouponsManagement() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = discounts.filter(
    (discount) =>
      discount.code.toLowerCase().includes(query.toLowerCase()) &&
      (tab === "All" || discount.method === tab),
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Manage discount codes, automatic promotions, eligibility, and usage limits."
        actionHref="/admin/coupons/new"
        actionLabel="Create discount"
      />
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {["All", "Code", "Automatic"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                setPage(1);
              }}
              className={`border-b-2 px-3 py-2 text-sm ${tab === item ? "border-emerald-600 font-medium text-emerald-700" : "border-transparent text-slate-500"}`}
            >
              {item}
            </button>
          ))}
        </div>
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
              placeholder="Search discount codes"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                {[
                  "Discount",
                  "Method",
                  "Type",
                  "Eligibility",
                  "Used",
                  "Dates",
                  "Status",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((discount) => (
                <tr key={discount.code} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(discount.code);
                        toast.success("Code copied");
                      }}
                      className="flex items-center gap-2 font-medium text-slate-800"
                    >
                      {discount.code}
                      <Copy size={13} className="text-slate-400" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {discount.method}
                  </td>
                  <td className="px-4 py-3">{discount.type}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {discount.eligibility}
                  </td>
                  <td className="px-4 py-3">{discount.used}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {discount.starts}
                    <br />
                    {discount.ends}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${discount.status === "Active" ? "bg-emerald-50 text-emerald-700" : discount.status === "Scheduled" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {discount.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                      aria-label={`Actions for ${discount.code}`}
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
