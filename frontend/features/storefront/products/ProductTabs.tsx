"use client";

import { useState } from "react";
import type { Product } from "./types";

const tabs = [{ id: "description", label: "Description" }, { id: "details", label: "Product details" }, { id: "reviews", label: "Reviews" }] as const;

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("description");
  return <div className="product_d_info"><div className="row"><div className="col-12"><div className="product_d_inner">
    <div className="product_info_button"><ul className="nav" role="tablist">{tabs.map((tab) => <li key={tab.id}><button type="button" role="tab" aria-selected={active === tab.id} className={active === tab.id ? "active" : ""} onClick={() => setActive(tab.id)}>{tab.label}</button></li>)}</ul></div>
    <div className="tab-content">
      {active === "description" && <div className="tab-pane fade show active" role="tabpanel"><div className="product_info_content"><p>{product.longDescription}</p></div></div>}
      {active === "details" && <div className="tab-pane fade show active" role="tabpanel"><div className="product_d_table"><table><tbody>{Object.entries(product.details).map(([label, value]) => <tr key={label}><td className="first_child">{label}</td><td>{value}</td></tr>)}</tbody></table></div></div>}
      {active === "reviews" && <div className="tab-pane fade show active" role="tabpanel"><div className="product_info_content"><p>{product.reviewCount} verified customer reviews. Average rating: {product.rating} out of 5.</p></div></div>}
    </div>
  </div></div></div></div>;
}
