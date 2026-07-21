import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";
export default function NotFound() {
  return (
    <StorefrontShell>
      <main className="coron-error">
        <h1>404</h1>
        <h2>Oops! PAGE NOT FOUND</h2>
        <p>
          Sorry, the page you are looking for does not exist, has been removed,
          <br />
          renamed, or is temporarily unavailable.
        </p>
        <form
          className="coron-search"
          action="/shop"
          style={{ margin: "25px auto" }}
        >
          <input name="q" aria-label="Search" placeholder="Search..." />
          <button aria-label="Submit search">⌕</button>
        </form>
        <Link className="coron-btn" href="/">
          Back to home page
        </Link>
      </main>
    </StorefrontShell>
  );
}
