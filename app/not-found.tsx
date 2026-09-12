import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <p className="hero-kicker">Page not found</p>
      <h1>That route is not in this toolkit yet.</h1>
      <p className="lede">
        Live tools are the hydrostatic test calculator, the wall thickness
        calculator, and the pipe volume and displacement calculator.
      </p>
      <div className="hero-actions">
        <Link className="btn btn-primary" href="/">
          Back to home
        </Link>
        <Link className="btn btn-ghost" href="/calculators/hydrostatic-test">
          Open hydrostatic test
        </Link>
        <Link className="btn btn-ghost" href="/calculators/wall-thickness">
          Open wall thickness
        </Link>
        <Link className="btn btn-ghost" href="/calculators/pipe-volume">
          Open pipe volume
        </Link>
      </div>
    </section>
  );
}
