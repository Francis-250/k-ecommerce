import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { getRelatedProducts } from "./product-data";
import { ProductCard } from "./ProductCard";
import { ProductDetails } from "./ProductDetails";
import { ProductGallery } from "./ProductGallery";
import { ProductTabs } from "./ProductTabs";
import { RecordProductView } from "../recommendations/RecordProductView";
import type { Product } from "./types";

export function ProductPage({
  product,
  related,
}: {
  product: Product;
  related?: Product[];
}) {
  const relatedProducts = related?.length ? related : getRelatedProducts(product);
  return (
    <StorefrontShell>
      <main>
        <div className="container">
          <RecordProductView name={product.name} category={product.category} />
          <Breadcrumb
            title={product.name}
            links={[{ label: "Shop", href: "/shop" }]}
          />
          <section className="product_details">
            <div className="row">
              <div className="col-lg-5 col-md-6">
                <ProductGallery images={product.images} name={product.name} />
              </div>
              <div className="col-lg-7 col-md-6">
                <ProductDetails product={product} />
              </div>
            </div>
          </section>
          <ProductTabs product={product} />
          {relatedProducts.length > 0 && (
            <section
              className="new_product_area product_page"
              aria-labelledby="related-products"
            >
              <div className="row">
                <div className="col-12">
                  <div className="block_title">
                    <h3 id="related-products">Related Products</h3>
                  </div>
                </div>
              </div>
              <div className="row">
                {relatedProducts.map((item) => (
                  <ProductCard product={item} key={item.slug} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </StorefrontShell>
  );
}
