"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "./AdminPageHeader";
import { CatalogModal } from "./CatalogModal";
import { fieldClass } from "./AdminFormUI";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export function ServicesManagement() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages.services"],
    queryFn: () => authFetch<{ success: boolean; setting?: { value: any } }>("/store-settings/public/pages.services"),
  });

  const pageData = data?.setting?.value || {
    heading: "OUR SERVICES",
    subheading: "Thoughtful solutions crafted to elevate fashion brands and retail experiences.",
    cards: [
      { image: "/storefront/img/services/service2.jpg", title: "DESIGN THE COVER", description: "Crafting distinct visual identities and campaign lookbooks." },
      { image: "/storefront/img/services/service1.jpg", title: "BUILD YOUR BRAND", description: "Strategy, tone of voice, and brand positioning." },
      { image: "/storefront/img/services/service3.jpg", title: "CREATE THE EXPERIENCE", description: "Immersive retail store design and digital platforms." },
    ],
    services: [
      { name: "Branding", icon: "◆", description: "Comprehensive brand positioning and design systems." },
      { name: "Web design", icon: "◈", description: "Responsive digital experiences tailored for luxury fashion." },
      { name: "Photography", icon: "●", description: "Lookbook and e-commerce product photography." },
      { name: "Web development", icon: "⚙", description: "Fast, performant storefront solutions." },
    ],
    unlimitedSection: {
      image: "/storefront/img/services/service4.jpg",
      title: "UNLIMITED IDEAS",
      text: "From initial concept sketches to finished production pieces, we bring creative direction into reality.",
      ctaText: "More info",
      ctaLink: "/contact",
    },
  };

  const servicesList = pageData.services || [];

  const filtered = useMemo(() => {
    return servicesList.filter((s: any) =>
      `${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [servicesList, query]);

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE
  );

  const saveMutation = useMutation({
    mutationFn: (updatedPageData: any) =>
      authFetch("/store-settings/pages.services", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.services", value: updatedPageData }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.services"] });
      toast.success("Services updated successfully");
      setModalOpen(false);
      setEditingIndex(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditingIndex(null);
    setModalOpen(true);
  }

  function openEdit(index: number) {
    setEditingIndex(index);
    setModalOpen(true);
  }

  function remove(index: number) {
    if (!window.confirm("Delete this service item?")) return;
    const nextServices = servicesList.filter((_: any, i: number) => i !== index);
    saveMutation.mutate({ ...pageData, services: nextServices });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name")).trim();
    const icon = String(form.get("icon")).trim() || "◆";
    const description = String(form.get("description")).trim();

    const newService = { name, icon, description };
    let nextServices = [...servicesList];
    if (editingIndex !== null) {
      nextServices[editingIndex] = newService;
    } else {
      nextServices.push(newService);
    }

    saveMutation.mutate({ ...pageData, services: nextServices });
  }

  const editingService = editingIndex !== null ? servicesList[editingIndex] : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="Manage service offerings and descriptions shown on your storefront Services page."
        actionLabel="Add Service"
        onAction={openCreate}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search services by title or description..."
            className={fieldClass}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
          <LoaderCircle className="animate-spin text-slate-900" size={28} />
          <p className="text-xs font-medium text-slate-500">Loading services...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">No services found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Service Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((item: any, idx: number) => (
                  <tr key={item.name + idx} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-lg font-bold text-slate-900">
                      {item.icon || "◆"}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit((page - 1) * ADMIN_PAGE_SIZE + idx)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove((page - 1) * ADMIN_PAGE_SIZE + idx)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                        >
                          <Trash2 size={15} />
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
        </div>
      )}

      {/* Slide-over Drawer Modal */}
      {modalOpen && (
        <CatalogModal
          title={editingService ? "Edit Service" : "Add New Service"}
          description="Configure service title, symbol, and description."
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 p-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Service Name *</label>
              <input
                name="name"
                defaultValue={editingService?.name || ""}
                required
                className={fieldClass}
                placeholder="e.g. Branding"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Icon / Symbol</label>
              <input
                name="icon"
                defaultValue={editingService?.icon || "◆"}
                className={fieldClass}
                placeholder="e.g. ◆"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Description *</label>
              <textarea
                name="description"
                defaultValue={editingService?.description || ""}
                rows={4}
                required
                className={fieldClass}
                placeholder="Service description..."
              />
            </div>

            <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-end gap-3 border-t border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-lg bg-slate-950 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saveMutation.isPending ? "Saving..." : editingService ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </div>
  );
}
