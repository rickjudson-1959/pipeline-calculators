import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

function siteUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Pipeline Calculators | Pipe-Up",
    template: "%s | Pipe-Up Pipeline Calculators",
  },
  description:
    "Field and office pipeline calculators for hydrostatic test planning, wall thickness / MAOP sizing, pipe volume and displacement, and natural gas flow and pressure drop in Canada and the United States, under CSA Z662 and ASME B31.4 / B31.8.",
  applicationName: "Pipe-Up Pipeline Calculators",
  authors: [{ name: "Rick Judson" }],
  keywords: [
    "pipeline calculator",
    "hydrostatic test",
    "CSA Z662",
    "ASME B31.4",
    "ASME B31.8",
    "49 CFR 192",
    "49 CFR 195",
    "fill volume",
    "pipe volume",
    "pipeline displacement",
    "wall thickness",
    "MAOP",
    "natural gas flow",
    "Weymouth",
    "Panhandle A",
    "Panhandle B",
    "pressure drop",
    "Pipe-Up",
  ],
};

export const viewport: Viewport = {
  themeColor: "#1f497d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${sourceSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="site-shell">
          <SiteHeader />
          <main className="site-main">
            <div className="site-wrap">{children}</div>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
