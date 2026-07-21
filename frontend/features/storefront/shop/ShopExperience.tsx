"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Grid3X3, List, SlidersHorizontal, X } from "lucide-react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { catalogProducts } from "./catalog-data";
import { ProductResults } from "./ProductResults";

const categories = [
  "All",
  "Accessories",
  "Dresses",
  "Tops",
  "Handbags",
] as const;
type Category = (typeof categories)[number];
const audiences = ["All", "Women", "Men"] as const;
type Audience = (typeof audiences)[number];

export function ShopExperience({
  initialGender = "All",
  initialCategory = "All",
  query = "",
}: {
  initialGender?: Audience;
  initialCategory?: Category;
  query?: string;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<Category>(initialCategory);
  const [gender, setGender] = useState<Audience>(initialGender);
  const [maxPrice, setMaxPrice] = useState(100);
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
  const products = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const filtered = catalogProducts.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        (gender === "All" || product.audience === gender) &&
        product.price <= maxPrice &&
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
            : a.id - b.id,
    );
  }, [category, gender, maxPrice, query, sort]);

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
                    <li key={item}>
                      <input
                        id={`filter-${item}`}
                        type="radio"
                        name="category"
                        checked={category === item}
                        onChange={() => setCategory(item)}
                      />
                      <label htmlFor={`filter-${item}`}>
                        {item}
                        <span>
                          {" "}
                          (
                          {item === "All"
                            ? catalogProducts.length
                            : catalogProducts.filter(
                                (product) => product.category === item,
                              ).length}
                          )
                        </span>
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
                <label htmlFor="max-price">Up to ${maxPrice}</label>
                <input
                  id="max-price"
                  type="range"
                  min="35"
                  max="100"
                  value={maxPrice}
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
                  setMaxPrice(100);
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
            <div className="banner_slider mb-35">
              <Image
                src="/storefront/assets/img/banner/bannner10.jpg"
                alt="Discover the latest I-RAS STYLES collection"
                width={870}
                height={220}
                priority
              />
            </div>
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
              <ProductResults products={products} view={view} />
            </div>
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
