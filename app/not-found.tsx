import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <p className="hero-kicker">Page not found</p>
      <h1>That route is not in this toolkit yet.</h1>
      <p className="lede">
        The live tool is the hydrostatic test calculator. Pressure drop and pipe
        volume are listed as coming soon.
      </p>
      <div className="hero-actions">
        <Link className="btn btn-primary" href="/">
          Back to home
        </Link>
        <Link className="btn btn-ghost" href="/calculators/hydrostatic-test">
          Open hydrostatic test
        </Link>
      </div>
    </section>
  );
}
