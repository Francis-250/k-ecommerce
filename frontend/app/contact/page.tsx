import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
export default function ContactPage() {
  return (
    <StorefrontShell>
      <Breadcrumb title="Contact" />
      <main className="coron-container coron-content">
        <div className="coron-two">
          <section>
            <h1 className="coron-page-title">Tell us your project</h1>
            <form className="coron-form">
              <div className="coron-two">
                <input aria-label="Name" placeholder="Name *" required />
                <input
                  aria-label="Email"
                  placeholder="Email *"
                  type="email"
                  required
                />
                <input aria-label="Subject" placeholder="Subject *" />
                <input aria-label="Phone" placeholder="Phone *" type="tel" />
              </div>
              <textarea aria-label="Message" placeholder="Message *" required />
              <button className="coron-btn" type="submit">
                Send message
              </button>
            </form>
          </section>
          <aside className="coron-article">
            <h2 className="coron-page-title">Contact us</h2>
            <p>
              Claritas est etiam processus dynamicus, qui sequitur mutationem
              consuetudium lectorum.
            </p>
            <p>Address: No 40 Baria Street 133/2, New York City</p>
            <p>
              <a href="mailto:info@roadthemes.com">info@roadthemes.com</a>
            </p>
            <p>
              <a href="tel:+01234567890">0 (1234) 567 890</a>
            </p>
            <h3>Working hours</h3>
            <p>
              <strong>Monday – Saturday:</strong> 08AM – 22PM
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
          <p>No 40 Baria Street 133/2, New York City</p>
        </div>
      </main>
    </StorefrontShell>
  );
}
