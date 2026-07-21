import type { Metadata } from "next";
import { Breadcrumb, CoronShell } from "@/components/coron/CoronShell";
import { PageIntro, PortfolioGrid } from "@/features/storefront/content/ContentUi";
import { portfolioProjects } from "@/features/storefront/content/data";

export const metadata: Metadata = { title: "Portfolio | Coron", description: "Selected fashion campaigns, editorials, and creative projects by Coron." };
export default function PortfolioPage() { return <CoronShell><Breadcrumb title="Portfolio"/><main className="coron-container coron-content"><PageIntro eyebrow="Selected work" title="Stories shaped through style" description="Campaigns and editorials brought to life through clear ideas, tactile details, and a distinctly modern point of view."/><PortfolioGrid projects={portfolioProjects}/></main></CoronShell>; }
