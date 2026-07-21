import type { ReactNode } from "react";

export function DashboardPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {action}
      </header>
      {children}
    </article>
  );
}
