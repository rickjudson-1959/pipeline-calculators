import { SiteChrome } from "@/components/site-chrome";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome showSuiteNav>{children}</SiteChrome>;
}
