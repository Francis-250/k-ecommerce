"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
  X,
} from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: PackageSearch },
  { label: "Customers", href: "/admin/users", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Brands", href: "/admin/brands", icon: Tags },
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
        className={`fixed inset-y-0 left-0 z-50 flex bg-white transition-all duration-200 ${collapsed ? "w-[72px]" : "w-60"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex min-w-0 flex-1 flex-col border-r border-slate-200">
          <div
            className={`flex h-16 items-center border-b border-slate-200 ${collapsed ? "justify-center px-3" : "justify-between px-5"}`}
          >
            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-2.5"
              aria-label="Coron admin dashboard"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-emerald-600 text-xs font-semibold text-white">
                CO
              </span>
              {!collapsed && (
                <span className="truncate text-[15px] font-semibold text-slate-800">
                  Coron
                </span>
              )}
            </Link>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          <nav
            className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
            aria-label="Admin navigation"
          >
            {!collapsed && (
              <p className="px-3 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Store
              </p>
            )}
            {links.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === href
                  : pathname.startsWith(href);
              return (
                <Link
                  title={collapsed ? label : undefined}
                  key={href}
                  href={href}
                  onClick={onCloseMobile}
                  className={`group flex h-10 items-center rounded-md text-sm transition-colors ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ${
                    active
                      ? "bg-emerald-50 font-normal text-black"
                      : "font-normal text-black hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.75}
                    className={active ? "text-black" : "text-black"}
                  />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-0.5 border-t border-slate-200 p-3">
            <Link
              href="/admin/settings"
              className={`flex h-10 items-center rounded-md text-sm font-normal text-black hover:bg-slate-100 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
            >
              <Settings size={18} strokeWidth={1.75} className="text-black" />
              {!collapsed && <span>Settings</span>}
            </Link>
            <Link
              href="/login"
              className={`flex h-10 items-center rounded-md text-sm font-normal text-black hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
            >
              <LogOut size={18} strokeWidth={1.75} className="text-black" />
              {!collapsed && <span>Log out</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
