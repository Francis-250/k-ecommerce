"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "./data";
import type { Product } from "./types";
import { AddToCartButton } from "@/features/storefront/cart";

export function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState<Record<string, string>>(() => Object.fromEntries(product.options.map((option) => [option.name, option.values[0]])));
  return <div className="product_d_right">
    <span className="product-category">{product.category}</span><h1>{product.name}</h1>
    <div className="product_ratting mb-10" aria-label={`${product.rating} out of 5 stars`}><ul>{[1, 2, 3, 4, 5].map((star) => <li key={star}><i className={`fa fa-star${star > product.rating ? "-o" : ""}`} aria-hidden="true" /></li>)}<li><a href="#product-reviews"> {product.reviewCount} reviews</a></li></ul></div>
    <div className="product_desc"><p>{product.description}</p></div>
    <div className="content_price mb-15"><span>{formatPrice(product.price)}</span>{product.previousPrice && <span className="old-price">{formatPrice(product.previousPrice)}</span>}</div>
    <p className="product-sku">SKU: {product.sku}</p>
    {product.options.map((option) => <div className="product_d_size mb-20" key={option.name}><label htmlFor={`option-${option.name}`}>{option.name}</label><select id={`option-${option.name}`} value={options[option.name]} onChange={(event) => setOptions((current) => ({ ...current, [option.name]: event.target.value }))}>{option.values.map((value) => <option key={value}>{value}</option>)}</select></div>)}
    <div className="box_quantity mb-20"><label htmlFor="product-quantity">Quantity</label><input id="product-quantity" min="1" max={product.stock} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} type="number" /><AddToCartButton item={{ slug: product.slug, name: product.name, price: product.price, image: product.images[0].src, quantity, options }}><><i className="fa fa-shopping-cart" aria-hidden="true" /> Add to cart</></AddToCartButton><Link href="/wishlist" title="Add to wishlist"><i className="fa fa-heart" aria-hidden="true" /></Link></div>
    <div className="product_stock mb-20"><p>{product.stock} items</p><span>In stock</span></div>
    <div className="wishlist-share"><h4>Share:</h4><ul>{["facebook", "twitter", "pinterest", "linkedin"].map((icon) => <li key={icon}><a href="#share" aria-label={`Share on ${icon}`}><i className={`fa fa-${icon}`} aria-hidden="true" /></a></li>)}</ul></div>
  </div>;
}
