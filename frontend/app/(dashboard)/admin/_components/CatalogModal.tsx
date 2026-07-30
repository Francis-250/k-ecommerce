"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function CatalogModal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="h-dvh w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3.5 sm:px-6 shrink-0">
          <div className="min-w-0 flex-1">
            <h2
              id="catalog-modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 truncate"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}
