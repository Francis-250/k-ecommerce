import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Grid3X3, List, ShoppingCart, Star } from "lucide-react";
import { products } from "./catalog-data";
import { AddToCartButton } from "@/features/storefront/cart";

type Product = (typeof products)[number];

export function ProductCard({
  product = products[0],
  column = "col-lg-4 col-md-6",
}: {
  product?: Product;
  column?: string;
}) {
  const numericPrice = Number(product.price.replace(/[^0-9.]/g, "")) || 0;
  const imagePath = product.image.replace(
    "/storefront/img/",
    "/storefront/assets/img/",
  );

  return (
    <div className={`${column} mb-6`}>
      <div className="group relative bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md h-full">
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-3">
          <Link href={`/products/${product.slug}`} className="w-full h-full block relative">
            <Image
              src={imagePath}
              alt={product.name}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
              unoptimized
            />
          </Link>

          {/* Badge */}
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
            <span
              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full text-white shadow-sm ${
                product.featured
                  ? "bg-[#D4AF4A]"
                  : "bg-[#082f35]"
              }`}
            >
              {product.featured ? "Hot" : "New"}
            </span>
          </div>

          {/* Floating Hover Add to Cart Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
            <AddToCartButton
              item={{
                slug: product.slug,
                name: product.name,
                price: numericPrice,
                image: product.image,
              }}
            >
              <span className="w-full py-2 bg-[#082f35] hover:bg-[#062429] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition cursor-pointer">
                <ShoppingCart size={14} aria-hidden="true" /> Add to cart
              </span>
            </AddToCartButton>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col justify-between flex-1 bg-white border-t border-slate-100">
          <div>
            {product.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                {product.category}
              </span>
            )}
            <h3 className="mb-1">
              <Link
                href={`/products/${product.slug}`}
                className="text-xs sm:text-[13px] font-medium text-slate-800 hover:text-[#082f35] no-underline transition-colors block leading-snug line-clamp-1"
                style={{ color: "#1e293b", textDecoration: "none" }}
              >
                {product.name}
              </Link>
            </h3>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
            <span className="text-sm sm:text-base font-bold text-slate-900">
              {product.price}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="text-[11px] font-semibold text-[#082f35] hover:underline flex items-center gap-0.5 no-underline"
              style={{ color: "#082f35", textDecoration: "none" }}
            >
              Details <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  count = 8,
  columns = "col-lg-4 col-md-6",
  items = products,
}: {
  count?: number;
  columns?: string;
  items?: Product[];
}) {
  return (
    <div className="row">
      {items.slice(0, count).map((product, index) => (
        <ProductCard
          key={`${product.name}-${index}`}
          product={product}
          column={columns}
        />
      ))}
    </div>
  );
}

export function ProductList({ count = 6 }: { count?: number }) {
  return (
    <div className="row">
      {products.slice(0, count).map((product, index) => (
        <div className="col-12" key={`${product.name}-${index}`}>
          <div className="product_list_item">
            <div className="row align-items-center">
              <ProductCard product={product} column="col-lg-4 col-md-5" />
              <div className="col-lg-8 col-md-7">
                <div className="product_list_content">
                  <h3>
                    <Link href={`/products/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div
                    className="product_ratting"
                    aria-label="5 out of 5 stars"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill="currentColor"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="product_price">{product.price}</span>
                  <p>
                    Short-sleeved blouse with feminine draped sleeve detail. A
                    classic piece from the I-RAS STYLES collection, designed for
                    comfort and everyday style.
                  </p>
                  <div className="product_action">
                    <Link href="/cart">
                      <ShoppingCart size={16} aria-hidden="true" /> Add to cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const categories = ["Accessories", "Dresses", "Tops", "HandBags"];
export function Sidebar({
  home = false,
  homeCategories,
  homeImages,
  homeProducts = [],
}: {
  home?: boolean;
  homeCategories?: Array<{ name: string; slug: string; count: number }>;
  homeImages?: {
    top: { url: string; alt: string };
    middle: { url: string; alt: string };
    bottom: { url: string; alt: string };
  };
  homeProducts?: Array<{
    image: string;
    name: string;
    slug: string;
    price: string;
  }>;
}) {
  if (home)
    return (
      <aside className="col-lg-3 col-md-8 col-12">
        <div className="sidebar_widget banner mb-35">
          {homeImages && (
            <>
              <div className="banner_img mb-35">
                <Image
                  src={homeImages.top.url}
                  alt={homeImages.top.alt}
                  width={270}
                  height={130}
                  unoptimized
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div className="banner_img">
                <Image
                  src={homeImages.middle.url}
                  alt={homeImages.middle.alt}
                  width={270}
                  height={130}
                  unoptimized
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </>
          )}
        </div>
        <div className="sidebar_widget catrgorie mb-35">
          <div className="block_title">
            <h3>Categories</h3>
          </div>
          <ul className="category_list_group">
            {(homeCategories?.length
              ? homeCategories
              : [
                  { name: "Women", slug: "Women", count: 12 },
                  { name: "Men", slug: "Men", count: 8 },
                  { name: "Accessories", slug: "Accessories", count: 15 },
                  { name: "Dresses", slug: "Dresses", count: 9 },
                  { name: "Tops", slug: "Tops", count: 6 },
                ]
            ).map((category) => (
              <li key={category.name}>
                <Link
                  href={
                    category.slug
                      ? `/shop?category=${encodeURIComponent(category.slug)}`
                      : "/shop"
                  }
                  className="category_item_link"
                >
                  <span className="category_name">
                    <ChevronRight size={14} className="cat_chevron" aria-hidden="true" />
                    {category.name}
                  </span>
                  {category.count > 0 && (
                    <span className="category_badge">{category.count}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Wishlist products={homeProducts} />
        {/* <Tags /> */}
        <Newsletter />
        {homeImages && (
          <div className="sidebar_widget bottom">
            <div className="banner_img">
              <Image
                src={homeImages.bottom.url}
                alt={homeImages.bottom.alt}
                width={270}
                height={340}
                unoptimized
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        )}
      </aside>
    );
  return (
    <aside className="col-lg-3 col-md-12">
      <div className="sidebar_widget shop_c">
        <div className="categorie__titile">
          <h4>Categories</h4>
        </div>
        <div className="layere_categorie">
          <ul>
            {categories.map((x, i) => (
              <li key={x}>
                <input id={`category-${x}`} type="checkbox" />
                <label htmlFor={`category-${x}`}>
                  {x}
                  <span>({i + 1})</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="sidebar_widget color">
        <h2>Color</h2>
        <div className="widget_color">
          <ul>
            {["Black", "Orange", "Blue", "Yellow", "Pink", "Green"].map(
              (x, i) => (
                <li key={x}>
                  <Link href="/shop">
                    {x} <span>({i + 10})</span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
      <div className="sidebar_widget price">
        <h2>Price</h2>
        <div className="ca_search_filters">
          <label htmlFor="price-range">Price range</label>
          <input
            id="price-range"
            type="range"
            min="0"
            max="100"
            defaultValue="50"
          />
        </div>
      </div>
      <Wishlist />
      <Tags />
      <Newsletter />
    </aside>
  );
}

function Wishlist({
  products = [],
}: {
  products?: Array<{
    image: string;
    name: string;
    slug: string;
    price: string;
  }>;
}) {
  return (
    <div className="sidebar_widget wishlist mb-30">
      <div className="block_title">
        <h3>
          <Link href="/wishlist">Wishlist</Link>
        </h3>
      </div>
      {products.slice(0, 2).map((product) => (
        <div className="cart_item" key={product.slug}>
          <div className="cart_img">
            <Image
              src={product.image}
              alt={product.name}
              width={60}
              height={60}
              unoptimized
            />
          </div>
          <div className="cart_info">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
            <span className="cart_price">{product.price}</span>
            <span className="quantity">Qty: 1</span>
          </div>
        </div>
      ))}
    </div>
  );
}
function Tags() {
  return (
    <div className="sidebar_widget tags mb-35">
      <div className="block_title">
        <h3>popular tags</h3>
      </div>
      <div className="block_tags">
        {[
          "ipod",
          "sam sung",
          "apple",
          "iphone 5s",
          "superdrive",
          "shuffle",
          "nano",
          "canon",
        ].map((x) => (
          <Link href="/shop" key={x}>
            {x}
          </Link>
        ))}
      </div>
    </div>
  );
}
function Newsletter() {
  return (
    <div className="sidebar_widget newsletter mb-35">
      <div className="block_title">
        <h3>newsletter</h3>
      </div>
      <form>
        <p>Sign up for your newsletter</p>
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          placeholder="Your email address"
          type="email"
        />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  );
}

export function ShopToolbar({ list = false }: { list?: boolean }) {
  return (
    <div className="shop_toolbar mb-35">
      <div className="list_button">
        <ul className="nav">
          <li>
            <Link
              className={!list ? "active" : ""}
              href="/shop"
              aria-label="Grid view"
            >
              <Grid3X3 size={18} aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link
              className={list ? "active" : ""}
              href="/shop?view=list"
              aria-label="List view"
            >
              <List size={18} aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
      <div className="page_amount">
        <p>Showing 1–9 of 21 results</p>
      </div>
      <div className="select_option">
        <label htmlFor="sort-products">Sort By</label>
        <select id="sort-products" defaultValue="position">
          <option value="position">Position</option>
          <option value="low">Price: Lowest</option>
          <option value="high">Price: Highest</option>
          <option value="name">Product Name: A</option>
        </select>
      </div>
    </div>
  );
}

export function Pagination() {
  return (
    <div className="pagination_style">
      <div className="page_number">
        <span>Pages: </span>
        <ul>
          <li>«</li>
          <li className="current_number">1</li>
          <li>
            <Link href="#">2</Link>
          </li>
          <li>
            <Link href="#">3</Link>
          </li>
          <li>
            <Link href="#">»</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
