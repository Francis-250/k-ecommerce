import { ChevronLeft, ChevronRight } from "lucide-react";

export const ADMIN_PAGE_SIZE = 5;
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
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Showing {(safePage - 1) * ADMIN_PAGE_SIZE + 1}–
        {Math.min(safePage * ADMIN_PAGE_SIZE, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (item) => (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              className={`grid size-8 place-items-center rounded-md text-xs ${item === safePage ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </footer>
  );
}
