import Image from "next/image";
import Link from "next/link";
import { products } from "./data";
import { AddToCartButton } from "@/features/storefront/cart";

type Product = (typeof products)[number];

export function ProductCard({
  product = products[0],
  column = "col-lg-4 col-md-6",
}: {
  product?: Product;
  column?: string;
}) {
  const index = products.indexOf(product);
  return (
    <div className={column}>
      <div className="single_product">
        <div className="product_thumb">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.image.replace("/coron/img/", "/coron/assets/img/")}
              alt={product.name}
              width={270}
              height={270}
            />
          </Link>
          <div className={index % 2 ? "hot_img" : "img_icone"}>
            <Image
              src={`/coron/assets/img/cart/${index % 2 ? "span-hot.png" : "span-new.png"}`}
              alt={index % 2 ? "Hot" : "New"}
              width={50}
              height={50}
            />
          </div>
          <div className="product_action">
            <AddToCartButton item={{ slug: product.slug, name: product.name, price: Number(product.price.replace(/[^0-9.]/g, "")), image: product.image }}><><i className="fa fa-shopping-cart" aria-hidden="true" /> Add to cart</></AddToCartButton>
          </div>
        </div>
        <div className="product_content">
          <span className="product_price">{product.price}</span>
          <h3 className="product_title">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <div className="product_info">
          <ul>
            <li>
              <Link href="/wishlist">Add to Wishlist</Link>
            </li>
            <li>
              <Link href={`/products/${product.slug}`}>View Detail</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  count = 8,
  columns = "col-lg-4 col-md-6",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className="row">
      {products.slice(0, count).map((product, index) => (
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
                    <Link href="/products/printed-summer-dress">
                      {product.name}
                    </Link>
                  </h3>
                  <div
                    className="product_ratting"
                    aria-label="5 out of 5 stars"
                  >
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                  </div>
                  <span className="product_price">{product.price}</span>
                  <p>
                    Short-sleeved blouse with feminine draped sleeve detail. A
                    classic piece from the Coron collection, designed for
                    comfort and everyday style.
                  </p>
                  <div className="product_action">
                    <Link href="/cart">
                      <i className="fa fa-shopping-cart" /> Add to cart
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
export function Sidebar({ home = false }: { home?: boolean }) {
  if (home)
    return (
      <aside className="col-lg-3 col-md-8 col-12">
        <div className="sidebar_widget banner mb-35">
          <div className="banner_img mb-35">
            <Image
              src="/coron/assets/img/banner/banner5.jpg"
              alt="Fashion offer"
              width={270}
              height={130}
            />
          </div>
          <div className="banner_img">
            <Image
              src="/coron/assets/img/banner/banner6.jpg"
              alt="Seasonal offer"
              width={270}
              height={130}
            />
          </div>
        </div>
        <div className="sidebar_widget catrgorie mb-35">
          <h3>Categories</h3>
          <ul>
            {["Women", "Men", "Footwear", "Jewelry", "Lady"].map((x) => (
              <li className="has-sub" key={x}>
                <Link href="/shop">
                  <i className="fa fa-caret-right" /> {x}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Wishlist />
        <Tags />
        <Newsletter />
        <div className="sidebar_widget bottom">
          <div className="banner_img">
            <Image
              src="/coron/assets/img/banner/banner9.jpg"
              alt="Coron fashion"
              width={270}
              height={340}
            />
          </div>
        </div>
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

function Wishlist() {
  return (
    <div className="sidebar_widget wishlist mb-30">
      <div className="block_title">
        <h3>
          <Link href="/wishlist">Wishlist</Link>
        </h3>
      </div>
      {["cart.png", "cart2.png"].map((image, i) => (
        <div className="cart_item" key={image}>
          <div className="cart_img">
            <Image
              src={`/coron/assets/img/cart/${image}`}
              alt="Wishlist product"
              width={60}
              height={60}
            />
          </div>
          <div className="cart_info">
            <Link href="/products/printed-summer-dress">
              {i ? "Quisque ornare dui" : "lorem ipsum dolor"}
            </Link>
            <span className="cart_price">${i ? "105" : "115"}.00</span>
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
              <i className="fa fa-th-large" />
            </Link>
          </li>
          <li>
            <Link
              className={list ? "active" : ""}
              href="/shop?view=list"
              aria-label="List view"
            >
              <i className="fa fa-th-list" />
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
