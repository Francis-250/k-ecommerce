import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "./product-data";
import type { Product } from "./types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-6">
      <div className="group relative bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md h-full">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-3">
          <Link href={`/products/${product.slug}`} className="w-full h-full block relative">
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
              unoptimized
            />
          </Link>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full text-white bg-[#D4AF4A]">
                {product.badge}
              </span>
            </div>
          )}

          {/* Hover action */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
            <Link
              href={`/products/${product.slug}`}
              className="block w-full py-2 bg-[#082f35] hover:bg-[#062429] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <ShoppingCart size={14} aria-hidden="true" /> View details
            </Link>
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
              {formatPrice(product.price)}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="text-[11px] font-semibold text-[#082f35] hover:underline"
              style={{ color: "#082f35", textDecoration: "none" }}
            >
              Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}