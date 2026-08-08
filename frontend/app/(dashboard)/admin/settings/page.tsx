"use client";

import {
  Bell,
  CheckCircle2,
  CreditCard,
  FileText,
  Globe2,
  ImageIcon,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { ImageUploadField } from "../_components/AdminFormUI";
import { StorefrontAppearanceSettings } from "../_components/StorefrontAppearanceSettings";
import { AdminContentManagement } from "../_components/AdminContentManagement";

type SettingItem = {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  group: string;
};

const ALL_ITEMS: SettingItem[] = [
  {
    id: "appearance",
    label: "Branding & Banners",
    icon: ImageIcon,
    badge: "Live",
    group: "Storefront",
  },
  {
    id: "store",
    label: "Store Identity",
    icon: Store,
    group: "Storefront",
  },
  {
    id: "regional",
    label: "Regional & Locale",
    icon: Globe2,
    group: "Preferences",
  },
  {
    id: "payments",
    label: "Payment Gateways",
    icon: CreditCard,
    badge: "Stripe",
    group: "Preferences",
  },
  {
    id: "notifications",
    label: "Alert Notifications",
    icon: Bell,
    group: "Administration",
  },
  {
    id: "account",
    label: "Admin Profile",
    icon: UserRound,
    group: "Administration",
  },
];

export type GeneralStoreSettings = {
  storeName: string;
  supportEmail: string;
  phone: string;
  customDomain: string;
  businessAddress: string;
  logoUrl: string;
  currency: string;
  language: string;
  timezone: string;
  weightUnit: string;
  stripeEnabled: boolean;
  stripeConnected: boolean;
  notifyNewOrders: boolean;
  notifyLowInventory: boolean;
  notifyCustomerDigest: boolean;
  adminName: string;
  adminEmail: string;
  currentPassword: string;
  newPassword: string;
  adminAvatarUrl: string;
};

const DEFAULT_SETTINGS: GeneralStoreSettings = {
  storeName: "I-RAS STYLES",
  supportEmail: "support@irasstyles.com",
  phone: "+1 202 555 0100",
  customDomain: "irasstyles.com",
  businessAddress: "New York, NY, United States",
  logoUrl: "",
  currency: "USD ($)",
  language: "English (US)",
  timezone: "America/New_York (EST)",
  weightUnit: "Kilograms (kg)",
  stripeEnabled: true,
  stripeConnected: true,
  notifyNewOrders: true,
  notifyLowInventory: true,
  notifyCustomerDigest: false,
  adminName: "Admin Manager",
  adminEmail: "admin@irasstyles.com",
  currentPassword: "",
  newPassword: "",
  adminAvatarUrl: "",
};

const STORAGE_KEY = "k_ecommerce_admin_settings_v1";

import {
  saveGeneralStoreSettings,
  useGeneralStoreSettings,
} from "@/features/admin/hooks/useGeneralStoreSettings";

export default function SettingsPage() {
  const [tab, setTab] = useState("appearance");
  const initialSettings = useGeneralStoreSettings();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync settings state when global settings change
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const updateSetting = <K extends keyof GeneralStoreSettings>(
    key: K,
    value: GeneralStoreSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      saveGeneralStoreSettings(settings);
      await new Promise((resolve) => setTimeout(resolve, 400)); // simulate async save
      toast.success("Store settings updated & saved across the site!");
      if (settings.newPassword) {
        updateSetting("currentPassword", "");
        updateSetting("newPassword", "");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-900 font-sans max-w-6xl mx-auto">
      <AdminPageHeader
        title="Store Settings"
        description="Manage store branding, homepage banners, domain identity, regional localization, and payment methods."
      />

      {/* Top Horizontal Navigation Tab Bar */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-none pb-0.5" aria-label="Settings Tabs">
          {ALL_ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`group inline-flex items-center gap-2 border-b-2 py-3 px-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-500"}
                />
                <span>{label}</span>
                {badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Settings Content Form */}
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden"
      >
        <header className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900 text-sm sm:text-base">
              {ALL_ITEMS.find((item) => item.id === tab)?.label}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configure your store configurations and general preferences.
            </p>
          </div>
          <span className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-xs">
            <ShieldCheck size={16} />
          </span>
        </header>

        <div className="p-6 sm:p-8">
          {tab === "appearance" && <StorefrontAppearanceSettings />}

          {tab === "content" && <AdminContentManagement />}

          {tab === "store" && (
            <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_300px]">
              <div className="grid content-start gap-5 sm:grid-cols-2">
                <Field
                  label="Store Name"
                  value={settings.storeName}
                  onChange={(val) => updateSetting("storeName", val)}
                  icon={<Store size={14} />}
                />
                <Field
                  label="Support Email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(val) => updateSetting("supportEmail", val)}
                  icon={<Mail size={14} />}
                />
                <Field
                  label="Phone Number"
                  value={settings.phone}
                  onChange={(val) => updateSetting("phone", val)}
                  icon={<Phone size={14} />}
                />
                <Field
                  label="Custom Domain"
                  value={settings.customDomain}
                  onChange={(val) => updateSetting("customDomain", val)}
                  icon={<Globe2 size={14} />}
                />
                <Field
                  label="Business Address"
                  wide
                  value={settings.businessAddress}
                  onChange={(val) => updateSetting("businessAddress", val)}
                  icon={<MapPin size={14} />}
                />
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 space-y-3">
                <ImageUploadField
                  label="Official Store Logo"
                  description="Used in order receipts, customer emails, and invoices."
                  aspect="logo"
                  initialUrls={settings.logoUrl ? [settings.logoUrl] : []}
                  onChange={(urls) => updateSetting("logoUrl", urls[0] ?? "")}
                />
              </div>
            </div>
          )}

          {tab === "regional" && (
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
              <Select
                label="Default Store Currency"
                value={settings.currency}
                onChange={(val) => updateSetting("currency", val)}
                options={["USD ($)", "EUR (€)", "GBP (£)"]}
              />
              <Select
                label="Default Display Language"
                value={settings.language}
                onChange={(val) => updateSetting("language", val)}
                options={["English (US)", "French (FR)"]}
              />
              <Select
                label="Primary Timezone"
                value={settings.timezone}
                onChange={(val) => updateSetting("timezone", val)}
                options={[
                  "America/New_York (EST)",
                  "Africa/Kigali (CAT)",
                  "UTC",
                ]}
              />
              <Select
                label="Weight Measurement Unit"
                value={settings.weightUnit}
                onChange={(val) => updateSetting("weightUnit", val)}
                options={["Kilograms (kg)", "Pounds (lbs)"]}
              />
            </div>
          )}

          {tab === "payments" && (
            <div className="max-w-3xl space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-lg bg-zinc-900 text-white font-bold text-base">
                    S
                  </span>
                  <div>
                    <h4 className="font-semibold text-zinc-900 text-sm">
                      Stripe Payment Gateway
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Accept credit cards, Apple Pay & Google Pay securely.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-800">
                  <CheckCircle2 size={13} className="text-zinc-900" /> Connected
                </span>
              </div>
              <Toggle
                title="Enable Stripe Live Payments"
                description="Allow real customer credit card transactions on checkout."
                checked={settings.stripeEnabled}
                onChange={(checked) => updateSetting("stripeEnabled", checked)}
              />
            </div>
          )}

          {tab === "notifications" && (
            <div className="max-w-3xl space-y-1 divide-y divide-zinc-100">
              <Toggle
                title="New Order Email Notifications"
                description="Send instant email alerts to store managers when a customer completes an order."
                checked={settings.notifyNewOrders}
                onChange={(checked) => updateSetting("notifyNewOrders", checked)}
              />
              <Toggle
                title="Low Inventory Alerts"
                description="Automatically trigger low stock warning notifications when product count drops below threshold."
                checked={settings.notifyLowInventory}
                onChange={(checked) => updateSetting("notifyLowInventory", checked)}
              />
              <Toggle
                title="Customer Registration Digest"
                description="Receive daily summary reports of new user account registrations."
                checked={settings.notifyCustomerDigest}
                onChange={(checked) => updateSetting("notifyCustomerDigest", checked)}
              />
            </div>
          )}

          {tab === "account" && (
            <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_300px]">
              <div className="grid content-start gap-5 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={settings.adminName}
                  onChange={(val) => updateSetting("adminName", val)}
                  icon={<UserRound size={14} />}
                />
                <Field
                  label="Account Email"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(val) => updateSetting("adminEmail", val)}
                  icon={<Mail size={14} />}
                />
                <Field
                  label="Current Password"
                  type="password"
                  value={settings.currentPassword}
                  onChange={(val) => updateSetting("currentPassword", val)}
                  icon={<Lock size={14} />}
                />
                <Field
                  label="New Password"
                  type="password"
                  value={settings.newPassword}
                  onChange={(val) => updateSetting("newPassword", val)}
                  icon={<Lock size={14} />}
                />
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 space-y-3">
                <ImageUploadField
                  label="Admin Avatar Profile"
                  description="Shown in the top right header profile avatar."
                  initialUrls={settings.adminAvatarUrl ? [settings.adminAvatarUrl] : []}
                  onChange={(urls) => updateSetting("adminAvatarUrl", urls[0] ?? "")}
                />
              </div>
            </div>
          )}
        </div>

        {tab !== "appearance" && (
          <footer className="flex justify-end border-t border-zinc-100 bg-zinc-50/50 px-6 py-3.5">
            <button
              type="submit"
              disabled={isSaving}
              className="flex min-h-9 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {isSaving ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </footer>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  wide,
  icon,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
  icon?: React.ReactNode;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label
      className={`text-xs font-medium text-zinc-700 ${wide ? "sm:col-span-2" : ""}`}
      htmlFor={id}
    >
      <span className="flex items-center gap-1.5 mb-1.5 text-zinc-800">
        {icon && <span className="text-zinc-400">{icon}</span>}
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs font-normal text-zinc-900 shadow-2xs outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="text-xs font-medium text-zinc-700">
      <span className="block mb-1.5 text-zinc-800">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs font-normal text-zinc-900 shadow-2xs outline-none transition hover:border-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className="flex items-center justify-between gap-4 py-3.5 cursor-pointer"
    >
      <div className="space-y-0.5">
        <strong className="block text-xs sm:text-sm font-medium text-zinc-900">
          {title}
        </strong>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
      <div
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
          checked ? "bg-zinc-900" : "bg-zinc-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0.5 mt-0.5"
          }`}
        />
      </div>
    </label>
  );
}

