import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type SiteChromeProps = {
  children: ReactNode;
  showSuiteNav?: boolean;
};

export function SiteChrome({
  children,
  showSuiteNav = true,
}: SiteChromeProps) {
  return (
    <>
      <SiteHeader showSuiteNav={showSuiteNav} />
      <main className="site-main">
        <div className="site-wrap">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
