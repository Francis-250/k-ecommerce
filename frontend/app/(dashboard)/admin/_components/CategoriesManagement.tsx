"use client";

import { LoaderCircle, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type {
  Category,
  CategoryInput,
} from "@/features/admin/catalog/api";
import {
  useCategories,
  useCategoryMutations,
} from "@/features/admin/catalog/hooks";
import { AdminPageHeader } from "./AdminPageHeader";
import { fieldClass } from "./AdminFormUI";
import { CatalogModal } from "./CatalogModal";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

const emptyCategory: CategoryInput = {
  name: "",
  slug: "",
  description: null,
  parentId: null,
  isActive: true,
  sortOrder: 0,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function CategoriesManagement() {
  const categoriesQuery = useCategories();
  const mutations = useCategoryMutations();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyCategory);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const filtered = useMemo(
    () =>
      categories.filter((category) =>
        `${category.name} ${category.slug}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [categories, query],
  );
  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );
  const pending = mutations.create.isPending || mutations.update.isPending;

  function openCreate() {
    setEditing(null);
    setForm(emptyCategory);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, input: form });
        toast.success("Category updated");
      } else {
        await mutations.create.mutateAsync(form);
        toast.success("Category created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save category",
      );
    }
  }

  async function remove(category: Category) {
    if (!window.confirm(`Delete “${category.name}”? This cannot be undone.`))
      return;
    try {
      await mutations.remove.mutateAsync(category.id);
      toast.success("Category deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete category",
      );
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Organize products into storefront categories."
        actionLabel="Add category"
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
              placeholder="Search categories"
            />
          </div>
        </div>

        {categoriesQuery.isPending ? (
          <div className="grid min-h-48 place-items-center text-slate-500">
            <LoaderCircle className="animate-spin" size={24} />
          </div>
        ) : categoriesQuery.isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">
              Categories could not be loaded.
            </p>
            <button
              onClick={() => categoriesQuery.refetch()}
              className="mt-3 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    {["Category", "Slug", "Products", "Order", "Status", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-3 font-medium">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {category.slug}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {category._count?.products ?? 0}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {category.sortOrder}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${
                            category.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(category)}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => remove(category)}
                            disabled={mutations.remove.isPending}
                            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label={`Delete ${category.name}`}
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
                  No categories found.
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
          title={editing ? "Edit category" : "Add category"}
          description="Enter the basic category information."
          onClose={() => !pending && setModalOpen(false)}
        >
          <form onSubmit={submit} className="space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Category name
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
                  placeholder="Category name"
                  autoFocus
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Parent category
                <select
                  value={form.parentId ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      parentId: event.target.value || null,
                    }))
                  }
                  className={`${fieldClass} appearance-none`}
                >
                  <option value="">No parent</option>
                  {categories
                    .filter((category) => category.id !== editing?.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Display order
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value),
                    }))
                  }
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="block w-full text-sm font-medium text-slate-700">
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
                {editing ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </>
  );
}
