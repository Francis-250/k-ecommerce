import Link from "next/link";
import { Plus } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel = "Add new",
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <header className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md bg-emerald-600 px-3.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} strokeWidth={2} />
          {actionLabel}
        </Link>
      )}
    </header>
  );
}
