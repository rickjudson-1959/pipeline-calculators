export type CalculatorStatus = "live" | "coming-soon";

export type CalculatorListing = {
  slug: string;
  title: string;
  href?: string;
  status: CalculatorStatus;
  summary: string;
};

export const CALCULATORS: CalculatorListing[] = [
  {
    slug: "hydrostatic-test",
    title: "Hydrostatic Test Calculator",
    href: "/calculators/hydrostatic-test",
    status: "live",
    summary:
      "Fill volume, bleach dose, Barlow yield pressure, and high/low elevation pressure gates for CSA Z662 and ASME B31.4 / B31.8 / 49 CFR test planning.",
  },
  {
    slug: "pressure-drop",
    title: "Pressure Drop",
    status: "coming-soon",
    summary: "Line pressure-loss estimating for a later release.",
  },
  {
    slug: "pipe-volume",
    title: "Pipe Volume",
    status: "coming-soon",
    summary: "Standalone pipe volume conversion for a later release.",
  },
];
