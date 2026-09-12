import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/calculators/hydrostatic-test", label: "Hydrostatic Test" },
  { href: "/calculators/wall-thickness", label: "Wall Thickness" },
  { href: "/calculators/pipe-volume", label: "Pipe Volume" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-wrap header-inner">
        <Link href="/" className="brand">
          <SiteLogo size={34} />
          <span className="brand-text">
            <span className="brand-kicker">Pipe-Up</span>
            <span className="brand-name">Pipeline Calculators</span>
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-list">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
