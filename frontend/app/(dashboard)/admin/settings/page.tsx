"use client";

import {
  Bell,
  CreditCard,
  Globe2,
  ImageIcon,
  Save,
  Store,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { ImageUploadField } from "../_components/AdminFormUI";
import { StorefrontAppearanceSettings } from "../_components/StorefrontAppearanceSettings";
const tabs = [
  { id: "appearance", label: "Storefront", icon: ImageIcon },
  { id: "store", label: "Store details", icon: Store },
  { id: "regional", label: "Regional", icon: Globe2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: UserRound },
];
export default function SettingsPage() {
  const [tab, setTab] = useState("appearance");
  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Configure your store, regional preferences, payments, and admin account."
      />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav
          className="h-fit rounded-lg border border-slate-200 bg-white p-2"
          aria-label="Settings sections"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${tab === id ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Settings saved");
          }}
          className="rounded-lg border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-800">
              {tabs.find((item) => item.id === tab)?.label}
            </h2>
          </header>
          <div className="p-5">
            {tab === "appearance" && <StorefrontAppearanceSettings />}
            {tab === "store" && (
              <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_260px]">
                <div className="grid content-start gap-4 sm:grid-cols-2">
                  <Field label="Store name" defaultValue="I-RAS STYLES" />
                  <Field
                    label="Support email"
                    type="email"
                    defaultValue="support@irasstyles.com"
                  />
                  <Field label="Phone number" defaultValue="+1 202 555 0100" />
                  <Field label="Store domain" defaultValue="irasstyles.com" />
                  <Field
                    label="Business address"
                    wide
                    defaultValue="New York, United States"
                  />
                </div>
                <ImageUploadField
                  label="Store logo"
                  description="Preview the primary logo used in emails and administrative documents."
                  aspect="logo"
                />
              </div>
            )}
            {tab === "regional" && (
              <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                <Select label="Store currency" options={["USD", "EUR"]} />
                <Select
                  label="Default language"
                  options={["English", "French"]}
                />
                <Select
                  label="Timezone"
                  options={["Africa/Kigali", "Africa/Johannesburg", "UTC"]}
                />
                <Select label="Weight unit" options={["Kilograms", "Pounds"]} />
              </div>
            )}
            {tab === "payments" && (
              <div className="max-w-3xl space-y-3">
                <Toggle
                  title="Stripe"
                  description="Accept U.S. dollar credit and debit card payments securely through Stripe."
                  checked
                />
              </div>
            )}
            {tab === "notifications" && (
              <div className="max-w-3xl space-y-3">
                <Toggle
                  title="New order notifications"
                  description="Email administrators when an order is placed."
                  checked
                />
                <Toggle
                  title="Low stock notifications"
                  description="Notify administrators when inventory falls below 10."
                  checked
                />
                <Toggle
                  title="Customer account alerts"
                  description="Receive alerts for new customer registrations."
                />
              </div>
            )}
            {tab === "account" && (
              <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_240px]">
                <div className="grid content-start gap-4 sm:grid-cols-2">
                  <Field label="Full name" defaultValue="Admin User" />
                  <Field
                    label="Email"
                    type="email"
                    defaultValue="admin@irasstyles.com"
                  />
                  <Field label="Current password" type="password" />
                  <Field label="New password" type="password" />
                </div>
                <ImageUploadField
                  label="Profile image"
                  description="Preview the avatar shown in the admin header."
                />
              </div>
            )}
          </div>
          {tab !== "appearance" && (
            <footer className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
                <Save size={15} />
                Save changes
              </button>
            </footer>
          )}
        </form>
      </div>
    </>
  );
}
function Field({
  label,
  type = "text",
  defaultValue,
  wide,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  wide?: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label
      className={`text-sm font-medium text-slate-700 ${wide ? "sm:col-span-2" : ""}`}
      htmlFor={id}
    >
      {label}
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
      />
    </label>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Toggle({
  title,
  description,
  checked,
}: {
  title: string;
  description: string;
  checked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">
      <span>
        <strong className="block text-sm font-medium text-slate-800">
          {title}
        </strong>
        <small className="text-slate-500">{description}</small>
      </span>
      <input
        type="checkbox"
        defaultChecked={checked}
        className="size-4 accent-slate-900"
      />
    </label>
  );
}
