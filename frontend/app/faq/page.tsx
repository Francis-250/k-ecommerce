import {
  Breadcrumb,
  StorefrontShell,
} from "@/components/storefront/StorefrontShell";
const questions = [
  "Mauris congue euismod purus at semper. Morbi et vulputate massa?",
  "Donec mattis finibus elit ut tristique?",
  "Aenean elit orci, efficitur quis nisl at, accumsan?",
  "Pellentesque habitant morbi tristique senectus et netus?",
  "Nam pellentesque aliquam metus?",
  "Aenean elit orci, efficitur quis nisl at?",
  "Morbi gravida, nisi id fringilla ultricies, elit lorem?",
];
export default function FaqPage() {
  return (
    <StorefrontShell>
      <Breadcrumb title="Frequently asked questions" />
      <main className="coron-container coron-content coron-article">
        <h1 className="coron-page-title">Frequently asked questions</h1>
        <h4>
          Below are frequently asked questions; you may find the answer for
          yourself.
        </h4>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id erat
          sagittis, faucibus metus malesuada, eleifend turpis.
        </p>
        <section className="coron-accordion" style={{ marginTop: 30 }}>
          {questions.map((q, i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <div>
                Donec mattis finibus elit ut tristique. Nullam tempus nunc eget
                arcu vulputate, eu porttitor tellus commodo. Aliquam consectetur
                lorem eu viverra lobortis.
              </div>
            </details>
          ))}
        </section>
      </main>
    </StorefrontShell>
  );
}
