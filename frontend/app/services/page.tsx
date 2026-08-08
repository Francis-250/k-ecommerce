import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { getServicesPageContent } from "@/features/storefront/content/api";

export const metadata: Metadata = {
  title: "Services | I-RAS STYLES",
  description: "Creative services, branding, web design, and digital solutions by I-RAS STYLES.",
};

export default async function ServicesPage() {
  const content = await getServicesPageContent();

  return (
    <StorefrontShell>
      <Breadcrumb title="Services" />
      <main className="coron-container coron-content coron-article">
        <section className="coron-products">
          {content.cards.map((card) => (
            <article className="coron-card" key={card.title}>
              <Image
                src={card.image}
                alt={card.title}
                width={350}
                height={230}
              />
              <div className="coron-cardbody">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section style={{ margin: "50px 0" }}>
          <div className="coron-center">
            <h2>{content.heading}</h2>
            <p>{content.subheading}</p>
          </div>
          <div className="coron-products" style={{ marginTop: 25 }}>
            {content.services.map((item) => (
              <article className="coron-cardbody coron-center" key={item.name}>
                <div className="coron-price">{item.icon}</div>
                <h3>{item.name.toUpperCase()}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="coron-two">
          <Image
            src={content.unlimitedSection.image}
            alt={content.unlimitedSection.title}
            width={555}
            height={370}
          />
          <div>
            <h1>{content.unlimitedSection.title}</h1>
            <p>{content.unlimitedSection.text}</p>
            <Link className="coron-btn" href={content.unlimitedSection.ctaLink}>
              {content.unlimitedSection.ctaText}
            </Link>
          </div>
        </section>
      </main>
    </StorefrontShell>
  );
}
