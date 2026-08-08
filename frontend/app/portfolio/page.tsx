import type { Metadata } from "next";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import {
  PageIntro,
  PortfolioGrid,
} from "@/features/storefront/content/ContentUi";
import { getPortfolioProjects } from "@/features/storefront/content/api";

export const metadata: Metadata = {
  title: "Portfolio | I-RAS STYLES",
  description:
    "Selected fashion campaigns, editorials, and creative projects by I-RAS STYLES.",
};
export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  return (
    <StorefrontShell>
      <Breadcrumb title="Portfolio" />
      <main className="coron-container coron-content">
        <PageIntro
          eyebrow="Selected work"
          title="Stories shaped through style"
          description="Campaigns and editorials brought to life through clear ideas, tactile details, and a distinctly modern point of view."
        />
        <PortfolioGrid projects={projects} />
      </main>
    </StorefrontShell>
  );
}
