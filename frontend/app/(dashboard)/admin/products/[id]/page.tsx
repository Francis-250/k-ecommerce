import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { catalogProducts } from "@/features/storefront/shop/catalog-data";

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = catalogProducts.find((item) => item.id === Number(id));
  if (!product) notFound();
  return (
    <>
      <AdminPageHeader
        title="Product details"
        description="Review catalogue information for this product."
      />
      <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[260px_1fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <Image
            className="h-auto w-full object-contain"
            src={product.image}
            alt={product.name}
            width={260}
            height={260}
          />
        </div>
        <div>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                {product.category}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {product.name}
              </h2>
            </div>
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
              href={`/admin/products/${product.id}/edit`}
            >
              <Pencil size={15} strokeWidth={2} /> Edit
            </Link>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="SKU" value={`SKU-00${product.id}`} />
            <Detail label="Price" value={`$${product.price.toFixed(2)}`} />
            <Detail label="Audience" value={product.audience} />
            <Detail label="Stock" value="20 units" />
            <Detail label="Status" value="Active" />
            <Detail label="Product slug" value={product.slug} />
          </dl>
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Description
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              A versatile Coron piece designed for comfort, quality, and
              effortless everyday styling.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
