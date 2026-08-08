import type { Metadata } from "next";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { getFaqPageContent } from "@/features/storefront/content/api";

export const metadata: Metadata = {
  title: "FAQ | I-RAS STYLES",
  description: "Frequently asked questions about orders, shipping, sizing, returns, and services.",
};

export default async function FaqPage() {
  const content = await getFaqPageContent();

  return (
    <StorefrontShell>
      <Breadcrumb title={content.title} />
      <main className="coron-container coron-content coron-article">
        <h1 className="coron-page-title">{content.title}</h1>
        <h4>{content.introHeading}</h4>
        <p>{content.introText}</p>
        <section className="coron-accordion" style={{ marginTop: 30 }}>
          {content.items.map((item, i) => (
            <details key={item.question} open={i === 0}>
              <summary className="font-semibold text-slate-900 cursor-pointer">
                {item.question}
              </summary>
              <div className="mt-2 text-slate-600 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </section>
      </main>
    </StorefrontShell>
  );
}
