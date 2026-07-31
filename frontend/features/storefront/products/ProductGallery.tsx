"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn } from "lucide-react";
import type { ProductImage } from "./types";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="product_tab fix">
      <div className="tab-content produc_tab_c">
        <div className="tab-pane fade show active">
          <div className="modal_img">
            <Image
              src={current.src}
              alt={current.alt || name}
              width={560}
              height={680}
              priority
              className="product-main-image"
            />
            <div className="view_img">
              <a
                className="large_view"
                href={current.src}
                aria-label="Open full-size image"
              >
                <ZoomIn size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {images.length > 1 && (
        <div className="product_tab_button">
          <ul className="nav" aria-label={`${name} images`}>
            {images.map((item, index) => (
              <li key={item.src}>
                <button
                  type="button"
                  className={active === index ? "active" : ""}
                  onClick={() => setActive(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={active === index}
                >
                  <Image src={item.src} alt="" width={90} height={100} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
