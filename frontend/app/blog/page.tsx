import type { Metadata } from "next";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { BlogGrid, PageIntro } from "@/features/storefront/content/ContentUi";
import { blogPosts } from "@/features/storefront/content/data";

export const metadata: Metadata = {
  title: "Journal | Coron",
  description:
    "Style advice, seasonal ideas, and thoughtful guides from Coron.",
};

export default function BlogPage() {
  return (
    <StorefrontShell>
      <Breadcrumb title="Journal" />
      <main className="coron-container coron-content">
        <PageIntro
          eyebrow="The Coron journal"
          title="Ideas for considered style"
          description="Practical advice, new-season perspective, and stories behind the details that make personal style last."
        />
        <BlogGrid posts={blogPosts} />
      </main>
    </StorefrontShell>
  );
}
