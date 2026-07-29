"use client";

import Image from "next/image";
import {
  ImagePlus,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  useBrandMutations,
  useBrands,
} from "@/features/admin/catalog/hooks";
import {
  uploadBrandLogo,
  type Brand,
  type BrandInput,
} from "@/features/admin/catalog/api";
import { AdminPageHeader } from "./AdminPageHeader";
import { CatalogModal } from "./CatalogModal";
import { fieldClass } from "./AdminFormUI";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

const emptyBrand: BrandInput = {
  name: "",
  slug: "",
  description: null,
  country: "United States",
  logoUrl: null,
  isActive: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function BrandsManagement() {
  const brandsQuery = useBrands();
  const mutations = useBrandMutations();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandInput>(emptyBrand);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(
    () =>
      (brandsQuery.data ?? []).filter((brand) =>
        `${brand.name} ${brand.slug} ${brand.country ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [brandsQuery.data, query],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  const pending = mutations.create.isPending || mutations.update.isPending;

  function openCreate() {
    setEditing(null);
    setForm(emptyBrand);
    setModalOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      country: brand.country,
      logoUrl: brand.logoUrl,
      isActive: brand.isActive,
    });
    setModalOpen(true);
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The image must be smaller than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const logoUrl = await uploadBrandLogo(file);
      setForm((current) => ({ ...current, logoUrl }));
      toast.success("Brand picture uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, input: form });
        toast.success("Brand updated");
      } else {
        await mutations.create.mutateAsync(form);
        toast.success("Brand created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save brand");
    }
  }

  async function remove(brand: Brand) {
    if (!window.confirm(`Delete “${brand.name}”? This cannot be undone.`)) return;
    try {
      await mutations.remove.mutateAsync(brand.id);
      toast.success("Brand deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete brand",
      );
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Manage the product brands available in your store."
        actionLabel="Add brand"
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
              placeholder="Search brands"
            />
          </div>
        </div>

        {brandsQuery.isPending ? (
          <div className="grid min-h-48 place-items-center text-slate-500">
            <LoaderCircle className="animate-spin" size={24} />
          </div>
        ) : brandsQuery.isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">Brands could not be loaded.</p>
            <button
              onClick={() => brandsQuery.refetch()}
              className="mt-3 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    {["Brand", "Slug", "Country", "Status", "Actions"].map(
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
                          {brand.logoUrl ? (
                            <Image
                              src={brand.logoUrl}
                              alt={`${brand.name} logo`}
                              width={40}
                              height={40}
                              unoptimized
                              className="size-10 rounded-md border border-slate-200 bg-white object-contain p-1"
                            />
                          ) : (
                            <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                              {brand.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <span className="font-medium text-slate-800">
                            {brand.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{brand.slug}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {brand.country || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${
                            brand.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(brand)}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Edit ${brand.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => remove(brand)}
                            disabled={mutations.remove.isPending}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label={`Delete ${brand.name}`}
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
                  No brands found.
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

      {modalOpen && (
        <CatalogModal
          title={editing ? "Edit brand" : "Add brand"}
          description="Enter the basic brand information."
          onClose={() => !pending && setModalOpen(false)}
        >
          <form onSubmit={submit} className="space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Brand name
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm((current) => ({
                      ...current,
                      name,
                      slug: slugify(name),
                    }));
                  }}
                  className={fieldClass}
                  placeholder="Brand name"
                  autoFocus
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Country
                <input
                  value={form.country ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      country: event.target.value || null,
                    }))
                  }
                  className={fieldClass}
                  placeholder="United States"
                />
              </label>
            </div>
            <div className="grid items-start gap-5 sm:grid-cols-2">
              <div>
                <span className="block text-sm font-medium text-slate-700">
                  Brand picture
                </span>
                <label className="mt-2 flex min-h-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-slate-500">
                  {form.logoUrl ? (
                    <Image
                      src={form.logoUrl}
                      alt="Brand picture preview"
                      width={320}
                      height={160}
                      unoptimized
                      className="h-28 w-full object-contain p-3"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-sm text-slate-500">
                      {uploading ? (
                        <LoaderCircle className="animate-spin" size={22} />
                      ) : (
                        <ImagePlus size={22} />
                      )}
                      {uploading ? "Uploading..." : "Choose brand picture"}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                    onChange={(event) => uploadLogo(event.target.files?.[0])}
                    className="sr-only"
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
                  className={`${fieldClass} min-h-28 py-3`}
                  placeholder="Optional description"
                />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-4 accent-slate-950"
              />
              Active on storefront
            </label>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={pending || uploading}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={pending || uploading}
                className="inline-flex min-w-28 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {pending && <LoaderCircle className="animate-spin" size={16} />}
                {editing ? "Save changes" : "Create brand"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </>
  );
}
