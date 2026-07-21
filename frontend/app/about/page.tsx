import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { PageIntro } from "@/features/storefront/content/ContentUi";

export const metadata: Metadata = {
  title: "About | I-RAS STYLES",
  description:
    "Meet I-RAS STYLES and discover our approach to enduring, thoughtful style.",
};
const values = [
  {
    title: "Purposeful design",
    text: "Every detail should earn its place and make daily life feel easier.",
  },
  {
    title: "Lasting quality",
    text: "We favour materials and construction designed to be worn, loved, and kept.",
  },
  {
    title: "Personal style",
    text: "Confidence comes from clothes that support the person wearing them.",
  },
];
export default function AboutPage() {
  return (
    <StorefrontShell>
      <Breadcrumb title="About us" />
      <main className="coron-container coron-content">
        <PageIntro
          eyebrow="Our story"
          title="Style made thoughtful"
          description="I-RAS STYLES brings together enduring design, honest quality, and an easy sense of individuality."
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
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#00bba6]">
              Since 2010
            </p>
            <h2 className="mb-5 text-3xl leading-tight text-[#333]">
              Designed for real wardrobes and real lives
            </h2>
            <div className="space-y-4 text-base leading-7 text-[#666]">
              <p>
                We started I-RAS STYLES with a simple belief: good style should
                feel considered, useful, and entirely your own.
              </p>
              <p>
                Our team works across design, sourcing, and storytelling to
                create collections that balance modern perspective with lasting
                appeal.
              </p>
            </div>
            <Link className="coron-btn mt-6 inline-block" href="/portfolio">
              Explore our work
            </Link>
          </div>
        </section>
        <section className="my-14 border-y border-[#e5e5e5] py-12">
          <h2 className="sr-only">Our values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <article key={value.title}>
                <span
                  className="mb-4 block text-3xl font-bold text-[#00bba6]"
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
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#00bba6]">
              How we work
            </p>
            <h2 className="mb-5 text-3xl text-[#333]">
              Curiosity, craft, and close collaboration
            </h2>
            <p className="mb-4 text-base leading-7 text-[#666]">
              From the first sketch to the final fitting, we ask what will make
              a piece more useful, more expressive, and better made.
            </p>
            <p className="text-base leading-7 text-[#666]">
              That same care shapes our campaigns, customer experience, and the
              long-term relationships behind every collection.
            </p>
          </div>
        </section>
      </main>
    </StorefrontShell>
  );
}
