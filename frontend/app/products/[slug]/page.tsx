import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products, ProductPage } from "@/features/storefront/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: `${product.name} | Coron`, description: product.description } : {};
}

export default async function ProductRoute({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
