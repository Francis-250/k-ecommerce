import Link from "next/link";
import { Plus } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel = "Add new",
  onAction,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {actionHref && !onAction && (
        <Link
          href={actionHref}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={16} strokeWidth={2} />
          {actionLabel}
        </Link>
      )}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={16} strokeWidth={2} />
          {actionLabel}
        </button>
      )}
    </header>
  );
}
