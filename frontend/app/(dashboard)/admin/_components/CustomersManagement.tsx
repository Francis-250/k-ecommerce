"use client";

import Link from "next/link";
import { Download, Eye, Loader2, Mail, Phone, Search, ShieldCheck, SlidersHorizontal, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCustomerMutations, useCustomers } from "@/features/admin/customers/hooks";
import type { ApiCustomer } from "@/features/admin/customers/api";
import { AdminPageHeader } from "./AdminPageHeader";
import { CatalogModal } from "./CatalogModal";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

export function CustomersManagement() {
  const [segment, setSegment] = useState("All customers");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<ApiCustomer | null>(null);

  // Form State for Add Customer Drawer
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "STAFF" | "ADMIN">("CUSTOMER");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [taxExempt, setTaxExempt] = useState(false);

  const { data: customers = [], isLoading, isError, error } = useCustomers(query);
  const { create: createCustomerMutation } = useCustomerMutations();

  const resetAddForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("CUSTOMER");
    setAcceptsMarketing(false);
    setTaxExempt(false);
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email address is required.");
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        password: password || undefined,
        role,
        acceptsMarketing,
        taxExempt,
      });

      toast.success("Customer added successfully!");
      resetAddForm();
      setIsAddDrawerOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create customer");
    }
  };

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const ordersCount = customer._count?.orders ?? customer.orders?.length ?? 0;
      const isSubscriber = customer.acceptsMarketing;

      if (segment === "Email subscribers" && !isSubscriber) return false;
      if (segment === "Repeat customers" && ordersCount <= 1) return false;

      return true;
    });
  }, [customers, segment]);

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  const repeatCount = useMemo(
    () => customers.filter((c) => (c._count?.orders ?? c.orders?.length ?? 0) > 1).length,
    [customers],
  );

  const subscriberCount = useMemo(
    () => customers.filter((c) => c.acceptsMarketing).length,
    [customers],
  );

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Manage customer profiles, segments, marketing consent, and purchase history."
        onAction={() => setIsAddDrawerOpen(true)}
        actionLabel="Add customer"
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Summary label="Total customers" value={customers.length.toLocaleString()} />
        <Summary label="Repeat customers" value={repeatCount.toLocaleString()} />
        <Summary label="Email subscribers" value={subscriberCount.toLocaleString()} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3">
          {["All customers", "Email subscribers", "Repeat customers"].map(
            (item) => (
              <button
                onClick={() => {
                  setSegment(item);
                  setPage(1);
                }}
                key={item}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  segment === item
                    ? "border-emerald-600 font-semibold text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
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
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
              placeholder="Search name, email, or phone"
            />
          </div>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Customer filters"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Export customers"
          >
            <Download size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
            <p className="text-sm font-medium">Fetching customers...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            <p className="text-sm font-medium">
              Failed to load customers: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
            <Users className="text-slate-300 mb-2" size={36} />
            <p className="text-sm font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {query
                ? `No customers matching "${query}". Try adjusting your search query.`
                : "No customers created yet. Click 'Add customer' above to create one."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 bg-slate-50/50">
                  {[
                    "Customer",
                    "Role / Status",
                    "Orders",
                    "Phone",
                    "Joined Date",
                    "Email Marketing",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((customer) => {
                  const fullName = customer.firstName || customer.lastName
                    ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
                    : customer.username || "Customer";
                  
                  const initials = fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  const ordersCount = customer._count?.orders ?? customer.orders?.length ?? 0;
                  const joinedDate = new Date(customer.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewingCustomer(customer)}
                          className="flex items-center gap-3 text-left group"
                        >
                          <span className="grid size-9 place-items-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">
                            {initials}
                          </span>
                          <div>
                            <strong className="block font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {fullName}
                            </strong>
                            <small className="text-slate-500 font-mono text-xs">{customer.email}</small>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 bg-slate-100 text-slate-700">
                          {customer.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{ordersCount}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{customer.phone || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{joinedDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            customer.acceptsMarketing
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {customer.acceptsMarketing ? "Subscribed" : "Not subscribed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewingCustomer(customer)}
                          className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="View customer details"
                          aria-label={`View ${fullName}`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>

      {/* Add Customer Drawer */}
      {isAddDrawerOpen && (
        <CatalogModal
          title="Add New Customer"
          description="Create a new customer profile with contact information and preferences."
          onClose={() => {
            setIsAddDrawerOpen(false);
            resetAddForm();
          }}
        >
          <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 202 555 0124"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Auto-generated if empty"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "CUSTOMER" | "STAFF" | "ADMIN")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="size-4 accent-slate-900 rounded"
                />
                <span className="text-xs font-medium text-slate-700">Customer agrees to receive marketing emails</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxExempt}
                  onChange={(e) => setTaxExempt(e.target.checked)}
                  className="size-4 accent-slate-900 rounded"
                />
                <span className="text-xs font-medium text-slate-700">Tax Exempt Customer</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddDrawerOpen(false);
                  resetAddForm();
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCustomerMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {createCustomerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Create Customer
              </button>
            </div>
          </form>
        </CatalogModal>
      )}

      {/* View Customer Details Drawer */}
      {viewingCustomer && (
        <CatalogModal
          title={`Customer Profile — ${viewingCustomer.firstName ?? ""} ${viewingCustomer.lastName ?? viewingCustomer.email}`}
          description={`Customer ID: ${viewingCustomer.id}`}
          onClose={() => setViewingCustomer(null)}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid size-12 place-items-center rounded-xl bg-emerald-700 font-bold text-white text-lg">
                {(viewingCustomer.firstName?.[0] ?? viewingCustomer.email[0]).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {viewingCustomer.firstName || viewingCustomer.lastName
                    ? `${viewingCustomer.firstName ?? ""} ${viewingCustomer.lastName ?? ""}`
                    : "Customer"}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{viewingCustomer.email}</p>
              </div>
              <span className="rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold">
                {viewingCustomer.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs text-slate-500 block">Contact Info</span>
                <p className="text-xs text-slate-800 flex items-center gap-1.5 pt-1">
                  <Mail size={14} className="text-slate-400" /> {viewingCustomer.email}
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {viewingCustomer.phone || "No phone registered"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
                <span className="text-xs text-slate-500 block">Account Status</span>
                <p className="text-xs text-slate-800 flex items-center gap-1.5 pt-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> Verified Account
                </p>
                <p className="text-xs text-slate-500">
                  Marketing: {viewingCustomer.acceptsMarketing ? "Subscribed" : "Not subscribed"}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </CatalogModal>
      )}
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
