"use client";

import { useEffect, useState } from "react";

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

export const DEFAULT_GENERAL_SETTINGS: GeneralStoreSettings = {
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

export const ADMIN_SETTINGS_STORAGE_KEY = "k_ecommerce_admin_settings_v1";

export function useGeneralStoreSettings() {
  const [settings, setSettings] = useState<GeneralStoreSettings>(DEFAULT_GENERAL_SETTINGS);

  useEffect(() => {
    function load() {
      try {
        const saved = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
        if (saved) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch {}
    }

    load();

    window.addEventListener("storage", load);
    window.addEventListener("admin-settings-updated", load);

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("admin-settings-updated", load);
    };
  }, []);

  return settings;
}

export function saveGeneralStoreSettings(newSettings: GeneralStoreSettings) {
  localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
  window.dispatchEvent(new Event("admin-settings-updated"));
}
