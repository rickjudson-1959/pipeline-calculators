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
    title: "Pipeline Volume & Displacement",
    href: "/calculators/pipe-volume",
    status: "live",
    summary:
      "Inside diameter, line fill volume, volume per distance, fluid fill mass, fill / displacement time, and chemical inhibitor dosage for metric and US Customary pipe sections.",
  },
  {
    slug: "gas-flow",
    title: "Natural Gas Flow & Pressure Drop",
    href: "/calculators/gas-flow",
    status: "live",
    summary:
      "Weymouth, Panhandle A, and Panhandle B flow from inlet and outlet pressure, gas gravity, pipe size, length, and line efficiency in metric and US Customary units.",
  },
  {
    slug: "b31g",
    title: "ASME B31G Corroded Pipe",
    href: "/calculators/b31g",
    status: "live",
    summary:
      "Original B31G and Modified B31G remaining strength, depth ratio, safe pressure, modified RSF, and an operating safety gate for a blunt metal-loss defect.",
  },
  {
    slug: "sideboom-span-lift",
    title: "Sideboom Spanning and Lift Load",
    href: "/calculators/sideboom-span-lift",
    status: "live",
    summary:
      "Hollow-section moment of inertia, maximum safe span between sidebooms, and required lift capacity per machine from ASME B31 / Pipeline Infrastructure Eq 14-4.",
  },
  {
    slug: "field-bending-limits",
    title: "Field Bending Strain and Limits",
    href: "/calculators/field-bending-limits",
    status: "live",
    summary:
      "Coating-based bending strain limits and maximum deflection from Pipeline Infrastructure Appendix A acceptance criteria.",
  },
];
