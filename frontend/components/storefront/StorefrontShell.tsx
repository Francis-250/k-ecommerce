"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  CircleX,
  Camera,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import {
  useCart,
  type CartItem as CartItemType,
} from "@/features/storefront/cart";
import { catalogProducts } from "@/features/storefront/shop/catalog-data";

const mainLinks = [
  { label: "Home", href: "/", children: [] },
  {
    label: "Shop",
    href: "/shop",
    children: [
      ["All products", "/shop"],
      ["Dresses", "/shop?category=Dresses"],
      ["Accessories", "/shop?category=Accessories"],
      ["Featured product", "/products/indigo-ankara-midi-dress"],
    ],
  },
  {
    label: "Women",
    href: "/shop?gender=Women",
    children: [
      ["All women's styles", "/shop?gender=Women"],
      ["Dresses", "/shop?gender=Women&category=Dresses"],
      ["Handbags", "/shop?gender=Women&category=Handbags"],
      ["Tops", "/shop?gender=Women&category=Tops"],
    ],
  },
  {
    label: "Men",
    href: "/shop?gender=Men",
    children: [
      ["All men's styles", "/shop?gender=Men"],
      ["Tops", "/shop?gender=Men&category=Tops"],
      ["Accessories", "/shop?gender=Men&category=Accessories"],
    ],
  },
  { label: "Blog", href: "/blog", children: [["Latest stories", "/blog"]] },
  {
    label: "Pages",
    href: "/about",
    children: [
      ["About us", "/about"],
      ["Portfolio", "/portfolio"],
      ["Services", "/services"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
] as const;
const languageOptions = [
  { label: "English", flag: "🇬🇧" },
  { label: "French", flag: "🇫🇷" },
] as const;

export function StorefrontShell({ children }: { children: ReactNode }) {
  const { items, itemCount, subtotal, removeItem } = useCart();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const selectedLanguage =
    languageOptions.find((item) => item.label === language) ??
    languageOptions[0];
  const searchSuggestions = useMemo(() => {
    const value = searchQuery.trim().toLowerCase();
    if (!value) return [];
    return catalogProducts
      .filter((product) =>
        [product.name, product.category, product.audience].some((field) =>
          field.toLowerCase().includes(value),
        ),
      )
      .slice(0, 5);
  }, [searchQuery]);

  return (
    <>
      <div className="storefront-african-border" aria-hidden="true" />
      <div className="pos_page">
        <div className="container">
          <div className="pos_page_inner">
            <header className="header_area">
              <div className="header_top">
                <div className="row align-items-center">
                  <div className="col-lg-6 col-md-6">
                    <div className="switcher">
                      <ul>
                        <li
                          className={`languages${languageOpen ? " open" : ""}`}
                        >
                          <a
                            href="#language-menu"
                            aria-expanded={languageOpen}
                            onClick={(event) => {
                              event.preventDefault();
                              setCurrencyOpen(false);
                              setLanguageOpen((value) => !value);
                            }}
                          >
                            <span className="language-flag" aria-hidden="true">
                              {selectedLanguage.flag}
                            </span>{" "}
                            <span className="selector-full">{language}</span>
                            <span className="selector-short">
                              {language.slice(0, 2).toUpperCase()}
                            </span>{" "}
                            <ChevronDown size={14} aria-hidden="true" />
                          </a>
                          <ul
                            id="language-menu"
                            className={`dropdown_languages${languageOpen ? " open" : ""}`}
                            hidden={!languageOpen}
                          >
                            {languageOptions.map((item) => (
                              <li key={item.label}>
                                <a
                                  href={`#${item.label.toLowerCase()}`}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setLanguage(item.label);
                                    setLanguageOpen(false);
                                  }}
                                >
                                  <span
                                    className="language-flag"
                                    aria-hidden="true"
                                  >
                                    {item.flag}
                                  </span>{" "}
                                  {item.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li
                          className={`currency${currencyOpen ? " open" : ""}`}
                        >
                          <a
                            href="#currency-menu"
                            aria-expanded={currencyOpen}
                            onClick={(event) => {
                              event.preventDefault();
                              setLanguageOpen(false);
                              setCurrencyOpen((value) => !value);
                            }}
                          >
                            <span className="selector-full">Currency: </span>
                            {currency}{" "}
                            <ChevronDown size={14} aria-hidden="true" />
                          </a>
                          <ul
                            id="currency-menu"
                            className={`dropdown_currency${currencyOpen ? " open" : ""}`}
                            hidden={!currencyOpen}
                          >
                            {["USD", "EUR"].map((item) => (
                              <li key={item}>
                                <a
                                  href={`#${item.toLowerCase()}`}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setCurrency(item);
                                    setCurrencyOpen(false);
                                  }}
                                >
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <div className="header_links">
                      <ul>
                        <li>
                          <Link href="/contact">Contact</Link>
                        </li>
                        <li>
                          <Link href="/wishlist">My wishlist</Link>
                        </li>
                        <li>
                          <Link href="/my-account">My account</Link>
                        </li>
                        <li>
                          <Link href="/cart">My cart</Link>
                        </li>
                        <li>
                          <Link href="/login">Login</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="header_middel">
                <div className="row align-items-center">
                  <div className="col-lg-3 col-md-3">
                    <div className="logo">
                      <Link href="/">
                        <Image
                          className="system-logo"
                          src="/storefront/assets/img/logo/iras-styles-badge.png"
                          alt="I-RAS STYLES International Fashion"
                          width={1118}
                          height={520}
                          priority
                          unoptimized
                        />
                        <span
                          className="site-wordmark"
                          aria-label="I-RAS STYLES"
                        >
                          I-RAS <span>STYLES</span>
                        </span>
                      </Link>
                    </div>
                  </div>
                  <div className="col-lg-9 col-md-9">
                    <div className="header_right_info">
                      <div className="search_bar">
                        <form action="/shop" role="search">
                          <input
                            name="q"
                            value={searchQuery}
                            onChange={(event) =>
                              setSearchQuery(event.target.value)
                            }
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() =>
                              setTimeout(() => setSearchFocused(false), 150)
                            }
                            placeholder="Search products..."
                            aria-label="Search products"
                            role="combobox"
                            aria-autocomplete="list"
                            autoComplete="off"
                            aria-controls="search-suggestions"
                            aria-expanded={
                              searchFocused && searchQuery.length > 0
                            }
                          />
                          <button type="submit" aria-label="Search">
                            <Search size={18} aria-hidden="true" />
                          </button>
                        </form>
                        {searchFocused && searchQuery.trim() && (
                          <div
                            id="search-suggestions"
                            className="search-suggestions"
                            role="listbox"
                          >
                            {searchSuggestions.length ? (
                              searchSuggestions.map((product) => (
                                <Link
                                  role="option"
                                  aria-selected="false"
                                  key={product.id}
                                  href={`/products/${product.slug}`}
                                >
                                  <Image
                                    src={product.image}
                                    alt=""
                                    width={44}
                                    height={44}
                                  />
                                  <span>
                                    <strong>{product.name}</strong>
                                    <small>
                                      {product.category} · $
                                      {product.price.toFixed(2)}
                                    </small>
                                  </span>
                                </Link>
                              ))
                            ) : (
                              <p>No products found. Press Enter to search.</p>
                            )}
                            <Link
                              className="search-all-results"
                              href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                            >
                              View all results <Search size={14} />
                            </Link>
                          </div>
                        )}
                      </div>
                      <div
                        className={`shopping_cart${cartOpen ? " open" : ""}`}
                      >
                        <a
                          href="#mini-cart"
                          aria-expanded={cartOpen}
                          onClick={(event) => {
                            event.preventDefault();
                            setCartOpen((value) => !value);
                          }}
                        >
                          <ShoppingCart
                            className="cart-icon"
                            size={18}
                            aria-hidden="true"
                          />{" "}
                          {itemCount} {itemCount === 1 ? "Item" : "Items"} - $
                          {subtotal.toFixed(2)}{" "}
                          <ChevronDown
                            className="cart-chevron"
                            size={14}
                            aria-hidden="true"
                          />
                        </a>
                        <div
                          id="mini-cart"
                          className="mini_cart"
                          hidden={!cartOpen}
                        >
                          {items.length === 0 ? (
                            <p>Your cart is empty.</p>
                          ) : (
                            items
                              .slice(0, 3)
                              .map((item) => (
                                <CartItem
                                  key={item.id}
                                  item={item}
                                  onRemove={() => removeItem(item.id)}
                                />
                              ))
                          )}
                          <div className="shipping_price">
                            <span>Shipping</span>
                            <span>Free</span>
                          </div>
                          <div className="total_price">
                            <span>Total</span>
                            <span className="prices">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="cart_button">
                            <Link href={items.length ? "/checkout" : "/shop"}>
                              {items.length ? "Check out" : "Shop now"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="header_bottom">
                <div className="row">
                  <div className="col-12">
                    <div className="main_menu_inner">
                      <div className="main_menu d-none d-lg-block">
                        <nav aria-label="Main navigation">
                          <ul>
                            {mainLinks.map((item, index) => (
                              <li
                                key={item.label}
                                className={index === 0 ? "active" : undefined}
                              >
                                <Link href={item.href}>{item.label}</Link>
                                {item.children.length > 0 && (
                                  <div className="mega_menu jewelry">
                                    <div className="mega_items jewelry">
                                      <ul>
                                        {item.children.map(([label, href]) => (
                                          <li key={label}>
                                            <Link href={href}>{label}</Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </nav>
                      </div>
                      <div className="mobile-menu d-lg-none">
                        <button
                          type="button"
                          className="mobile-menu-toggle"
                          aria-expanded={mobileOpen}
                          aria-controls="mobile-navigation"
                          onClick={() => setMobileOpen((value) => !value)}
                        >
                          <span>MENU</span>
                          {mobileOpen ? (
                            <X size={20} aria-hidden="true" />
                          ) : (
                            <Menu size={20} aria-hidden="true" />
                          )}
                        </button>
                        {mobileOpen && (
                          <nav
                            id="mobile-navigation"
                            aria-label="Mobile navigation"
                          >
                            <ul>
                              {mainLinks.map((item) => (
                                <li key={item.label}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {item.label}
                                  </Link>
                                  <ul>
                                    {item.children.map(([label, href]) => (
                                      <li key={label}>
                                        <Link
                                          href={href}
                                          onClick={() => setMobileOpen(false)}
                                        >
                                          {label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </nav>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function CartItem({
  item,
  onRemove,
}: {
  item: CartItemType;
  onRemove: () => void;
}) {
  return (
    <div className="cart_item">
      <div className="cart_img">
        <Link href={`/products/${item.slug}`}>
          <Image src={item.image} alt={item.name} width={80} height={80} />
        </Link>
      </div>
      <div className="cart_info">
        <Link href={`/products/${item.slug}`}>{item.name}</Link>
        <span className="cart_price">${item.price.toFixed(2)}</span>
        <span className="quantity">Qty: {item.quantity}</span>
      </div>
      <div className="cart_remove">
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${item.name}`}
          aria-label={`Remove ${item.name}`}
        >
          <CircleX size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer_area">
      <div className="footer_top">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer_widget">
                <h3>About us</h3>
                <div className="footer_widget_contect">
                  <p>
                    I-RAS STYLES celebrates African creativity through
                    contemporary fashion, expressive prints and thoughtfully
                    crafted accessories.
                  </p>
                  <p>
                    We connect heritage-inspired design with modern style for a
                    confident global community.
                  </p>
                </div>
              </div>
            </div>
            <FooterColumn
              title="My Account"
              links={[
                ["Your Account", "/my-account"],
                ["My orders", "/my-account"],
                ["My addresses", "/my-account"],
                ["Login", "/login"],
              ]}
            />
            <FooterColumn
              title="Informations"
              links={[
                ["Specials", "/shop"],
                ["Our store(s)!", "/contact"],
                ["Terms and conditions", "/about"],
                ["About us", "/about"],
              ]}
            />
            <FooterColumn
              title="Extras"
              links={[
                ["Brands", "/shop"],
                ["Gift Vouchers", "/shop"],
                ["Affiliates", "/about"],
                ["Privacy policy", "/about"],
              ]}
            />
          </div>
        </div>
      </div>
      <div className="footer_bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="copyright_area">
                <ul>
                  <li>
                    <Link href="/about">About us</Link>
                  </li>
                  <li>
                    <Link href="/contact">Customer Service</Link>
                  </li>
                  <li>
                    <Link href="/about">Privacy Policy</Link>
                  </li>
                </ul>
                <p>
                  Copyright © 2026 <Link href="/">I-RAS STYLES</Link>. All
                  rights reserved.
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="footer_social text-right">
                <ul>
                  <li>
                    <a href="#facebook" aria-label="Facebook">
                      <Users size={17} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="#instagram" aria-label="Instagram">
                      <Camera size={17} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="#twitter" aria-label="Twitter">
                      <MessageCircle size={17} aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div className="col-lg-3 col-md-6 col-sm-6">
      <div className="footer_widget">
        <h3>{title}</h3>
        <ul>
          {links.map(([label, href]) => (
            <li key={label}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Breadcrumb({
  title,
  links = [],
}: {
  title: string;
  links?: { label: string; href: string }[];
}) {
  const itemClass =
    "inline-block pr-[15px] text-sm font-bold capitalize leading-[15px] text-[#D4AF4A]";

  return (
    <div className="h-12 border-b-4 border-transparent bg-[#fffdf7] px-5 leading-[48px] [border-image:linear-gradient(90deg,#087554_0_25%,#e7b800_25%_50%,#bd3428_50%_75%,#176ca8_75%)_1] max-[991px]:px-[14px] max-[767px]:mt-[35px]">
      <div>
        <ul className="m-0 p-0 leading-[48px]">
          <li className={itemClass}>
            <Link
              className="!text-[#222] hover:!text-[#e84c3d]"
              href="/"
            >
              Home
            </Link>
          </li>
          {links.map((link) => (
            <li className={itemClass} key={link.href}>
              <Link
                className="!text-[#222] hover:!text-[#e84c3d]"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className={itemClass}>
            {title}
          </li>
        </ul>
      </div>
    </div>
  );
}
