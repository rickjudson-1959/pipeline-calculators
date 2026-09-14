import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <SiteChrome showSuiteNav>
      <section className="hero">
        <p className="hero-kicker">Page not found</p>
        <h1>That route is not in this toolkit yet.</h1>
        <p className="lede">
          Live tools are the hydrostatic test calculator, the wall thickness
          calculator, the pipe volume and displacement calculator, the
          natural gas flow calculator, and the ASME B31G corroded-pipe
          calculator.
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
          <Link className="btn btn-ghost" href="/calculators/gas-flow">
            Open gas flow
          </Link>
          <Link className="btn btn-ghost" href="/calculators/b31g">
            Open B31G
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
