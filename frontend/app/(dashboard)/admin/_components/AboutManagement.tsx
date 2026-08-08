"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "./AdminPageHeader";
import { fieldClass } from "./AdminFormUI";

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

export function AboutManagement() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages.about"],
    queryFn: () => authFetch<{ success: boolean; setting?: { value: any } }>("/store-settings/public/pages.about"),
  });

  const initial = data?.setting?.value || {
    eyebrow: "Our story",
    title: "Style made thoughtful",
    description: "I-RAS STYLES brings together enduring design, honest quality, and an easy sense of individuality.",
    since: "Since 2010",
    heading: "Designed for real wardrobes and real lives",
    paragraphs: [
      "We started I-RAS STYLES with a simple belief: good style should feel considered, useful, and entirely your own.",
      "Our team works across design, sourcing, and storytelling to create collections that balance modern perspective with lasting appeal.",
    ],
    values: [
      { title: "Purposeful design", text: "Every detail should earn its place and make daily life feel easier." },
      { title: "Lasting quality", text: "We favour materials and construction designed to be worn, loved, and kept." },
      { title: "Personal style", text: "Confidence comes from clothes that support the person wearing them." },
    ],
    howWeWork: {
      heading: "Curiosity, craft, and close collaboration",
      text: "From the first sketch to the final fitting, we ask what will make a piece more useful, more expressive, and better made.",
    },
  };

  const saveMutation = useMutation({
    mutationFn: (value: any) =>
      authFetch("/store-settings/pages.about", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.about", value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.about"] });
      toast.success("About Us page content updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
        <LoaderCircle className="animate-spin text-slate-900" size={28} />
        <p className="text-xs font-medium text-slate-500">Loading About page content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="About Us Page"
        description="Configure brand history, story headings, values, and team workflow section."
      />

      <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            saveMutation.mutate({
              ...initial,
              eyebrow: String(form.get("eyebrow")),
              title: String(form.get("title")),
              description: String(form.get("description")),
              since: String(form.get("since")),
              heading: String(form.get("heading")),
              paragraphs: [String(form.get("p1")), String(form.get("p2"))],
              howWeWork: {
                heading: String(form.get("hwwHeading")),
                text: String(form.get("hwwText")),
              },
            });
          }}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Eyebrow Badge</label>
              <input name="eyebrow" defaultValue={initial.eyebrow} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Est. Year Tag</label>
              <input name="since" defaultValue={initial.since} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Main Intro Title</label>
            <input name="title" defaultValue={initial.title} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Sub-description</label>
            <textarea name="description" defaultValue={initial.description} rows={2} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Story Section Heading</label>
            <input name="heading" defaultValue={initial.heading} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Paragraph 1</label>
            <textarea name="p1" defaultValue={initial.paragraphs?.[0] || ""} rows={3} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Paragraph 2</label>
            <textarea name="p2" defaultValue={initial.paragraphs?.[1] || ""} rows={3} className={fieldClass} />
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-sm mb-3">"How We Work" Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Section Title</label>
                <input name="hwwHeading" defaultValue={initial.howWeWork?.heading} className={fieldClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Section Content</label>
                <textarea name="hwwText" defaultValue={initial.howWeWork?.text} rows={3} className={fieldClass} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={15} /> {saveMutation.isPending ? "Saving..." : "Save About Page Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
