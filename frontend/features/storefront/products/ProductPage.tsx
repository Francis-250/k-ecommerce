import Link from "next/link";
import { CoronShell } from "@/components/coron/CoronShell";
import { getRelatedProducts } from "./data";
import { ProductCard } from "./ProductCard";
import { ProductDetails } from "./ProductDetails";
import { ProductGallery } from "./ProductGallery";
import { ProductTabs } from "./ProductTabs";
import type { Product } from "./types";

export function ProductPage({ product }: { product: Product }) {
  const related = getRelatedProducts(product);
  return <CoronShell><main><div className="container">
    <div className="breadcrumbs_area"><div className="breadcrumb_content"><ul><li><Link href="/">Home</Link></li><li><Link href="/shop">Shop</Link></li><li>{product.name}</li></ul></div></div>
    <section className="product_details"><div className="row"><div className="col-lg-5 col-md-6"><ProductGallery images={product.images} name={product.name} /></div><div className="col-lg-7 col-md-6"><ProductDetails product={product} /></div></div></section>
    <ProductTabs product={product} />
    {related.length > 0 && <section className="new_product_area product_page" aria-labelledby="related-products"><div className="row"><div className="col-12"><div className="block_title"><h3 id="related-products">Related Products</h3></div></div></div><div className="row">{related.map((item) => <ProductCard product={item} key={item.slug} />)}</div></section>}
  </div></main></CoronShell>;
}
