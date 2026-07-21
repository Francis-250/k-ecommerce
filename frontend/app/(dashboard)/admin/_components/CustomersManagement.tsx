"use client";
import Link from "next/link";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";
const customers = [
  {
    id: "1",
    initials: "BC",
    name: "Bella Chao",
    email: "bella@example.com",
    location: "Kigali, Rwanda",
    orders: 12,
    spent: "$1,420.00",
    lastOrder: "2 days ago",
    marketing: "Subscribed",
  },
  {
    id: "2",
    initials: "AA",
    name: "Alex Almond",
    email: "alex@example.com",
    location: "Huye, Rwanda",
    orders: 8,
    spent: "$940.00",
    lastOrder: "5 days ago",
    marketing: "Subscribed",
  },
  {
    id: "3",
    initials: "AS",
    name: "Anitra Sen",
    email: "anitra@example.com",
    location: "Nairobi, Kenya",
    orders: 5,
    spent: "$670.00",
    lastOrder: "1 week ago",
    marketing: "Not subscribed",
  },
  {
    id: "4",
    initials: "JD",
    name: "John Doe",
    email: "john@example.com",
    location: "Kampala, Uganda",
    orders: 3,
    spent: "$270.00",
    lastOrder: "2 weeks ago",
    marketing: "Subscribed",
  },
];
export function CustomersManagement() {
  const [segment, setSegment] = useState("All customers");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      customers.filter(
        (customer) =>
          Object.values(customer)
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (segment === "All customers" ||
            (segment === "Email subscribers" &&
              customer.marketing === "Subscribed") ||
            (segment === "Repeat customers" && customer.orders > 5)),
      ),
    [query, segment],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Manage customer profiles, segments, marketing consent, and purchase history."
        actionHref="/admin/users/new"
        actionLabel="Add customer"
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Summary label="Total customers" value="20,482" />
        <Summary label="Repeat customers" value="4,216" />
        <Summary label="Email subscribers" value="12,840" />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3">
          {["All customers", "Email subscribers", "Repeat customers"].map(
            (item) => (
              <button
                onClick={() => {
                  setSegment(item);
                  setPage(1);
                }}
                key={item}
                className={`border-b-2 px-3 py-2 text-sm ${segment === item ? "border-emerald-600 font-medium text-emerald-700" : "border-transparent text-slate-500"}`}
              >
                {item}
              </button>
            ),
          )}
        </div>
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
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Search name, email, location"
            />
          </div>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500"
            aria-label="Customer filters"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500"
            aria-label="Export customers"
          >
            <Download size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                {[
                  "Customer",
                  "Location",
                  "Orders",
                  "Amount spent",
                  "Last order",
                  "Email marketing",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${customer.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="grid size-9 place-items-center rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                        {customer.initials}
                      </span>
                      <span>
                        <strong className="block font-medium text-slate-800">
                          {customer.name}
                        </strong>
                        <small className="text-slate-500">
                          {customer.email}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {customer.location}
                  </td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {customer.spent}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {customer.lastOrder}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${customer.marketing === "Subscribed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {customer.marketing}
                    </span>
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
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
