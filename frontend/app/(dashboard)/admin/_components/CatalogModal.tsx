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
  description: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="h-dvh w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2
              id="catalog-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
