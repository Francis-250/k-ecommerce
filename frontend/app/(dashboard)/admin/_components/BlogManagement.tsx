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

export function BlogManagement() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () => authFetch<{ success: boolean; data: any[] }>("/articles?admin=true"),
  });

  const articles = data?.data || [];

  const filtered = useMemo(() => {
    return articles.filter((a) =>
      `${a.title} ${a.authorName} ${a.excerpt}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [articles, query]);

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        return authFetch(`/articles/${payload.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return authFetch("/articles", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      toast.success(editing ? "Blog article updated" : "Blog article created");
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authFetch(`/articles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      toast.success("Blog article deleted");
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
    if (!window.confirm(`Delete “${item.title}”?`)) return;
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
      authorName: String(form.get("authorName") ?? "Style Guide"),
      excerpt: String(form.get("excerpt") ?? ""),
      content: String(form.get("content") ?? ""),
      coverImageUrl: String(form.get("coverImageUrl") ?? ""),
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog Articles"
        description="Manage journal posts, tutorials, and style stories published on your storefront."
        actionLabel="Add Article"
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
            placeholder="Search articles by title, author or category..."
            className={fieldClass}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
          <LoaderCircle className="animate-spin text-slate-900" size={28} />
          <p className="text-xs font-medium text-slate-500">Loading articles...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">No blog articles found</p>
          <p className="mt-1 text-xs text-slate-500">Create your first blog post to populate the journal.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Category / Author</th>
                  <th className="px-4 py-3">Excerpt</th>
                  <th className="px-4 py-3">Published</th>
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
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {item.authorName || "Journal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                      {item.excerpt || item.content}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Draft"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          title="Edit article"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                          title="Delete article"
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
          title={editing ? "Edit Blog Article" : "Add New Blog Article"}
          description="Fill in article details to publish on your storefront."
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 p-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Article Title *</label>
              <input
                name="title"
                defaultValue={editing?.title || ""}
                required
                className={fieldClass}
                placeholder="e.g. Building a Timeless Wardrobe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category / Author Tag</label>
              <input
                name="authorName"
                defaultValue={editing?.authorName || "Style Guide"}
                className={fieldClass}
                placeholder="e.g. Style Guide"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Excerpt / Short Summary</label>
              <textarea
                name="excerpt"
                defaultValue={editing?.excerpt || ""}
                rows={2}
                className={fieldClass}
                placeholder="Short lead summary for article card..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Content *</label>
              <textarea
                name="content"
                defaultValue={editing?.content || ""}
                rows={8}
                required
                className={fieldClass}
                placeholder="Write article story content here..."
              />
            </div>
            <div>
              <ImageUploadField
                label="Cover Image"
                description="Upload high resolution image (JPG, PNG, WebP)"
                initialUrls={editing?.coverImageUrl ? [editing.coverImageUrl] : []}
                onChange={(urls) => {
                  const el = document.getElementById("blog-drawer-cover") as HTMLInputElement;
                  if (el && urls[0]) el.value = urls[0];
                }}
              />
              <input
                id="blog-drawer-cover"
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
                {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Publish Article"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </div>
  );
}
