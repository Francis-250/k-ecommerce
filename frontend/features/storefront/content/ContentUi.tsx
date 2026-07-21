import Image from "next/image";
import Link from "next/link";
import type { BlogPost, ContentSection, PortfolioProject } from "./types";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-[#D4AF4A]">
        {eyebrow}
      </p>
      <h1 className="coron-page-title mb-3">{title}</h1>
      <p className="text-base leading-7 text-[#666]">{description}</p>
    </header>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid gap-7 md:grid-cols-2">
      {posts.map((post) => (
        <article
          className="group overflow-hidden border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,.06)]"
          key={post.slug}
        >
          <Link className="block overflow-hidden" href={`/blog/${post.slug}`}>
            <Image
              className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              src={post.image}
              alt=""
              width={720}
              height={420}
            />
          </Link>
          <div className="p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF4A]">
              {post.category}{" "}
              <span className="text-[#999]">· {post.readTime}</span>
            </p>
            <h2 className="mb-3 text-2xl text-[#333]">
              <Link
                className="transition hover:text-[#D4AF4A] focus-visible:text-[#D4AF4A]"
                href={`/blog/${post.slug}`}
              >
                {post.title}
              </Link>
            </h2>
            <p className="mb-5 leading-6 text-[#666]">{post.excerpt}</p>
            <Link
              className="font-bold text-[#D4AF4A] underline-offset-4 hover:underline"
              href={`/blog/${post.slug}`}
            >
              Read article <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PortfolioGrid({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <article className="group" key={project.slug}>
          <Link
            className="relative block aspect-square overflow-hidden bg-[#f2f2f2]"
            href={`/portfolio/${project.slug}`}
          >
            <Image
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={project.image}
              alt=""
              width={520}
              height={520}
            />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-5 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              View project{" "}
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </span>
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#D4AF4A]">
            {project.category}
          </p>
          <h2 className="mt-1 text-xl text-[#333]">
            <Link
              className="hover:text-[#D4AF4A]"
              href={`/portfolio/${project.slug}`}
            >
              {project.title}
            </Link>
          </h2>
          <p className="mt-2 text-[#666]">{project.summary}</p>
        </article>
      ))}
    </div>
  );
}

export function ArticleSections({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="mb-3 text-2xl text-[#333]">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p className="mb-4 text-base leading-7 text-[#555]" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex items-center gap-2 font-bold text-[#D4AF4A] underline-offset-4 hover:underline"
      href={href}
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
