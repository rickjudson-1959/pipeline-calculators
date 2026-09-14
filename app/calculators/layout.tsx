import type { ReactNode } from "react";
import { SiteChrome } from "@/components/site-chrome";

export default function CalculatorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SiteChrome showSuiteNav={false}>{children}</SiteChrome>;
}
