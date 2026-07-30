"use client";

import {
  Copy,
  Eye,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Coupon, CouponInput } from "@/features/admin/catalog/api";
import {
  useCouponMutations,
  useCoupons,
} from "@/features/admin/catalog/hooks";
import { AdminPageHeader } from "./AdminPageHeader";
import { fieldClass } from "./AdminFormUI";
import { CatalogModal } from "./CatalogModal";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

const emptyCoupon: CouponInput = {
  code: "",
  name: "",
  description: null,
  type: "PERCENTAGE",
  status: "ACTIVE",
  value: 10,
  currency: "USD",
  minimumSubtotal: null,
  usageLimit: null,
  perCustomerLimit: 1,
  isAutomatic: false,
  startsAt: null,
  endsAt: null,
};

const dateInputValue = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function couponValue(coupon: Coupon) {
  if (coupon.type === "FREE_SHIPPING") return "Free shipping";
  if (coupon.type === "BUY_X_GET_Y") return "Buy X get Y";
  if (coupon.type === "PERCENTAGE") return `${Number(coupon.value ?? 0)}% off`;
  return `${money.format(Number(coupon.value ?? 0))} off`;
}

export function CouponsManagement() {
  const couponsQuery = useCoupons();
  const mutations = useCouponMutations();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [viewingCoupon, setViewingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponInput>(emptyCoupon);
  const coupons = useMemo(() => couponsQuery.data ?? [], [couponsQuery.data]);
  const filtered = useMemo(
    () =>
      coupons.filter((coupon) =>
        `${coupon.code} ${coupon.name} ${coupon.type}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [coupons, query],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  const pending = mutations.create.isPending || mutations.update.isPending;

  function openCreate() {
    setEditing(null);
    setForm(emptyCoupon);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      status: coupon.status,
      value: coupon.value === null ? null : Number(coupon.value),
      currency: "USD",
      minimumSubtotal:
        coupon.minimumSubtotal === null
          ? null
          : Number(coupon.minimumSubtotal),
      usageLimit: coupon.usageLimit,
      perCustomerLimit: coupon.perCustomerLimit,
      isAutomatic: coupon.isAutomatic,
      startsAt: dateInputValue(coupon.startsAt),
      endsAt: dateInputValue(coupon.endsAt),
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const input = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startsAt: form.startsAt
        ? new Date(form.startsAt).toISOString()
        : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      value: form.type === "FREE_SHIPPING" ? null : form.value,
    };
    try {
      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, input });
        toast.success("Coupon updated");
      } else {
        await mutations.create.mutateAsync(input);
        toast.success("Coupon created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save coupon",
      );
    }
  }

  async function disable(coupon: Coupon) {
    if (!window.confirm(`Disable coupon “${coupon.code}”?`)) return;
    try {
      await mutations.disable.mutateAsync(coupon.id);
      toast.success("Coupon disabled");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to disable coupon",
      );
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Manage customer discount codes and their limits."
        actionLabel="Create coupon"
        onAction={openCreate}
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
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              placeholder="Search coupons"
            />
          </div>
        </div>
        {couponsQuery.isPending ? (
          <div className="grid min-h-48 place-items-center text-slate-500">
            <LoaderCircle className="animate-spin" size={24} />
          </div>
        ) : couponsQuery.isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">Coupons could not be loaded.</p>
            <button
              onClick={() => couponsQuery.refetch()}
              className="mt-3 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    {["Code", "Name", "Discount", "Used", "Dates", "Status", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-medium">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(coupon.code);
                            toast.success("Code copied");
                          }}
                          className="flex items-center gap-2 font-semibold text-slate-800"
                        >
                          {coupon.code}
                          <Copy size={13} className="text-slate-400" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{coupon.name}</td>
                      <td className="px-4 py-3">{couponValue(coupon)}</td>
                      <td className="px-4 py-3">{coupon._count.redemptions}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {coupon.startsAt
                          ? new Date(coupon.startsAt).toLocaleDateString("en-US")
                          : "Immediately"}
                        <br />
                        {coupon.endsAt
                          ? new Date(coupon.endsAt).toLocaleDateString("en-US")
                          : "No end date"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${
                            coupon.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {coupon.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setViewingCoupon(coupon)}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`View ${coupon.code}`}
                            title="View coupon details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(coupon)}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Edit ${coupon.code}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => disable(coupon)}
                            disabled={mutations.disable.isPending}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label={`Disable ${coupon.code}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visible.length && (
                <p className="p-8 text-center text-sm text-slate-500">
                  No coupons found.
                </p>
              )}
            </div>
            <TablePagination
              page={page}
              totalItems={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* View Coupon Details Drawer */}
      {viewingCoupon && (
        <CatalogModal
          title="Coupon Details"
          description="View promo code value, usage redemptions, and expiration status."
          onClose={() => setViewingCoupon(null)}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <span className="font-mono text-xl font-bold text-slate-900 block">{viewingCoupon.code}</span>
                <p className="text-xs text-slate-500 mt-0.5">{viewingCoupon.name}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      viewingCoupon.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {viewingCoupon.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 block">{couponValue(viewingCoupon)}</span>
                <span className="text-xs text-slate-500">{viewingCoupon.type.replace("_", " ")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <span className="text-xs text-slate-500 block">Total Redemptions</span>
                <span className="font-bold text-slate-900 text-lg mt-1 block">{viewingCoupon._count?.redemptions ?? 0}</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <span className="text-xs text-slate-500 block">Usage Limit</span>
                <span className="font-bold text-slate-900 text-lg mt-1 block">{viewingCoupon.usageLimit ?? "Unlimited"}</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <span className="text-xs text-slate-500 block">Per Customer Limit</span>
                <span className="font-bold text-slate-900 text-lg mt-1 block">{viewingCoupon.perCustomerLimit ?? 1}</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Starts:</span>
                <span className="font-medium text-slate-800">
                  {viewingCoupon.startsAt ? new Date(viewingCoupon.startsAt).toLocaleString() : "Immediately"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expires:</span>
                <span className="font-medium text-slate-800">
                  {viewingCoupon.endsAt ? new Date(viewingCoupon.endsAt).toLocaleString() : "No end date"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setViewingCoupon(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const c = viewingCoupon;
                  setViewingCoupon(null);
                  openEdit(c);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Pencil size={15} /> Edit Coupon
              </button>
            </div>
          </div>
        </CatalogModal>
      )}

      {modalOpen && (
        <CatalogModal
          title={editing ? "Edit coupon" : "Create coupon"}
          description="Set the discount value, limits, and active dates."
          onClose={() => !pending && setModalOpen(false)}
        >
          <form onSubmit={submit} className="space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Coupon code
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase().replace(/\s+/g, ""),
                    }))
                  }
                  className={fieldClass}
                  placeholder="WELCOME10"
                  autoFocus
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Coupon name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={fieldClass}
                  placeholder="Welcome discount"
                />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Discount type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as CouponInput["type"],
                    }))
                  }
                  className={`${fieldClass} appearance-none`}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount</option>
                  <option value="FREE_SHIPPING">Free shipping</option>
                </select>
              </label>
              {form.type !== "FREE_SHIPPING" ? (
                <label className="block text-sm font-medium text-slate-700">
                  {form.type === "PERCENTAGE"
                    ? "Percentage"
                    : "Amount (USD)"}
                  <input
                    required
                    type="number"
                    min={0}
                    max={form.type === "PERCENTAGE" ? 100 : undefined}
                    step="0.01"
                    value={form.value ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        value:
                          event.target.value === ""
                            ? null
                            : Number(event.target.value),
                      }))
                    }
                    className={fieldClass}
                  />
                </label>
              ) : (
                <label className="flex items-center gap-3 self-end pb-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isAutomatic}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isAutomatic: event.target.checked,
                      }))
                    }
                    className="size-4 accent-slate-950"
                  />
                  Apply automatically
                </label>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Minimum order (USD)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.minimumSubtotal ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      minimumSubtotal:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                  className={fieldClass}
                  placeholder="Optional"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Total usage limit
                <input
                  type="number"
                  min={1}
                  value={form.usageLimit ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      usageLimit:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                  className={fieldClass}
                  placeholder="Unlimited"
                />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Starts
                <input
                  type="datetime-local"
                  value={form.startsAt ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startsAt: event.target.value || null,
                    }))
                  }
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Ends
                <input
                  type="datetime-local"
                  value={form.endsAt ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endsAt: event.target.value || null,
                    }))
                  }
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value || null,
                  }))
                }
                className={`${fieldClass} min-h-24 py-3`}
                placeholder="Optional description"
              />
            </label>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={pending}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {pending && <LoaderCircle className="animate-spin" size={16} />}
                {editing ? "Save changes" : "Create coupon"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </>
  );
}
