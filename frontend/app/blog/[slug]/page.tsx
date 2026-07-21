import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb, CoronShell } from "@/components/coron/CoronShell";
import { ArticleSections, BackLink } from "@/features/storefront/content/ContentUi";
import { blogPosts, getBlogPost } from "@/features/storefront/content/data";

export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const post = getBlogPost((await params).slug); return post ? { title: `${post.title} | Coron`, description: post.excerpt } : {}; }

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug); if (!post) notFound();
  return <CoronShell><Breadcrumb title={post.title}/><main className="coron-container coron-content"><article className="mx-auto max-w-4xl"><BackLink href="/blog">All journal stories</BackLink><header className="my-8"><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#00bba6]">{post.category}</p><h1 className="coron-page-title mb-4 max-w-3xl">{post.title}</h1><p className="max-w-2xl text-lg leading-8 text-[#666]">{post.excerpt}</p><p className="mt-4 text-sm text-[#999]"><time dateTime={post.publishedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(post.publishedAt))}</time> · {post.readTime}</p></header><Image className="mb-10 aspect-[16/9] w-full object-cover" src={post.image} alt="" width={1100} height={620} priority/><ArticleSections sections={post.sections}/></article></main></CoronShell>;
}
