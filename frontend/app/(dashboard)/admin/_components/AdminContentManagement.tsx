"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  FolderKanban,
  HelpCircle,
  Info,
  LoaderCircle,
  Mail,
  Newspaper,
  Plus,
  Save,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "./AdminFormUI";

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

export function AdminContentManagement({
  defaultSubtab = "blog",
}: {
  defaultSubtab?: "blog" | "portfolio" | "about" | "services" | "faq" | "contact";
} = {}) {
  const [activeTab, setActiveTab] = useState<
    "blog" | "portfolio" | "about" | "services" | "faq" | "contact"
  >(defaultSubtab);

  const tabs = [
    { id: "blog", label: "Blog & Journal", icon: Newspaper },
    { id: "portfolio", label: "Portfolio Work", icon: FolderKanban },
    { id: "about", label: "About Us Page", icon: Info },
    { id: "services", label: "Services Page", icon: Wrench },
    { id: "faq", label: "FAQ Page", icon: HelpCircle },
    { id: "contact", label: "Contact Info", icon: Mail },
  ] as const;

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-2xs">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "blog" && <BlogArticlesManager />}
      {activeTab === "portfolio" && <PortfolioProjectsManager />}
      {activeTab === "about" && <AboutPageEditor />}
      {activeTab === "services" && <ServicesPageEditor />}
      {activeTab === "faq" && <FaqPageEditor />}
      {activeTab === "contact" && <ContactPageEditor />}
    </div>
  );
}

