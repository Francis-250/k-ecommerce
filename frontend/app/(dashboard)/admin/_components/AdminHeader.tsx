"use client";

import {
  Bell,
  ChevronDown,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

export function AdminHeader({
  collapsed,
  onToggleSidebar,
  onOpenMobile,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-slate-200 bg-white px-4 sm:px-5 lg:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:grid"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen size={19} strokeWidth={1.75} />
        ) : (
          <PanelLeftClose size={19} strokeWidth={1.75} />
        )}
      </button>

      <form className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
          strokeWidth={1.75}
        />
        <input
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
          placeholder="Search products, orders..."
          aria-label="Search admin"
        />
      </form>

      <button
        className="relative grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="Notifications"
      >
        <Bell size={19} strokeWidth={1.75} />
        <span className="absolute right-2 top-2 size-[7px] rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <button
        className="hidden size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:grid"
        aria-label="Messages"
      >
        <MessageSquareText size={19} strokeWidth={1.75} />
      </button>

      <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

      <button className="flex shrink-0 items-center gap-2 rounded-md p-1 pr-2 hover:bg-slate-100">
        <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-xs font-semibold text-white">
          AD
        </span>
        <span className="hidden text-left xl:block">
          <span className="block text-sm font-medium leading-tight text-slate-800">
            Admin User
          </span>
          <span className="block text-[11px] leading-tight text-slate-500">
            Store manager
          </span>
        </span>
        <ChevronDown
          className="hidden text-slate-400 sm:block"
          size={14}
          strokeWidth={2}
        />
      </button>
    </header>
  );
}
