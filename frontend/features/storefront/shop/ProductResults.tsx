import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import type { CatalogProduct } from "./catalog-data";
import { AddToCartButton } from "@/features/storefront/cart";

export function ProductResults({
  products,
  view,
}: {
  products: CatalogProduct[];
  view: "grid" | "list";
}) {
  if (!products.length)
    return (
      <div className="shop_tab_product">
        <div className="error_form">
          <h2>No products found</h2>
          <p>Try another category or increase your price range.</p>
        </div>
      </div>
    );
  return (
    <div className="shop_tab_product">
      <div className="row">
        {products.map((product) => (
          <div
            className={view === "grid" ? "col-lg-4 col-md-6" : "col-12"}
            key={product.id}
          >
            <article
              className={
                view === "grid" ? "single_product" : "product_list_item"
              }
            >
              <div
                className={
                  view === "list" ? "row align-items-center" : undefined
                }
              >
                <div
                  className={view === "list" ? "col-lg-4 col-md-5" : undefined}
                >
                  <div className="product_thumb">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={270}
                        height={270}
                      />
                      <span className="sr-only">View {product.name}</span>
                    </Link>
                    <div className="product_action">
                      <AddToCartButton
                        item={{
                          slug: product.slug,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        }}
                      >
                        <>
                          <ShoppingCart size={16} aria-hidden="true" /> Add to
                          cart
                        </>
                      </AddToCartButton>
                    </div>
                  </div>
                </div>
                <div
                  className={view === "list" ? "col-lg-8 col-md-7" : undefined}
                >
                  <div
                    className={
                      view === "list"
                        ? "product_list_content"
                        : "product_content"
                    }
                  >
                    <span className="product_price">
                      ${product.price.toFixed(2)}
                    </span>
                    <h3 className="product_title">
                      <Link href={`/products/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    {view === "list" && (
                      <>
                        <div
                          className="product_ratting"
                          aria-label="Rated 5 out of 5"
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
                        <p>
                          A versatile I-RAS STYLES piece designed for comfort,
                          quality, and effortless everyday styling.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
