import Image from "next/image";
import Link from "next/link";
import { CoronShell } from "@/components/coron/CoronShell";
import { ProductGrid, Sidebar } from "@/components/coron/Catalog";

const brands = [1, 2, 3, 4, 5, 6];

function ProductSection({
  title,
  count = 3,
}: {
  title: string;
  count?: number;
}) {
  return (
    <section
      className="new_product_area"
      aria-labelledby={`section-${title.replaceAll(" ", "-").toLowerCase()}`}
    >
      <div className="block_title">
        <h2 id={`section-${title.replaceAll(" ", "-").toLowerCase()}`}>
          {title}
        </h2>
      </div>
      <div className="product_active">
        <ProductGrid count={count} columns="col-lg-4 col-md-6" />
      </div>
    </section>
  );
}

export function StorefrontHome() {
  return (
    <CoronShell>
      <main className="pos_home_section">
        <div className="row pos_home">
          <Sidebar home />
          <div className="col-lg-9 col-md-12">
            <section
              className="banner_slider slider_1"
              aria-labelledby="home-hero-title"
            >
              <div className="slider_active">
                <div
                  className="single_slider home-hero-slide"
                  style={{
                    backgroundImage:
                      "url('/coron/assets/img/slider/slide_1.png')",
                  }}
                >
                  <Link className="home-hero-click-target" href="/shop?gender=Women" aria-label="Shop the women's collection"><span className="sr-only">Shop the women&apos;s collection</span></Link>
                  <div className="slider_content">
                    <div className="slider_content_inner">
                      <p>New season essentials</p>
                      <h1 id="home-hero-title">Women&apos;s Fashion</h1>
                      <p>
                        Thoughtful everyday pieces, selected for effortless
                        style.
                      </p>
                      <span className="hero-cta">Shop the collection</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <ProductSection title="New Products" />
            <div className="banner_area mb-60">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div className="single_banner">
                    <Link href="/shop" aria-label="Shop the summer sale">
                      <Image
                        src="/coron/assets/img/banner/banner7.jpg"
                        alt="Summer collection"
                        width={420}
                        height={180}
                      />
                      <div className="banner_title">
                        <p>
                          Up to <span>40%</span> off
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="single_banner">
                    <Link href="/shop" aria-label="Shop selected styles">
                      <Image
                        src="/coron/assets/img/banner/banner8.jpg"
                        alt="Selected fashion styles"
                        width={420}
                        height={180}
                      />
                      <div className="banner_title title_2">
                        <p>
                          sale off <span>30%</span>
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <ProductSection title="Featured Products" />
            <section
              className="brand_logo mb-60"
              aria-labelledby="brands-title"
            >
              <div className="block_title">
                <h2 id="brands-title">Our Brands</h2>
              </div>
              <div className="brand_active brand-row">
                  {brands.map((brand) => (
                    <div className="brand-item" key={brand}>
                      <div className="single_brand">
                        <Link href="/shop">
                          <Image
                            src={`/coron/assets/img/brand/brand${brand}.jpg`}
                            alt={`Browse brand ${brand}`}
                            width={170}
                            height={90}
                          />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </CoronShell>
  );
}