/* 1. BLOG ARTICLES MANAGER */
function BlogArticlesManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () => authFetch<{ success: boolean; data: any[] }>("/articles?admin=true"),
  });

  const articles = data?.data || [];

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
      toast.success("Blog article saved successfully!");
      setEditing(null);
      setIsCreating(false);
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

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
        <LoaderCircle className="animate-spin text-slate-900" size={24} />
        <p className="text-xs text-slate-500">Loading blog articles...</p>
      </div>
    );
  }

  if (isCreating || editing) {
    const initial = editing || {
      title: "",
      slug: "",
      authorName: "Journal",
      excerpt: "",
      content: "",
      coverImageUrl: "",
    };

    return (
      <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-950">
          {editing ? "Edit Blog Article" : "Create New Blog Article"}
        </h3>
        <form
          onSubmit={(e) => {
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
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700">Title</label>
            <input
              name="title"
              defaultValue={initial.title}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="e.g. Building a Timeless Wardrobe"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Category / Author</label>
            <input
              name="authorName"
              defaultValue={initial.authorName}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="e.g. Style Guide"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Excerpt</label>
            <textarea
              name="excerpt"
              defaultValue={initial.excerpt}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Short summary of the story..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Content</label>
            <textarea
              name="content"
              defaultValue={initial.content}
              rows={5}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Full article content..."
            />
          </div>
          <div>
            <ImageUploadField
              label="Cover Image"
              description="Upload high quality image (JPG, PNG, WebP)"
              initialUrls={initial.coverImageUrl ? [initial.coverImageUrl] : []}
              onChange={(urls) => {
                const el = document.getElementById("blog-cover-url") as HTMLInputElement;
                if (el && urls[0]) el.value = urls[0];
              }}
            />
            <input id="blog-cover-url" name="coverImageUrl" defaultValue={initial.coverImageUrl} type="hidden" />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving..." : "Save Article"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsCreating(false);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Blog Articles</h3>
          <p className="text-xs text-slate-500">Manage journal stories and style guides published on your storefront.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={14} /> Add New Article
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((item: any) => (
          <div key={item.id || item.slug} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF4A]">
                {item.authorName || "Journal"}
              </span>
              <h4 className="mt-1 font-bold text-slate-900 text-sm">{item.title}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.excerpt || item.content}</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => setEditing(item)}
                className="font-semibold text-slate-900 hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2. PORTFOLIO PROJECTS MANAGER */
function PortfolioProjectsManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "portfolio"],
    queryFn: () => authFetch<{ success: boolean; projects: any[] }>("/portfolio-projects?admin=true"),
  });

  const projects = data?.projects || [];

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
      toast.success("Portfolio project saved!");
      setEditing(null);
      setIsCreating(false);
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

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
        <LoaderCircle className="animate-spin text-slate-900" size={24} />
        <p className="text-xs text-slate-500">Loading portfolio projects...</p>
      </div>
    );
  }

  if (isCreating || editing) {
    const initial = editing || {
      title: "",
      slug: "",
      client: "I-RAS STYLES Studio",
      category: "Editorial",
      description: "",
      content: "",
      coverImageUrl: "",
    };

    return (
      <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-950">
          {editing ? "Edit Portfolio Project" : "Create New Portfolio Project"}
        </h3>
        <form
          onSubmit={(e) => {
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
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700">Project Title</label>
            <input
              name="title"
              defaultValue={initial.title}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="e.g. Quiet Luxury Editorial"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Client</label>
              <input
                name="client"
                defaultValue={initial.client}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <input
                name="category"
                defaultValue={initial.category}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Summary / Description</label>
            <textarea
              name="description"
              defaultValue={initial.description}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Full Details</label>
            <textarea
              name="content"
              defaultValue={initial.content}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <ImageUploadField
              label="Cover Image"
              description="Upload high quality image (JPG, PNG, WebP)"
              initialUrls={initial.coverImageUrl ? [initial.coverImageUrl] : []}
              onChange={(urls) => {
                const el = document.getElementById("port-cover-url") as HTMLInputElement;
                if (el && urls[0]) el.value = urls[0];
              }}
            />
            <input id="port-cover-url" name="coverImageUrl" defaultValue={initial.coverImageUrl} type="hidden" />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving..." : "Save Project"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsCreating(false);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Portfolio Projects</h3>
          <p className="text-xs text-slate-500">Manage campaigns, lookbooks, and editorials shown in your portfolio.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={14} /> Add New Project
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((item: any) => (
          <div key={item.id || item.slug} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {item.category || "Editorial"} · {item.client}
              </span>
              <h4 className="mt-1 font-bold text-slate-900 text-sm">{item.title}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.description || item.content}</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => setEditing(item)}
                className="font-semibold text-slate-900 hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 3. ABOUT PAGE EDITOR */
function AboutPageEditor() {
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
  };

  const saveMutation = useMutation({
    mutationFn: (value: any) =>
      authFetch("/store-settings/pages.about", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.about", value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.about"] });
      toast.success("About page contents updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-xs text-slate-500">Loading About page settings...</p>;

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">About Us Page Content</h3>
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
          });
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Eyebrow Badge</label>
            <input name="eyebrow" defaultValue={initial.eyebrow} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Est. Year Tag</label>
            <input name="since" defaultValue={initial.since} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Main Title</label>
          <input name="title" defaultValue={initial.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Sub-description</label>
          <textarea name="description" defaultValue={initial.description} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Story Section Heading</label>
          <input name="heading" defaultValue={initial.heading} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Paragraph 1</label>
          <textarea name="p1" defaultValue={initial.paragraphs?.[0] || ""} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Paragraph 2</label>
          <textarea name="p2" defaultValue={initial.paragraphs?.[1] || ""} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save About Content"}
        </button>
      </form>
    </div>
  );
}

/* 4. SERVICES PAGE EDITOR */
function ServicesPageEditor() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages.services"],
    queryFn: () => authFetch<{ success: boolean; setting?: { value: any } }>("/store-settings/public/pages.services"),
  });

  const initial = data?.setting?.value || {
    heading: "OUR SERVICES",
    subheading: "Thoughtful solutions crafted to elevate fashion brands and retail experiences.",
  };

  const saveMutation = useMutation({
    mutationFn: (value: any) =>
      authFetch("/store-settings/pages.services", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.services", value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.services"] });
      toast.success("Services page content updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-xs text-slate-500">Loading Services page settings...</p>;

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">Services Page Content</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          saveMutation.mutate({
            ...initial,
            heading: String(form.get("heading")),
            subheading: String(form.get("subheading")),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700">Services Header</label>
          <input name="heading" defaultValue={initial.heading} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Services Subtitle</label>
          <textarea name="subheading" defaultValue={initial.subheading} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save Services Content"}
        </button>
      </form>
    </div>
  );
}

