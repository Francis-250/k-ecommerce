import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { PageIntro } from "@/features/storefront/content/ContentUi";
import { getAboutPageContent } from "@/features/storefront/content/api";

export const metadata: Metadata = {
  title: "About | I-RAS STYLES",
  description:
    "Meet I-RAS STYLES and discover our approach to enduring, thoughtful style.",
};

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <StorefrontShell>
      <Breadcrumb title="About us" />
      <main className="coron-container coron-content">
        <PageIntro
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <Image
            className="h-full min-h-80 w-full object-cover"
            src="/storefront/img/ship/about1.jpg"
            alt="The I-RAS STYLES creative team collaborating in the studio"
            width={720}
            height={560}
            priority
          />
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#D4AF4A]">
              {content.since}
            </p>
            <h2 className="mb-5 text-3xl leading-tight text-[#333]">
              {content.heading}
            </h2>
            <div className="space-y-4 text-base leading-7 text-[#666]">
              {content.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
            <Link className="coron-btn mt-6 inline-block" href="/portfolio">
              Explore our work
            </Link>
          </div>
        </section>
        <section className="my-14 border-y border-[#e5e5e5] py-12">
          <h2 className="sr-only">Our values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {content.values.map((value, index) => (
              <article key={value.title}>
                <span
                  className="mb-4 block text-3xl font-bold text-[#D4AF4A]"
                  aria-hidden="true"
                >
                  0{index + 1}
                </span>
                <h3 className="mb-2 text-xl text-[#333]">{value.title}</h3>
                <p className="leading-6 text-[#666]">{value.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="lg:order-2">
            <Image
              className="h-full min-h-80 w-full object-cover"
              src="/storefront/img/ship/about3.jpg"
              alt="An I-RAS STYLES designer reviewing materials and ideas"
              width={720}
              height={520}
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#D4AF4A]">
              How we work
            </p>
            <h2 className="mb-5 text-3xl text-[#333]">
              {content.howWeWork.heading}
            </h2>
            <p className="mb-4 text-base leading-7 text-[#666]">
              {content.howWeWork.text}
            </p>
          </div>
        </section>
      </main>
    </StorefrontShell>
  );
}
