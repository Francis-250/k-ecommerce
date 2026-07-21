import type { LucideIcon } from "lucide-react";

const themes = {
  violet: "bg-violet-50 text-violet-600",
  blue: "bg-sky-50 text-sky-600",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-emerald-50 text-emerald-600",
} as const;

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  theme,
}: {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  theme: keyof typeof themes;
}) {
  return (
    <article className="flex max-h-30 items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="mb-1.5 text-sm text-slate-500">{label}</p>
        <p className="text-xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-2 text-xs">
          <span className="font-medium text-emerald-600">{change}</span>{" "}
          <span className="text-slate-400">vs last month</span>
        </p>
      </div>
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-md ${themes[theme]}`}
      >
        <Icon size={20} strokeWidth={1.75} />
      </span>
    </article>
  );
}
