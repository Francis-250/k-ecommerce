import type { Metadata } from "next";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { BlogGrid, PageIntro } from "@/features/storefront/content/ContentUi";
import { getBlogPosts } from "@/features/storefront/content/api";

export const metadata: Metadata = {
  title: "Journal | I-RAS STYLES",
  description:
    "Style advice, seasonal ideas, and thoughtful guides from I-RAS STYLES.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <StorefrontShell>
      <Breadcrumb title="Journal" />
      <main className="coron-container coron-content">
        <PageIntro
          eyebrow="The I-RAS STYLES journal"
          title="Ideas for considered style"
          description="Practical advice, new-season perspective, and stories behind the details that make personal style last."
        />
        <BlogGrid posts={posts} />
      </main>
    </StorefrontShell>
  );
}
