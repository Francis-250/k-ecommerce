import type { Metadata } from "next";
import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
import { getContactPageContent } from "@/features/storefront/content/api";
import { ContactFormUI } from "./ContactFormUI";

export const metadata: Metadata = {
  title: "Contact | I-RAS STYLES",
  description: "Get in touch with I-RAS STYLES for inquiries, support, and custom styling projects.",
};

export default async function ContactPage() {
  const content = await getContactPageContent();

  return (
    <StorefrontShell>
      <Breadcrumb title="Contact" />
      <main className="coron-container coron-content">
        <div className="coron-two">
          <section>
            <h1 className="coron-page-title">{content.title}</h1>
            <ContactFormUI />
          </section>
          <aside className="coron-article">
            <h2 className="coron-page-title">{content.sidebarTitle}</h2>
            <p>{content.sidebarDescription}</p>
            <p>Address: {content.address}</p>
            <p>
              <a href={`mailto:${content.email}`}>{content.email}</a>
            </p>
            <p>
              <a href={`tel:${content.phone.replace(/[^0-9+]/g, "")}`}>{content.phone}</a>
            </p>
            <h3>Working hours</h3>
            <p>
              <strong>{content.workingHours}</strong>
            </p>
          </aside>
        </div>
        <div
          style={{
            marginTop: 40,
            background: "#ececec",
            padding: 50,
            textAlign: "center",
          }}
        >
          <h2>Visit our store</h2>
          <p>{content.storeNotice}</p>
        </div>
      </main>
    </StorefrontShell>
  );
}