/* 5. FAQ PAGE EDITOR */
function FaqPageEditor() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages.faq"],
    queryFn: () => authFetch<{ success: boolean; setting?: { value: any } }>("/store-settings/public/pages.faq"),
  });

  const initial = data?.setting?.value || {
    title: "Frequently asked questions",
    introHeading: "Below are frequently asked questions; you may find the answer for yourself.",
    introText: "Have questions about ordering, shipping, sizing, or returns? Find quick answers below.",
  };

  const saveMutation = useMutation({
    mutationFn: (value: any) =>
      authFetch("/store-settings/pages.faq", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.faq", value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.faq"] });
      toast.success("FAQ page updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-xs text-slate-500">Loading FAQ settings...</p>;

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">FAQ Page Content</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          saveMutation.mutate({
            ...initial,
            title: String(form.get("title")),
            introHeading: String(form.get("introHeading")),
            introText: String(form.get("introText")),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700">FAQ Title</label>
          <input name="title" defaultValue={initial.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Intro Subheading</label>
          <input name="introHeading" defaultValue={initial.introHeading} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Intro Text</label>
          <textarea name="introText" defaultValue={initial.introText} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save FAQ Settings"}
        </button>
      </form>
    </div>
  );
}

/* 6. CONTACT PAGE EDITOR */
function ContactPageEditor() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages.contact"],
    queryFn: () => authFetch<{ success: boolean; setting?: { value: any } }>("/store-settings/public/pages.contact"),
  });

  const initial = data?.setting?.value || {
    title: "Tell us your project",
    sidebarTitle: "Contact us",
    sidebarDescription: "We would love to hear from you. Reach out with questions, inquiries, or custom project requests.",
    address: "No 40 Baria Street 133/2, New York City",
    email: "info@roadthemes.com",
    phone: "0 (1234) 567 890",
    workingHours: "Monday – Saturday: 08AM – 22PM",
    storeNotice: "Visit our flagship store at No 40 Baria Street 133/2, New York City",
  };

  const saveMutation = useMutation({
    mutationFn: (value: any) =>
      authFetch("/store-settings/pages.contact", {
        method: "PUT",
        body: JSON.stringify({ key: "pages.contact", value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages.contact"] });
      toast.success("Contact info updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-xs text-slate-500">Loading Contact page settings...</p>;

  return (
    <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">Contact Information & Store Notice</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          saveMutation.mutate({
            ...initial,
            title: String(form.get("title")),
            sidebarTitle: String(form.get("sidebarTitle")),
            sidebarDescription: String(form.get("sidebarDescription")),
            address: String(form.get("address")),
            email: String(form.get("email")),
            phone: String(form.get("phone")),
            workingHours: String(form.get("workingHours")),
            storeNotice: String(form.get("storeNotice")),
          });
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Contact Form Title</label>
            <input name="title" defaultValue={initial.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Sidebar Heading</label>
            <input name="sidebarTitle" defaultValue={initial.sidebarTitle} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Sidebar Description</label>
          <textarea name="sidebarDescription" defaultValue={initial.sidebarDescription} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Address</label>
            <input name="address" defaultValue={initial.address} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <input name="email" defaultValue={initial.email} type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
            <input name="phone" defaultValue={initial.phone} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Working Hours</label>
            <input name="workingHours" defaultValue={initial.workingHours} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Store Notice / Flagship Store Address</label>
          <input name="storeNotice" defaultValue={initial.storeNotice} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save Contact Info"}
        </button>
      </form>
    </div>
  );
}
