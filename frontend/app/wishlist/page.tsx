"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, MessageCircle, Share2, Users } from "lucide-react";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { useCart } from "@/features/storefront/cart";

const initialProducts = [
  {
    id: "1",
    name: "Kente Panel Sneakers",
    slug: "kente-panel-sneakers",
    image: "cart17.png",
    price: 84.0,
    stock: "In Stock",
  },
  {
    id: "2",
    name: "Maasai Beaded Jewelry Set",
    slug: "maasai-beaded-jewelry-set",
    image: "cart18.png",
    price: 72.0,
    stock: "In Stock",
  },
  {
    id: "3",
    name: "Mudcloth Leather Backpack",
    slug: "mudcloth-leather-backpack",
    image: "cart19.png",
    price: 124.0,
    stock: "In Stock",
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState(initialProducts);
  const { addItem, openCartDrawer } = useCart();

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((product) => product.id !== id));
  };

  const handleAddToCart = (product: (typeof initialProducts)[number]) => {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: `/storefront/assets/img/cart/${product.image}`,
    });
    openCartDrawer();
  };

  return (
    <StorefrontShell>
      <Breadcrumb title="wishlist" />
      <div className="shopping_cart_area">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {items.length === 0 ? (
                <div className="empty_wishlist_box text-center py-5">
                  <Heart size={44} className="text-muted mb-3 mx-auto" />
                  <h3>Your Wishlist is Empty</h3>
                  <p>Explore our catalog and save your favorite African fashion pieces.</p>
                  <Link href="/shop" className="coron-btn mt-3 d-inline-block">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <form action="#">
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
                          {items.map((product) => (
                            <tr key={product.id}>
                              <td className="product_remove">
                                <button
                                  type="button"
                                  onClick={() => handleRemove(product.id)}
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
                              <td className="product-price">
                                ${product.price.toFixed(2)}
                              </td>
                              <td className="product_quantity">
                                {product.stock}
                              </td>
                              <td className="product_total">
                                <button
                                  type="button"
                                  className="coron-btn"
                                  onClick={() => handleAddToCart(product)}
                                >
                                  Add To Cart
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="wishlist-share">
                <h4>Share on:</h4>
                <ul>
                  <li>
                    <a href="#facebook" aria-label="Facebook">
                      <Users size={16} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="#instagram" aria-label="Instagram">
                      <Camera size={16} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="#twitter" aria-label="Twitter">
                      <MessageCircle size={16} aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="#share" aria-label="Share">
                      <Share2 size={16} aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
