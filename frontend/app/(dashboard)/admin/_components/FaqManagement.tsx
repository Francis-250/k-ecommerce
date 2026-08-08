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

export function FaqManagement() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages.faq"],
    queryFn: () => authFetch<{ success: boolean; setting?: { value: any } }>("/store-settings/public/pages.faq"),
  });

  const pageData = data?.setting?.value || {
    title: "Frequently asked questions",
    introHeading: "Below are frequently asked questions; you may find the answer for yourself.",
    introText: "Have questions about ordering, shipping, sizing, or returns? Find quick answers below.",
    items: [
      { question: "What are your delivery times and shipping costs?", answer: "Standard shipping takes 3-5 business days. Express shipping delivers within 1-2 business days." },
      { question: "What is your return and exchange policy?", answer: "We accept returns within 30 days of purchase provided items are unworn with original tags attached." },
      { question: "How do I choose the correct size?", answer: "Check our size guide on each product page for detailed measurements." },
    ],
  };

  const faqItems = pageData.items || [];

  const filtered = useMemo(() => {
    return faqItems.filter((item: any) =>
      `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [faqItems, query]);

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE
  );

  const saveMutation = useMutation({
    mutationFn: (updatedPageData: any) =>
      authFetch("/store-settings/pages.faq", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.faq", value: updatedPageData }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.faq"] });
      toast.success("FAQ item saved");
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
    if (!window.confirm("Delete this FAQ item?")) return;
    const nextItems = faqItems.filter((_: any, i: number) => i !== index);
    saveMutation.mutate({ ...pageData, items: nextItems });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const question = String(form.get("question")).trim();
    const answer = String(form.get("answer")).trim();

    const newItem = { question, answer };
    let nextItems = [...faqItems];
    if (editingIndex !== null) {
      nextItems[editingIndex] = newItem;
    } else {
      nextItems.push(newItem);
    }

    saveMutation.mutate({ ...pageData, items: nextItems });
  }

  const editingItem = editingIndex !== null ? faqItems[editingIndex] : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Frequently Asked Questions"
        description="Manage questions and answers displayed on the storefront FAQ page."
        actionLabel="Add FAQ Item"
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
            placeholder="Search FAQ questions or answers..."
            className={fieldClass}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
          <LoaderCircle className="animate-spin text-slate-900" size={28} />
          <p className="text-xs font-medium text-slate-500">Loading FAQ items...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">No FAQ items found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Answer</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((item: any, idx: number) => (
                  <tr key={item.question + idx} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900 text-sm max-w-xs">
                      {item.question}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md">
                      {item.answer}
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
          title={editingItem ? "Edit FAQ Item" : "Add FAQ Item"}
          description="Enter question and detailed answer."
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 p-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Question *</label>
              <input
                name="question"
                defaultValue={editingItem?.question || ""}
                required
                className={fieldClass}
                placeholder="e.g. What is your return policy?"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Answer *</label>
              <textarea
                name="answer"
                defaultValue={editingItem?.answer || ""}
                rows={6}
                required
                className={fieldClass}
                placeholder="Detailed answer text..."
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
                {saveMutation.isPending ? "Saving..." : editingItem ? "Save Changes" : "Create FAQ Item"}
              </button>
            </div>
          </form>
        </CatalogModal>
      )}
    </div>
  );
}
