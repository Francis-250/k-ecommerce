"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleX,
  Camera,
  Heart,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingCart,
  User,
  Users,
  X,
} from "lucide-react";
import {
  CartDrawer,
  useCart,
  type CartItem as CartItemType,
} from "@/features/storefront/cart";
import { AuthAccountLink } from "@/features/auth/AuthAccountLink";
import { useStorefrontAppearance } from "@/features/storefront/appearance/useStorefrontAppearance";
import { useStorefrontCatalog } from "@/features/storefront/catalog/useStorefrontCatalog";
import { useGeneralStoreSettings } from "@/features/admin/hooks/useGeneralStoreSettings";

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

export function StorefrontShell({ children }: { children: ReactNode }) {
  const { items, itemCount, subtotal, openCartDrawer, removeItem } = useCart();
  const appearance = useStorefrontAppearance();
  const catalog = useStorefrontCatalog();
  const storeSettings = useGeneralStoreSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const displayLogoUrl = appearance.data?.logo?.url || storeSettings.logoUrl;
  const displayLogoAlt = appearance.data?.logo?.alt || storeSettings.storeName;

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("mobile-nav-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("mobile-nav-open");
    };
  }, [mobileOpen]);

  const searchSuggestions = useMemo(() => {
    const value = searchQuery.trim().toLowerCase();
    if (!value) return [];
    const dynamicProducts =
      catalog.data?.products.data
        .filter((product) => Boolean(product.images[0]?.url))
        .map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category?.name ?? "Uncategorized",
          audience: product.audience.toLowerCase(),
          image: product.images[0]!.url,
          price: Number(product.price),
        })) ?? [];
    return dynamicProducts
      .filter((product) =>
        [product.name, product.category, product.audience].some((field) =>
          field.toLowerCase().includes(value),
        ),
      )
      .slice(0, 5);
  }, [catalog.data?.products, searchQuery]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <>
      <div className="storefront-african-border" aria-hidden="true" />
      <div className="pos_page">
        <div className="container">
          <div className="pos_page_inner">
            <header className="header_area">
              <div className="header_top">
                <div className="row align-items-center">
                  <div className="col-12">
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
                          <button
                            type="button"
                            className="header-top-cart-btn"
                            onClick={openCartDrawer}
                          >
                            My cart
                          </button>
                        </li>
                        <li>
                          <AuthAccountLink />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="header_middel">
                <div className="row align-items-center">
                  <div className="col-lg-3 col-md-4 col-12 logo-col">
                    <div className="header_middel_left d-flex align-items-center justify-content-between">
                      <button
                        type="button"
                        className="mobile-menu-toggle d-lg-none"
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-navigation"
                        aria-label="Toggle Navigation Menu"
                        onClick={() => setMobileOpen((value) => !value)}
                      >
                        {mobileOpen ? (
                          <X size={20} aria-hidden="true" />
                        ) : (
                          <Menu size={20} aria-hidden="true" />
                        )}
                        <span>MENU</span>
                      </button>
                      <div className="logo">
                        <Link href="/">
                          {displayLogoUrl ? (
                            <Image
                              className="system-logo"
                              src={displayLogoUrl}
                              alt={displayLogoAlt ?? ""}
                              width={1118}
                              height={520}
                              priority
                              unoptimized
                            />
                          ) : (
                            <span
                              className="site-wordmark"
                              aria-label={storeSettings.storeName}
                            >
                              {storeSettings.storeName}
                            </span>
                          )}
                        </Link>
                      </div>
                      <div className="mobile-quick-cart d-lg-none">
                        <button
                          type="button"
                          className="mobile-cart-badge-link"
                          aria-label={`Cart with ${itemCount} items`}
                          onClick={openCartDrawer}
                        >
                          <ShoppingCart size={22} aria-hidden="true" />
                          {itemCount > 0 && (
                            <span className="mobile-cart-count">{itemCount}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-9 col-md-8 col-12">
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
                      <div className="shopping_cart d-none d-lg-block">
                        <a
                          href="#cart-drawer"
                          onClick={(event) => {
                            event.preventDefault();
                            openCartDrawer();
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="header_bottom d-none d-lg-block">
                <div className="row">
                  <div className="col-12">
                    <div className="main_menu_inner">
                      <div className="main_menu">
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
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Mobile Navigation Slide-Over Drawer */}
            <div
              className={`mobile-nav-backdrop ${mobileOpen ? "is-open" : ""}`}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              id="mobile-navigation"
              className={`mobile-nav-drawer ${mobileOpen ? "is-open" : ""}`}
              aria-label="Mobile Navigation"
              aria-hidden={!mobileOpen}
            >
              <div className="mobile-drawer-header">
                <div className="mobile-drawer-brand">
                  {displayLogoUrl ? (
                    <Image
                      src={displayLogoUrl}
                      alt={displayLogoAlt ?? ""}
                      width={120}
                      height={40}
                      unoptimized
                    />
                  ) : (
                    <span className="site-wordmark">
                      {storeSettings.storeName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="mobile-drawer-close"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>

              <div className="mobile-drawer-pattern-accent" aria-hidden="true" />

              <div className="mobile-drawer-body">
                <nav className="mobile-drawer-nav" aria-label="Mobile Menu">
                  <ul>
                    {mainLinks.map((item) => {
                      const hasChildren = item.children.length > 0;
                      const isOpen = openSubmenu === item.label;
                      return (
                        <li key={item.label} className={hasChildren ? "has-children" : undefined}>
                          <div className="mobile-nav-item">
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                            >
                              {item.label}
                            </Link>
                            {hasChildren && (
                              <button
                                type="button"
                                className="mobile-submenu-toggle"
                                aria-label={`Toggle ${item.label} submenu`}
                                aria-expanded={isOpen}
                                onClick={() => toggleSubmenu(item.label)}
                              >
                                <ChevronRight
                                  size={18}
                                  className={`arrow-icon ${isOpen ? "rotate-90" : ""}`}
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                          </div>
                          {hasChildren && isOpen && (
                            <ul className="mobile-submenu">
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
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mobile-drawer-footer">
                  <div className="mobile-drawer-quicklinks">
                    <Link href="/my-account" onClick={() => setMobileOpen(false)}>
                      <User size={16} aria-hidden="true" /> My Account
                    </Link>
                    <Link href="/wishlist" onClick={() => setMobileOpen(false)}>
                      <Heart size={16} aria-hidden="true" /> Wishlist
                    </Link>
                    <button
                      type="button"
                      className="drawer-quick-cart-btn"
                      onClick={() => {
                        setMobileOpen(false);
                        openCartDrawer();
                      }}
                    >
                      <ShoppingCart size={16} aria-hidden="true" /> Cart ({itemCount})
                    </button>
                    <Link href="/contact" onClick={() => setMobileOpen(false)}>
                      <Phone size={16} aria-hidden="true" /> Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
            {children}
          </div>
        </div>
      </div>
      <CartDrawer />
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
  const storeSettings = useGeneralStoreSettings();
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
                  Copyright © 2026 <Link href="/">{storeSettings.storeName}</Link>. All
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
            <Link className="!text-[#222] hover:!text-[#e84c3d]" href="/">
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
          <li className={itemClass}>{title}</li>
        </ul>
      </div>
    </div>
  );
}
