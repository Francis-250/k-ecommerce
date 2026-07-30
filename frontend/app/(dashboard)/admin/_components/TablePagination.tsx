import { ChevronLeft, ChevronRight } from "lucide-react";

export const ADMIN_PAGE_SIZE = 10;

export function TablePagination({
  page,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  if (totalItems === 0) return null;

  const startItem = (safePage - 1) * ADMIN_PAGE_SIZE + 1;
  const endItem = Math.min(safePage * ADMIN_PAGE_SIZE, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safePage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (safePage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  };

  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row text-xs">
      <p className="text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-800">{startItem}–{endItem}</span> of <span className="font-semibold text-slate-800">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              className={`grid size-8 place-items-center rounded-md font-medium transition-colors ${
                item === safePage
                  ? "bg-slate-950 text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </footer>
  );
}
