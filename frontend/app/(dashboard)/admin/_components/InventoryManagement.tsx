"use client";

import Image from "next/image";
import {
  AlertTriangle,
  Download,
  Eye,
  History,
  LoaderCircle,
  PackagePlus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { catalogProducts } from "@/features/storefront/shop/catalog-data";
import {
  useInventoryMutations,
  useProducts,
} from "@/features/admin/catalog/hooks";
import type { ApiProduct } from "@/features/admin/catalog/api";
import { CatalogModal } from "./CatalogModal";
import { ADMIN_PAGE_SIZE, TablePagination } from "./TablePagination";
import { fieldClass } from "./AdminFormUI";

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  image: string;
  quantity: number;
  reserved: number;
  reorderPoint: number;
  variantId?: string;
};

export function InventoryManagement() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null,
  );
  const [viewingProduct, setViewingProduct] = useState<InventoryItem | null>(
    null,
  );
  const [showHistory, setShowHistory] = useState(false);

  const { data: rawProducts, isLoading, refetch } = useProducts();

  const items: InventoryItem[] = useMemo(() => {
    if (rawProducts && rawProducts.length > 0) {
      return rawProducts.map((p) => {
        const primaryVariant = p.variants?.[0];
        const primaryImage =
          p.images?.[0]?.url || "/storefront/assets/img/product/product1.png";
        return {
          id: p.id,
          name: p.name,
          category: p.category?.name || "General",
          sku:
            p.sku ||
            primaryVariant?.sku ||
            `SKU-${p.id.slice(-6).toUpperCase()}`,
          image: primaryImage,
          quantity: primaryVariant?.inventory?.quantity ?? 12,
          reserved: primaryVariant?.inventory?.reserved ?? 0,
          reorderPoint: primaryVariant?.inventory?.reorderPoint ?? 5,
          variantId: primaryVariant?.id,
        };
      });
    }

    return catalogProducts.map((p, idx) => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      sku: `SKU-00${p.id}`,
      image: p.image,
      quantity: [24, 7, 18, 0, 30, 13, 9, 22][idx % 8],
      reserved: idx % 3,
      reorderPoint: 5,
    }));
  }, [rawProducts]);

  const filtered = useMemo(
    () =>
      items.filter((product) =>
        `${product.name} ${product.category} ${product.sku}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const visible = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  const totalUnits = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const lowStockCount = useMemo(
    () =>
      items.filter((item) => item.quantity > 0 && item.quantity < 10).length,
    [items],
  );

  const outOfStockCount = useMemo(
    () => items.filter((item) => item.quantity === 0).length,
    [items],
  );

  const exportCSV = () => {
    const headers =
      "Product Name,Category,SKU,Available,Committed,On Hand,Status\n";
    const rows = filtered
      .map((item) => {
        const status =
          item.quantity === 0
            ? "Out of stock"
            : item.quantity < 10
              ? "Low stock"
              : "In stock";
        return `"${item.name}","${item.category}","${item.sku}",${item.quantity},${item.reserved},${item.quantity + item.reserved},"${status}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Inventory CSV exported");
  };

  return (
    <>
      <header className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track available stock and adjust quantities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Total units" value={totalUnits.toString()} />
        <Metric
          label="Low stock products"
          value={lowStockCount.toString()}
        />
        <Metric
          label="Out of stock"
          value={outOfStockCount.toString()}
        />
      </div>

      {/* Main Table */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex gap-2 border-b border-slate-200 p-4">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              placeholder="Search products or SKU"
            />
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            <History size={15} /> History
          </button>
          <button
            onClick={exportCSV}
            className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Export inventory"
          >
            <Download size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                {[
                  "Product",
                  "SKU",
                  "Unavailable",
                  "Committed",
                  "Available",
                  "On hand",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <LoaderCircle className="mx-auto mb-2 animate-spin text-slate-400" size={24} />
                    Loading inventory...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No products found matching &quot;{query}&quot;.
                  </td>
                </tr>
              ) : (
                visible.map((product) => {
                  const quantity = product.quantity;
                  const onHand = quantity + product.reserved;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            className="size-9 rounded-md border border-slate-200 object-cover"
                            src={product.image}
                            alt={product.name}
                            width={36}
                            height={36}
                          />
                          <span>
                            <strong className="block font-medium text-slate-800">
                              {product.name}
                            </strong>
                            <small className="text-slate-500">
                              {product.category}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-slate-500">0</td>
                      <td className="px-4 py-3 text-slate-500">
                        {product.reserved}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {onHand}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            quantity === 0
                              ? "bg-red-50 text-red-700"
                              : quantity < 10
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {quantity === 0
                            ? "Out of stock"
                            : quantity < 10
                              ? "Low stock"
                              : "In stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingProduct(product)}
                            className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="View product details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            Adjust stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </section>

      {/* View Product Details Drawer */}
      {viewingProduct && (
        <CatalogModal
          title="Product Details"
          description="Full specifications and inventory breakdown."
          onClose={() => setViewingProduct(null)}
        >
          <div className="p-6 space-y-6">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Image
                src={viewingProduct.image}
                alt={viewingProduct.name}
                width={112}
                height={112}
                className="size-28 rounded-lg border border-slate-200 object-cover shadow-xs shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {viewingProduct.sku}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      viewingProduct.quantity === 0
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : viewingProduct.quantity < 10
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {viewingProduct.quantity === 0
                      ? "Out of Stock"
                      : viewingProduct.quantity < 10
                        ? "Low Stock"
                        : "In Stock"}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 leading-snug">
                  {viewingProduct.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Category: <span className="font-medium text-slate-800">{viewingProduct.category}</span>
                </p>
              </div>
            </div>

            {/* Clean Specifications Row Breakdown */}
            <div className="border-t border-b border-slate-100 py-2 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Available Quantity</span>
                <span className="font-semibold text-slate-900">{viewingProduct.quantity} units</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Committed / Reserved</span>
                <span className="font-semibold text-slate-900">{viewingProduct.reserved} units</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Total On Hand</span>
                <span className="font-semibold text-slate-900">{viewingProduct.quantity + viewingProduct.reserved} units</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Reorder Threshold</span>
                <span className="font-semibold text-slate-900">{viewingProduct.reorderPoint} units</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(viewingProduct);
                  setViewingProduct(null);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <PackagePlus size={16} /> Adjust Stock
              </button>
            </div>
          </div>
        </CatalogModal>
      )}

      {/* Simple Stock Drawer (matching CategoryModal style) */}
      {selectedProduct && (
        <CatalogModal
          title="Adjust inventory stock"
          description={`Update available stock quantity for ${selectedProduct.name}`}
          onClose={() => setSelectedProduct(null)}
        >
          <InventoryAdjustmentForm
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </CatalogModal>
      )}

      {/* History Drawer */}
      {showHistory && (
        <CatalogModal
          title="Inventory history"
          description="Recent stock movements."
          onClose={() => setShowHistory(false)}
        >
          <div className="space-y-3 p-6 text-sm">
            {[
              { type: "Stock In", note: "Supplier delivery #PO-882", qty: "+50", date: "Today, 08:30 AM" },
              { type: "Damaged", note: "Damaged packaging", qty: "-2", date: "Yesterday, 04:15 PM" },
              { type: "Customer Return", note: "Order #1042 return", qty: "+1", date: "Jul 28, 2026" },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <span className="font-medium text-slate-800 block text-xs">{log.type}</span>
                  <span className="text-xs text-slate-500">{log.note}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold text-sm ${log.qty.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                    {log.qty}
                  </span>
                  <span className="block text-[10px] text-slate-400">{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CatalogModal>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InventoryAdjustmentForm({
  product,
  onClose,
}: {
  product: InventoryItem;
  onClose: () => void;
}) {
  const [movementType, setMovementType] = useState<
    "STOCK_IN" | "STOCK_OUT" | "RETURN" | "CORRECTION"
  >("STOCK_IN");
  const [quantity, setQuantity] = useState<string>("1");
  const [note, setNote] = useState<string>("");
  const { adjustStock } = useInventoryMutations();

  const currentStock = product.quantity;
  const numericQty = Math.max(0, parseInt(quantity, 10) || 0);

  const calculatedNewStock = useMemo(() => {
    if (movementType === "STOCK_IN" || movementType === "RETURN") {
      return currentStock + numericQty;
    }
    if (movementType === "STOCK_OUT") {
      return Math.max(0, currentStock - numericQty);
    }
    if (movementType === "CORRECTION") {
      return numericQty;
    }
    return currentStock;
  }, [currentStock, movementType, numericQty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity === "" || isNaN(numericQty) || numericQty < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await adjustStock.mutateAsync({
        productId: product.id,
        variantId: product.variantId,
        type: movementType,
        quantity: numericQty,
        note: note.trim() || undefined,
      });
      toast.success(`Inventory updated for ${product.name}`);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Unable to save inventory changes");
    }
  };

  const getQuantityLabel = () => {
    switch (movementType) {
      case "STOCK_IN":
        return "Quantity to add to stock";
      case "STOCK_OUT":
        return "Damaged / defective quantity to remove";
      case "RETURN":
        return "Returned quantity to add back";
      case "CORRECTION":
        return "New total stock count";
      default:
        return "Quantity";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6">
      {/* Product info banner */}
      <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <Image
          src={product.image}
          alt={product.name}
          width={40}
          height={40}
          className="size-10 rounded border border-slate-200 object-cover"
        />
        <div className="text-xs">
          <strong className="block font-medium text-slate-800 text-sm">
            {product.name}
          </strong>
          <span className="text-slate-500 font-mono">
            {product.sku} · Current stock: {currentStock} units
          </span>
        </div>
      </div>

      {/* Action Type Select */}
      <label className="block text-sm font-medium text-slate-700">
        Action
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as any)}
          className={`${fieldClass} appearance-none`}
        >
          <option value="STOCK_IN">Stock In / Restock (+ Add to stock)</option>
          <option value="STOCK_OUT">Damaged / Defective (- Reduce from stock)</option>
          <option value="RETURN">Customer Return (+ Add back to stock)</option>
          <option value="CORRECTION">Manual Count / Correction (= Set exact count)</option>
        </select>
      </label>

      {/* Quantity Field */}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          {getQuantityLabel()}
          <input
            type="number"
            min={0}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onFocus={(e) => e.target.select()}
            className={fieldClass}
            placeholder="Enter quantity"
          />
        </label>
        <div className="block text-sm font-medium text-slate-700">
          Resulting stock
          <div className="mt-2 flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-900">
            {calculatedNewStock} units
          </div>
        </div>
      </div>

      {/* Quick Add Pills */}
      <div>
        <span className="block text-xs font-medium text-slate-500 mb-1.5">
          Quick quantity
        </span>
        <div className="flex gap-2">
          {[1, 5, 10, 25, 50].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() =>
                setQuantity((prev) => {
                  const current = parseInt(prev, 10) || 0;
                  return String(movementType === "CORRECTION" ? num : current + num);
                })
              }
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              +{num}
            </button>
          ))}
        </div>
      </div>

      {/* Note Field */}
      <label className="block text-sm font-medium text-slate-700">
        Reason / Note
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${fieldClass} min-h-24 py-3`}
          placeholder="Optional note (e.g. Supplier delivery, damaged stock)"
        />
      </label>

      {/* Simple Footer matching CategoryModal */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={adjustStock.isPending}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          disabled={adjustStock.isPending}
          className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {adjustStock.isPending && (
            <LoaderCircle className="animate-spin" size={16} />
          )}
          Save stock adjustment
        </button>
      </div>
    </form>
  );
}
