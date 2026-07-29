import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  products,
  ProductPage,
} from "@/features/storefront/products";

export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function fetchProductData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return getProduct(slug) ?? null;
    }
    const body = await res.json();
    if (!body.success || !body.product) {
      return getProduct(slug) ?? null;
    }
    const p = body.product;
    return {
      slug: p.slug,
      name: p.name,
      category: p.category?.name ?? "Uncategorized",
      description: p.shortDescription || p.name,
      longDescription:
        p.description ||
        p.shortDescription ||
        `${p.name} is handcrafted with care for comfort, quality, and effortless style.`,
      price: Number(p.price),
      previousPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      rating: p.rating ?? 5,
      reviewCount: p.reviewCount ?? 0,
      stock: p.stock ?? 15,
      sku: p.sku || `SKU-${p.slug}`,
      badge: p.badge || (p.isFeatured ? "Sale" : "New"),
      images: p.images?.length
        ? p.images.map((img: { url: string; altText: string | null }) => ({
            src: img.url,
            alt: img.altText || p.name,
          }))
        : [
            {
              src: "/storefront/assets/img/african-products/ankara-midi-dress.png",
              alt: p.name,
            },
          ],
      options: p.options?.length
        ? p.options.map(
            (opt: { name: string; values: Array<{ value: string }> }) => ({
              name: opt.name,
              values: opt.values.map((v) => v.value),
            }),
          )
        : [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      details: p.details?.length
        ? Object.fromEntries(
            p.details.map((d: { label: string; value: string }) => [
              d.label,
              d.value,
            ]),
          )
        : {
            Origin: "African-made collection",
            Material: "Cotton",
            Fit: "Regular",
            Care: "Cold gentle wash",
          },
      relatedSlugs: [],
    };
  } catch (e) {
    return getProduct(slug) ?? null;
  }
}

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductData(slug);
  return product
    ? {
        title: `${product.name} | I-RAS STYLES`,
        description: product.description,
      }
    : {};
}

export default async function ProductRoute({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductData(slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
