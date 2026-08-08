"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderKanban,
  FolderTree,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tags,
  TicketPercent,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useGeneralStoreSettings } from "@/features/admin/hooks/useGeneralStoreSettings";
import { useAuthStore } from "@/features/auth/store";
import { toast } from "sonner";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Brands", href: "/admin/brands", icon: Tags },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/users", icon: Users },
] as const;

const contentSubItems = [
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
  { label: "About Us", href: "/admin/about", icon: Info },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Contact", href: "/admin/contact", icon: Mail },
] as const;

const bottomLinks = [
  { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
] as const;

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const settings = useGeneralStoreSettings();

  const isContentRoute = [
    "/admin/blog",
    "/admin/portfolio",
    "/admin/about",
    "/admin/services",
    "/admin/faq",
    "/admin/contact",
  ].some((route) => pathname.startsWith(route));

  const [contentMenuOpen, setContentMenuOpen] = useState(isContentRoute);

  const initials = (settings.storeName || "IR")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      // ignore
    } finally {
      router.push("/login");
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out lg:z-30 ${
          mobileOpen ? "left-0" : "-left-72 lg:left-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link
            href="/admin"
            className={`flex items-center gap-3 font-semibold !text-slate-900 !no-underline ${collapsed ? "justify-center w-full" : ""}`}
          >
            {settings.adminAvatarUrl ? (
              <Image
                src={settings.adminAvatarUrl}
                alt={settings.storeName || ""}
                width={36}
                height={36}
                unoptimized
                className="size-9 rounded-lg object-cover"
              />
            ) : (
              <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white shadow-sm">
                {initials}
              </span>
            )}
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight !text-slate-950">
                  {settings.storeName}
                </span>
                <span className="text-[11px] font-medium !text-slate-500">
                  Control Center
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
          <nav className="space-y-1">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onCloseMobile}
                  className={`flex h-10 items-center rounded-md text-sm font-medium transition-colors !no-underline ${
                    active
                      ? "bg-slate-900 font-semibold !text-white shadow-xs"
                      : "!text-slate-600 hover:bg-slate-100 hover:!text-slate-950"
                  } ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.75}
                    className={active ? "text-white" : "text-slate-500"}
                  />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}

            {/* Collapsible Store Content Dropdown Menu */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setContentMenuOpen((v) => !v)}
                className={`flex h-10 w-full items-center justify-between rounded-md text-sm font-medium transition-colors !no-underline ${
                  isContentRoute
                    ? "bg-slate-100 !text-slate-900"
                    : "!text-slate-600 hover:bg-slate-100 hover:!text-slate-900"
                } ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
              >
                <div className="flex items-center gap-3">
                  <FileText
                    size={18}
                    strokeWidth={1.75}
                    className="text-slate-500"
                  />
                  {!collapsed && <span className="text-sm font-medium">Store Content</span>}
                </div>
                {!collapsed && (
                  contentMenuOpen ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )
                )}
              </button>

              {(!collapsed && contentMenuOpen) && (
                <div className="space-y-1 pl-3 border-l-2 border-slate-200 ml-3.5 my-1 animate-in fade-in-50 duration-150">
                  {contentSubItems.map(({ label, href, icon: SubIcon }) => {
                    const isSubActive = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={onCloseMobile}
                        className={`flex h-10 items-center rounded-md text-sm font-medium transition-colors gap-3 px-3 !no-underline ${
                          isSubActive
                            ? "bg-slate-900 font-semibold !text-white shadow-xs"
                            : "!text-slate-600 hover:bg-slate-100 hover:!text-slate-950"
                        }`}
                      >
                        <SubIcon
                          size={18}
                          strokeWidth={isSubActive ? 2.2 : 1.75}
                          className={isSubActive ? "text-white" : "text-slate-500"}
                        />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {bottomLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onCloseMobile}
                  className={`flex h-10 items-center rounded-md text-sm font-medium transition-colors !no-underline ${
                    active
                      ? "bg-slate-900 font-semibold !text-white shadow-xs"
                      : "!text-slate-600 hover:bg-slate-100 hover:!text-slate-950"
                  } ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.75}
                    className={active ? "text-white" : "text-slate-500"}
                  />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-0.5 border-t border-slate-200 pt-3">
            <Link
              href="/admin/settings"
              className={`flex h-10 items-center rounded-md text-sm font-normal !text-slate-600 !no-underline hover:bg-slate-100 hover:!text-slate-950 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
            >
              <Settings
                size={18}
                strokeWidth={1.75}
                className="text-slate-500"
              />
              {!collapsed && <span>Settings</span>}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex h-10 w-full items-center rounded-md text-sm font-normal !text-slate-600 !no-underline hover:bg-red-50 hover:!text-red-600 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
            >
              <LogOut size={18} strokeWidth={1.75} className="text-slate-500" />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
