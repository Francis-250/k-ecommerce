"use client";

import Image from "next/image";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useInventoryAlerts,
  useMarkAlertsAsRead,
} from "@/features/admin/catalog/hooks";
import { useGeneralStoreSettings } from "@/features/admin/hooks/useGeneralStoreSettings";

export function AdminHeader({
  collapsed,
  onToggleSidebar,
  onOpenMobile,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const settings = useGeneralStoreSettings();
  const adminInitials = (settings.adminName || "AD")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const { data: alertsData, isLoading } = useInventoryAlerts();
  const markReadMutation = useMarkAlertsAsRead();

  const alerts = alertsData?.alerts ?? [];
  const unreadAlerts = alerts.filter((a) => !a.read);
  const alertCount = unreadAlerts.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleAlertClick = (link: string) => {
    setNotificationsOpen(false);
    if (link) {
      router.push(link);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-5 lg:px-6">
        <button
          type="button"
          onClick={onOpenMobile}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:grid"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} strokeWidth={1.75} />
          ) : (
            <PanelLeftClose size={19} strokeWidth={1.75} />
          )}
        </button>

        {/* Desktop Search Bar */}
        <form className="relative ml-auto hidden w-full max-w-sm md:block">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
            strokeWidth={1.75}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
            placeholder="Search products, orders, customers..."
            aria-label="Search admin"
          />
        </form>

        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
          className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
          aria-label="Toggle mobile search"
        >
          <Search size={19} strokeWidth={1.75} />
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="Notifications"
          >
            <Bell size={19} strokeWidth={1.75} />
            {alertCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-[-0.5rem] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <header className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Notifications
                  </h3>
                  {alertCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                      {alertCount} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {alertCount > 0 && (
                    <button
                      onClick={() => markReadMutation.mutate()}
                      disabled={markReadMutation.isPending}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </header>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {isLoading ? (
                  <p className="p-4 text-center text-xs text-slate-400">
                    Checking store notifications...
                  </p>
                ) : alerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check size={20} />
                    </span>
                    <p className="text-xs font-medium text-slate-800">
                      All notifications clear!
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No active stock or promo alerts.
                    </p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleAlertClick(alert.link)}
                      className={`group cursor-pointer rounded-lg border p-3 text-xs transition hover:shadow-xs ${
                        alert.read
                          ? "border-slate-200 bg-slate-50/50 text-slate-600 opacity-70"
                          : alert.type === "OUT_OF_STOCK"
                            ? "border-rose-200 bg-rose-50/60 text-rose-900 hover:bg-rose-50"
                            : alert.type === "EXPIRED_COUPON"
                              ? "border-blue-200 bg-blue-50/60 text-blue-900 hover:bg-blue-50"
                              : "border-amber-200 bg-amber-50/60 text-amber-900 hover:bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold">
                          {alert.type === "OUT_OF_STOCK" ? (
                            <AlertOctagon size={15} className="text-rose-600 shrink-0" />
                          ) : alert.type === "EXPIRED_COUPON" ? (
                            <Tag size={15} className="text-blue-600 shrink-0" />
                          ) : (
                            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                          )}
                          <span className="group-hover:underline">{alert.title}</span>
                        </div>
                        {alert.sku && (
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">
                            {alert.sku}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-snug">
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <footer className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Auto-synced via node-cron
                </span>
                <Link
                  href="/admin/inventory"
                  onClick={() => setNotificationsOpen(false)}
                  className="flex items-center gap-1 font-semibold text-slate-900 hover:underline"
                >
                  View Inventory <ExternalLink size={12} />
                </Link>
              </footer>
            </div>
          )}
        </div>

        <button
          className="hidden size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:grid"
          aria-label="Messages"
        >
          <MessageSquareText size={19} strokeWidth={1.75} />
        </button>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <button className="flex shrink-0 items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 transition-colors">
          {settings.adminAvatarUrl ? (
            <Image
              src={settings.adminAvatarUrl}
              alt={settings.adminName}
              width={32}
              height={32}
              unoptimized
              className="size-8 rounded-lg object-cover"
            />
          ) : (
            <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-xs font-semibold text-white">
              {adminInitials}
            </span>
          )}
          <span className="hidden text-left xl:block">
            <span className="block text-sm font-medium leading-tight text-slate-800">
              {settings.adminName}
            </span>
            <span className="block text-[11px] leading-tight text-slate-500">
              {settings.adminEmail || "Store manager"}
            </span>
          </span>
          <ChevronDown
            className="hidden text-slate-400 sm:block"
            size={14}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="border-t border-slate-100 p-3 md:hidden bg-slate-50 animate-in slide-in-from-top-1 duration-150">
          <form className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              autoFocus
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
              placeholder="Search products, orders..."
            />
          </form>
        </div>
      )}
    </header>
  );
}
