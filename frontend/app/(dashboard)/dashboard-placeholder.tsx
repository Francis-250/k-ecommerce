import { Breadcrumb, CoronShell } from "@/components/coron/CoronShell";

export function DashboardPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <CoronShell>
      <Breadcrumb title={title} />
      <div className="coron-container coron-content">
        <section className="coron-sidebar-box coron-center">
          <h3>{title}</h3>
          <div style={{ padding: 40 }}>
            <h1 className="coron-page-title">{title}</h1>
            <p>{description}</p>
            <p>
              This application area is preserved and ready to connect to its
              existing business data.
            </p>
          </div>
        </section>
      </div>
    </CoronShell>
  );
}
