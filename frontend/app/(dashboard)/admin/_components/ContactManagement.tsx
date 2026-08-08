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

export function ContactManagement() {
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
      toast.success("Contact info updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
        <LoaderCircle className="animate-spin text-slate-900" size={28} />
        <p className="text-xs font-medium text-slate-500">Loading contact settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact & Location Settings"
        description="Configure contact info, store addresses, support email, phone numbers, and working hours."
      />

      <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
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
              <input name="title" defaultValue={initial.title} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Sidebar Heading</label>
              <input name="sidebarTitle" defaultValue={initial.sidebarTitle} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Sidebar Description</label>
            <textarea name="sidebarDescription" defaultValue={initial.sidebarDescription} rows={2} className={fieldClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Physical Address</label>
              <input name="address" defaultValue={initial.address} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Contact Email</label>
              <input name="email" defaultValue={initial.email} type="email" className={fieldClass} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
              <input name="phone" defaultValue={initial.phone} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Working Hours</label>
              <input name="workingHours" defaultValue={initial.workingHours} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Store Notice / Flagship Banner</label>
            <input name="storeNotice" defaultValue={initial.storeNotice} className={fieldClass} />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={15} /> {saveMutation.isPending ? "Saving..." : "Save Contact Info"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
