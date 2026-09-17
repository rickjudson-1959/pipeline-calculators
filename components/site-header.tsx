import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

const SUITE_NAV = [
  { href: "/", label: "Home" },
  { href: "/calculators/hydrostatic-test", label: "Hydrostatic Test" },
  { href: "/calculators/wall-thickness", label: "Wall Thickness" },
  { href: "/calculators/pipe-volume", label: "Pipe Volume" },
  { href: "/calculators/gas-flow", label: "Gas Flow" },
  { href: "/calculators/b31g", label: "B31G" },
  { href: "/calculators/sideboom-span-lift", label: "Sideboom Span" },
  { href: "/calculators/field-bending-limits", label: "Field Bending" },
];

type SiteHeaderProps = {
  /** When false, hide sibling-calculator hops (used on tool pages). */
  showSuiteNav?: boolean;
};

export function SiteHeader({ showSuiteNav = true }: SiteHeaderProps) {
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
        {showSuiteNav ? (
          <nav aria-label="Primary">
            <ul className="nav-list">
              {SUITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
