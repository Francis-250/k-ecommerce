"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { AdminPageHeader } from "./AdminPageHeader";
import { CatalogModal } from "./CatalogModal";
import { ImageUploadField, fieldClass } from "./AdminFormUI";
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

export function PortfolioManagement() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "portfolio"],
    queryFn: () => authFetch<{ success: boolean; projects: any[] }>("/portfolio-projects?admin=true"),
  });

  const projects = data?.projects || [];

  const filtered = useMemo(() => {
    return projects.filter((p) =>
      `${p.title} ${p.client} ${p.category} ${p.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [projects, query]);

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        return authFetch(`/portfolio-projects/${payload.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return authFetch("/portfolio-projects", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio"] });
      toast.success(editing ? "Portfolio project updated" : "Portfolio project created");
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authFetch(`/portfolio-projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio"] });
      toast.success("Portfolio project deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item: any) {
    setEditing(item);
    setModalOpen(true);
  }

  async function remove(item: any) {
    if (!window.confirm(`Delete project “${item.title}”?`)) return;
    deleteMutation.mutate(item.id);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    const slug =
      String(form.get("slug")).trim() ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    saveMutation.mutate({
      id: editing?.id,
      title,
      slug,
      client: String(form.get("client") ?? "I-RAS STYLES Studio"),
      category: String(form.get("category") ?? "Editorial"),
      description: String(form.get("description") ?? ""),
      content: String(form.get("content") ?? ""),
      coverImageUrl: String(form.get("coverImageUrl") ?? ""),
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Portfolio Work"
        description="Manage creative campaigns, lookbooks, and brand editorials."
        actionLabel="Add Project"
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
            placeholder="Search projects by title, client or category..."
            className={fieldClass}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
          <LoaderCircle className="animate-spin text-slate-900" size={28} />
          <p className="text-xs font-medium text-slate-500">Loading portfolio projects...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">No portfolio projects found</p>
          <p className="mt-1 text-xs text-slate-500">Create your first creative showcase project.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((item) => (
                  <tr key={item.id || item.slug} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.coverImageUrl ? (
                          <Image
                            src={item.coverImageUrl}
                            alt=""
                            width={44}
                            height={44}
                            unoptimized
                            className="size-11 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="grid size-11 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">
                            IMG
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.client || "Studio"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {item.category || "Editorial"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                      {item.description || item.content}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          title="Edit project"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                          title="Delete project"
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
          title={editing ? "Edit Portfolio Project" : "Add Portfolio Project"}
          description="Fill in project attributes to display on portfolio showcases."
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 p-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Project Title *</label>
              <input
                name="title"
                defaultValue={editing?.title || ""}
                required
                className={fieldClass}
                placeholder="e.g. Quiet Luxury Editorial"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Client / Brand</label>
                <input
                  name="client"
                  defaultValue={editing?.client || "I-RAS STYLES Studio"}
                  className={fieldClass}
                  placeholder="e.g. I-RAS STYLES Studio"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Category Tag</label>
                <input
                  name="category"
                  defaultValue={editing?.category || "Editorial"}
                  className={fieldClass}
                  placeholder="e.g. Editorial"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Summary / Lead Text</label>
              <textarea
                name="description"
                defaultValue={editing?.description || ""}
                rows={2}
                className={fieldClass}
                placeholder="Short lead description for project cards..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Details Content</label>
              <textarea
                name="content"
                defaultValue={editing?.content || ""}
                rows={6}
                className={fieldClass}
                placeholder="Comprehensive project narrative..."
              />
            </div>
            <div>
              <ImageUploadField
                label="Cover Image"
                description="Upload high resolution image (JPG, PNG, WebP)"
                initialUrls={editing?.coverImageUrl ? [editing.coverImageUrl] : []}
                onChange={(urls) => {
                  const el = document.getElementById("port-drawer-cover") as HTMLInputElement;
                  if (el && urls[0]) el.value = urls[0];
                }}
              />
              <input
                id="port-drawer-cover"
                name="coverImageUrl"
                defaultValue={editing?.coverImageUrl || ""}
                type="hidden"
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
                {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </div>
  );
}
