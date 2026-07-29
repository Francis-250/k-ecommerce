"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Grid3X3, List, SlidersHorizontal, X } from "lucide-react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { useStorefrontCatalog } from "@/features/storefront/catalog/useStorefrontCatalog";
import { useStorefrontAppearance } from "@/features/storefront/appearance/useStorefrontAppearance";
import type { CatalogProduct } from "./catalog-data";
import { ProductResults } from "./ProductResults";

const audiences = ["All", "Women", "Men", "Unisex", "Kids"] as const;
type Audience = (typeof audiences)[number];

export function ShopExperience({
  initialGender = "All",
  initialCategory = "All",
  query = "",
}: {
  initialGender?: Audience;
  initialCategory?: string;
  query?: string;
}) {
  const catalog = useStorefrontCatalog();
  const appearance = useStorefrontAppearance();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState<Audience>(initialGender);
  const [maxPrice, setMaxPrice] = useState(Number.POSITIVE_INFINITY);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("shop-filters-open");
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("shop-filters-open");
    };
  }, [filtersOpen]);
  const catalogProducts = useMemo<CatalogProduct[]>(
    () =>
      catalog.data?.products.data
        .filter((product) => Boolean(product.images[0]?.url))
        .map((product, index) => ({
          id: index + 1,
          slug: product.slug,
          name: product.name,
          price: Number(product.price),
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
        })) ?? [],
    [catalog.data?.products.data],
  );
  const categories = useMemo(
    () => [
      { name: "All", slug: "All", count: catalogProducts.length },
      ...(catalog.data?.categories.map((item) => ({
        name: item.name,
        slug: item.slug,
        count: item._count.products,
      })) ?? []),
    ],
    [catalog.data?.categories, catalogProducts.length],
  );
  const priceCeiling = Math.max(
    1,
    Math.ceil(
      Math.max(0, ...catalogProducts.map((product) => product.price)) / 10,
    ) * 10,
  );
  const effectiveMaxPrice = Number.isFinite(maxPrice) ? maxPrice : priceCeiling;
  const products = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const filtered = catalogProducts.filter(
      (product) =>
        (category === "All" ||
          catalog.data?.categories.find(
            (item) => item.slug === category || item.name === category,
          )?.name === product.category) &&
        (gender === "All" || product.audience === gender) &&
        product.price <= effectiveMaxPrice &&
        (!query ||
          [product.name, product.category, product.audience]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)),
    );
    return [...filtered].sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
              new Date(b.createdAt ?? 0).getTime() -
                new Date(a.createdAt ?? 0).getTime(),
    );
  }, [
    catalog.data?.categories,
    catalogProducts,
    category,
    effectiveMaxPrice,
    gender,
    query,
    sort,
  ]);

  return (
    <StorefrontShell>
      <Breadcrumb
        title={gender === "All" ? "Shop" : `${gender}'s collection`}
      />
      <main className="pos_home_section shop-workspace">
        <button
          type="button"
          className="mobile-filter-trigger"
          aria-controls="shop-filters"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal size={17} aria-hidden="true" /> Filters
        </button>
        {filtersOpen && (
          <button
            type="button"
            className="shop-filter-backdrop"
            aria-label="Close product filters"
            onClick={() => setFiltersOpen(false)}
          />
        )}
        <div className="row pos_home shop-layout-frame">
          <aside
            id="shop-filters"
            className={`col-lg-3 col-md-12 shop-filter-column${filtersOpen ? " is-open" : ""}`}
            aria-label="Product filters"
            aria-hidden={!filtersOpen ? undefined : false}
          >
            <div className="mobile-filter-heading">
              <strong>Filter products</strong>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="sidebar_widget shop_c">
              <div className="categorie__titile">
                <h2>Categories</h2>
              </div>
              <div className="layere_categorie">
                <ul>
                  {categories.map((item) => (
                    <li key={item.slug}>
                      <input
                        id={`filter-${item.slug}`}
                        type="radio"
                        name="category"
                        checked={
                          category === item.slug ||
                          (item.slug !== "All" && category === item.name)
                        }
                        onChange={() => setCategory(item.slug)}
                      />
                      <label htmlFor={`filter-${item.slug}`}>
                        {item.name}
                        <span> ({item.count})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="sidebar_widget shop_c">
              <div className="categorie__titile">
                <h2>Shop for</h2>
              </div>
              <div className="layere_categorie">
                <ul>
                  {audiences.map((item) => (
                    <li key={item}>
                      <input
                        id={`audience-${item}`}
                        type="radio"
                        name="audience"
                        checked={gender === item}
                        onChange={() => setGender(item)}
                      />
                      <label htmlFor={`audience-${item}`}>
                        {item}
                        <span>
                          {" "}
                          (
                          {item === "All"
                            ? catalogProducts.length
                            : catalogProducts.filter(
                                (product) => product.audience === item,
                              ).length}
                          )
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="sidebar_widget price">
              <h2>Price</h2>
              <div className="ca_search_filters">
                <label htmlFor="max-price">
                  Up to ${effectiveMaxPrice.toFixed(0)}
                </label>
                <input
                  id="max-price"
                  type="range"
                  min="0"
                  max={priceCeiling}
                  value={effectiveMaxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                />
              </div>
            </div>
            <div className="filter-actions">
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setGender("All");
                  setMaxPrice(Number.POSITIVE_INFINITY);
                  setSort("featured");
                }}
                className="button"
              >
                Clear filters
              </button>
              <button
                type="button"
                className="button mobile-apply-filters"
                onClick={() => setFiltersOpen(false)}
              >
                Show {products.length} products
              </button>
            </div>
          </aside>
          <div className="col-lg-9 col-md-12 shop-results-column">
            {appearance.data?.shopBanner ? (
              <div className="banner_slider mb-35">
                <Image
                  src={appearance.data.shopBanner.url}
                  alt={appearance.data.shopBanner.alt}
                  width={870}
                  height={220}
                  priority
                  unoptimized
                />
              </div>
            ) : (
              <div className="mb-35 h-[220px] animate-pulse bg-slate-100" />
            )}
            <div className="shop_toolbar mb-35">
              <div className="list_button">
                <ul className="nav" aria-label="Product display">
                  <li>
                    <button
                      type="button"
                      className={view === "grid" ? "active" : ""}
                      aria-pressed={view === "grid"}
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                    >
                      <Grid3X3 size={18} aria-hidden="true" />
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={view === "list" ? "active" : ""}
                      aria-pressed={view === "list"}
                      onClick={() => setView("list")}
                      aria-label="List view"
                    >
                      <List size={18} aria-hidden="true" />
                    </button>
                  </li>
                </ul>
              </div>
              <div className="page_amount" aria-live="polite">
                <p>
                  Showing {products.length} of {catalogProducts.length} products
                </p>
              </div>
              <div className="select_option">
                <label htmlFor="sort-products">Sort by</label>
                <select
                  id="sort-products"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </div>
            </div>
            <div className="shop-products-scroll">
              {catalog.isPending ? (
                <div
                  className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                  aria-label="Loading products"
                >
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-80 animate-pulse rounded bg-slate-100"
                    />
                  ))}
                </div>
              ) : catalog.isError ? (
                <div className="error_form">
                  <h2>Products could not be loaded</h2>
                  <p>Check your connection and try again.</p>
                  <button type="button" onClick={() => catalog.refetch()}>
                    Try again
                  </button>
                </div>
              ) : (
                <ProductResults products={products} view={view} />
              )}
            </div>
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
