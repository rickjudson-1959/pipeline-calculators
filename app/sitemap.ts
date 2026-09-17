import type { MetadataRoute } from "next";

const SITE = "https://pipeline-calculators.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/` },
    { url: `${SITE}/calculators/hydrostatic-test` },
    { url: `${SITE}/calculators/wall-thickness` },
    { url: `${SITE}/calculators/pipe-volume` },
    { url: `${SITE}/calculators/gas-flow` },
    { url: `${SITE}/calculators/b31g` },
    { url: `${SITE}/calculators/sideboom-span-lift` },
    { url: `${SITE}/calculators/field-bending-limits` },
  ];
}
