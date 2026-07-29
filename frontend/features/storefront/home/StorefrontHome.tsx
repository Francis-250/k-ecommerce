"use client";

import Image from "next/image";
import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";
import { ProductGrid, Sidebar } from "@/components/storefront/ProductCatalog";
import { useStorefrontCatalog } from "@/features/storefront/catalog/useStorefrontCatalog";
import { useStorefrontAppearance } from "@/features/storefront/appearance/useStorefrontAppearance";

type HomeProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  category: string;
  audience: "Women" | "Men" | "Unisex" | "Kids";
  image: string;
  featured?: boolean;
  createdAt?: string;
};

function ProductSection({
  title,
  products,
  count = 3,
}: {
  title: string;
  products: HomeProduct[];
  count?: number;
}) {
  return (
    <section
      className="new_product_area"
      aria-labelledby={`section-${title.replaceAll(" ", "-").toLowerCase()}`}
    >
      <div className="block_title">
        <h2 id={`section-${title.replaceAll(" ", "-").toLowerCase()}`}>
          {title}
        </h2>
      </div>
      <div className="product_active">
        {products.length ? (
          <ProductGrid
            count={count}
            columns="col-lg-4 col-md-6"
            items={products}
          />
        ) : (
          <div className="rounded border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No products are available yet.
          </div>
        )}
      </div>
    </section>
  );
}

export function StorefrontHome() {
  const catalog = useStorefrontCatalog();
  const appearance = useStorefrontAppearance();
  const products: HomeProduct[] =
    catalog.data?.products.data
      .filter((product) => Boolean(product.images[0]?.url))
      .map((product, index) => ({
        id: index + 1,
        slug: product.slug,
        name: product.name,
        price: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: product.currency,
        }).format(Number(product.price)),
        category: product.category?.name ?? "Uncategorized",
        audience:
          product.audience === "WOMEN"
            ? "Women"
            : product.audience === "MEN"
              ? "Men"
              : product.audience === "KIDS"
                ? "Kids"
                : "Unisex",
        image: product.images[0]!.url,
        featured: product.isFeatured,
        createdAt: product.createdAt,
      })) ?? [];
  const newProducts = [...products].sort(
    (first, second) =>
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime(),
  );
  const featuredProducts = products.filter((product) => product.featured);
  const categories =
    catalog.data?.categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      count: category._count.products,
    })) ?? [];

  return (
    <StorefrontShell>
      <main className="pos_home_section">
        <div className="row pos_home">
          <Sidebar
            home
            homeCategories={categories}
            homeImages={appearance.data?.sidebar}
            homeProducts={products}
          />
          <div className="col-lg-9 col-md-12">
            {appearance.data?.hero ? (
              <section
                className="banner_slider slider_1"
                aria-labelledby="home-hero-title"
              >
                <div className="slider_active">
                  <div
                    className="single_slider home-hero-slide"
                    style={{
                      backgroundImage: `url("${appearance.data.hero.url}")`,
                    }}
                  >
                    <Link
                      className="home-hero-click-target"
                      href={appearance.data.hero.link}
                      aria-label={appearance.data.hero.linkLabel}
                    >
                      <span className="sr-only">
                        {appearance.data.hero.linkLabel}
                      </span>
                    </Link>
                    <div className="slider_content">
                      <div className="slider_content_inner">
                        <p>{appearance.data.hero.eyebrow}</p>
                        <h1 id="home-hero-title">
                          {appearance.data.hero.title}
                        </h1>
                        <p>{appearance.data.hero.description}</p>
                        <span className="hero-cta">
                          {appearance.data.hero.linkLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <div className="mb-10 h-[420px] animate-pulse bg-slate-100" />
            )}
            {catalog.isPending ? (
              <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-80 animate-pulse rounded bg-slate-100"
                  />
                ))}
              </div>
            ) : catalog.isError ? (
              <div className="mb-10 rounded border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
                Products could not be loaded.{" "}
                <button
                  type="button"
                  onClick={() => catalog.refetch()}
                  className="font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <ProductSection title="New Products" products={newProducts} />
            )}
            {appearance.isPending ? (
              <div
                className="banner_area mb-60"
                aria-label="Loading promotional banners"
              >
                <div className="row">
                  {[1, 2].map((item) => (
                    <div className="col-lg-6 col-md-6" key={item}>
                      <div className="aspect-[7/3] animate-pulse bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            ) : appearance.isError ? (
              <div className="banner_area mb-60 rounded border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
                Promotional banners could not be loaded.{" "}
                <button
                  type="button"
                  onClick={() => appearance.refetch()}
                  className="font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="banner_area mb-60">
                <div className="row">
                  {appearance.data.promotions.map((promotion, index) => (
                    <div className="col-lg-6 col-md-6" key={promotion.url}>
                      <div className="single_banner">
                        <Link
                          href={promotion.link}
                          aria-label={promotion.label}
                        >
                          <Image
                            src={promotion.url}
                            alt={promotion.alt}
                            width={420}
                            height={180}
                            unoptimized
                          />
                          <div
                            className={`banner_title ${index === 1 ? "title_2" : ""}`}
                          >
                            <p>{promotion.label}</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!catalog.isPending && !catalog.isError && (
              <ProductSection
                title="Featured Products"
                products={
                  featuredProducts.length ? featuredProducts : newProducts
                }
              />
            )}
            <section
              className="brand_logo mb-60"
              aria-labelledby="brands-title"
            >
              <div className="block_title">
                <h2 id="brands-title">Our Brands</h2>
              </div>
              <div className="brand_active brand-row">
                {catalog.data?.brands.map((brand) => (
                  <div className="brand-item" key={brand.id}>
                    <div className="single_brand">
                      <Link
                        href={`/shop?q=${encodeURIComponent(brand.name)}`}
                        aria-label={`Browse ${brand.name}`}
                      >
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt={brand.name}
                            width={170}
                            height={90}
                            className="h-[90px] w-[170px] object-contain"
                          />
                        ) : (
                          <span className="grid h-[90px] w-[170px] place-items-center border border-slate-200 bg-white px-3 text-center text-sm font-semibold text-slate-700">
                            {brand.name}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
