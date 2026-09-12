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
    slug: "wall-thickness",
    title: "Pipeline Wall Thickness",
    href: "/calculators/wall-thickness",
    status: "live",
    summary:
      "Pressure-design wall, MAOP, E, T, D/t slenderness, and a multi-standard comparison grid for ASME B31.4, ASME B31.8 location class, and CSA Z662 Class 1.",
  },
  {
    slug: "pipe-volume",
    title: "Pipe Volume",
    status: "coming-soon",
    summary: "Standalone pipe volume conversion for a later release.",
  },
];
