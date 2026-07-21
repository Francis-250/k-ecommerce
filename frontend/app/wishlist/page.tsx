import Image from "next/image";
import Link from "next/link";
import { Rss, Share2 } from "lucide-react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";

const products = [
  { name: "Kente Panel Sneakers", slug: "kente-panel-sneakers", image: "cart17.png", price: "$84.00" },
  { name: "Maasai Beaded Jewelry Set", slug: "maasai-beaded-jewelry-set", image: "cart18.png", price: "$72.00" },
  { name: "Mudcloth Leather Backpack", slug: "mudcloth-leather-backpack", image: "cart19.png", price: "$124.00" },
];

export default function WishlistPage() {
  return (
    <StorefrontShell>
      <Breadcrumb title="wishlist" />
      <div className="shopping_cart_area">
        <form action="#">
          <div className="row">
            <div className="col-12">
              <div className="table_desc wishlist">
                <div className="cart_page table-responsive">
                  <table>
                    <caption className="sr-only">
                      Products in your wishlist
                    </caption>
                    <thead>
                      <tr>
                        <th className="product_remove">Delete</th>
                        <th className="product_thumb">Image</th>
                        <th className="product_name">Product</th>
                        <th className="product-price">Price</th>
                        <th className="product_quantity">Stock Status</th>
                        <th className="product_total">Add To Cart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.name}>
                          <td className="product_remove">
                            <button
                              type="button"
                              aria-label={`Delete ${product.name}`}
                            >
                              X
                            </button>
                          </td>
                          <td className="product_thumb">
                            <Link href={`/products/${product.slug}`}>
                              <Image
                                src={`/storefront/assets/img/cart/${product.image}`}
                                alt={product.name}
                                width={100}
                                height={100}
                                unoptimized
                              />
                            </Link>
                          </td>
                          <td className="product_name">
                            <Link href={`/products/${product.slug}`}>
                              {product.name}
                            </Link>
                          </td>
                          <td className="product-price">{product.price}</td>
                          <td className="product_quantity">In Stock</td>
                          <td className="product_total">
                            <Link href="/cart">Add To Cart</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="row">
          <div className="col-12">
            <div className="wishlist-share">
              <h4>Share on:</h4>
              <ul>
                <li>
                  <a href="#" aria-label="RSS">
                    <Rss size={16} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="#" aria-label="Vimeo">
                    <Share2 size={16} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="#" aria-label="Tumblr">
                    <Share2 size={16} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="#" aria-label="Pinterest">
                    <Share2 size={16} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
