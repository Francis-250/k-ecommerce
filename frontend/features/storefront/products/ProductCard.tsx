import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "./data";
import type { Product } from "./types";

export function ProductCard({ product }: { product: Product }) {
  return <div className="col-lg-3 col-md-4 col-sm-6"><article className="single_product"><div className="product_thumb"><Link href={`/products/${product.slug}`}><Image src={product.images[0].src} alt={product.images[0].alt} width={260} height={320} /></Link>{product.badge && <span className="product-badge">{product.badge}</span>}<div className="product_action"><Link href="/cart"><i className="fa fa-shopping-cart" aria-hidden="true" /> Add to cart</Link></div></div><div className="product_content"><span className="product_price">{formatPrice(product.price)}</span><h3 className="product_title"><Link href={`/products/${product.slug}`}>{product.name}</Link></h3></div><div className="product_info"><ul><li><Link href="/wishlist">Add to Wishlist</Link></li><li><Link href={`/products/${product.slug}`}>View detail</Link></li></ul></div></article></div>;
}
