import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { CatalogProduct } from "./catalog-data";
import { AddToCartButton } from "@/features/storefront/cart";

export function ProductResults({
  products,
  view,
}: {
  products: CatalogProduct[];
  view: "grid" | "list";
}) {
  if (!products.length) {
    return (
      <div className="py-12 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-600">
        <h2 className="text-lg font-bold text-slate-900 mb-1">No products found</h2>
        <p className="text-xs text-slate-500">Try selecting another category or adjusting your filter range.</p>
      </div>
    );
  }

  return (
    <div className="shop_tab_product">
      <div className="row">
        {products.map((product) => (
          <div
            className={view === "grid" ? "col-lg-4 col-md-6 mb-6" : "col-12 mb-4"}
            key={product.id}
          >
            {view === "grid" ? (
              <div className="group relative bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md h-full">
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-3">
                  <Link href={`/products/${product.slug}`} className="w-full h-full block relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                      unoptimized
                    />
                  </Link>

                  {/* Badge */}
                  {product.featured && (
                    <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full text-white bg-[#D4AF4A]">
                        Hot
                      </span>
                    </div>
                  )}

                  {/* Hover Add to Cart */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                    <AddToCartButton
                      item={{
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
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
                <div className="p-3.5 flex flex-col justify-between flex-1 bg-white border-t border-slate-100">
                  <div>
                    {product.category && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        {product.category}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-[#082f35] transition-colors mb-1.5">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="text-base font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-semibold text-[#082f35] hover:underline"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="group relative bg-white rounded-xl border border-slate-200/80 overflow-hidden p-4 flex flex-col sm:flex-row gap-4 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
                <div className="relative w-full sm:w-48 aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <Link href={`/products/${product.slug}`} className="w-full h-full block relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </Link>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#082f35] transition-colors">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      A premium piece from the I-RAS STYLES collection, crafted for comfort and style.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-lg font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <AddToCartButton
                      item={{
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                      }}
                    >
                      <span className="px-4 py-2 bg-[#082f35] hover:bg-[#062429] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition cursor-pointer">
                        <ShoppingCart size={14} /> Add to cart
                      </span>
                    </AddToCartButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
