import type { Metadata } from "next";
import Link from "next/link";
import { NpsReferenceTable } from "@/components/nps-reference-table";

export const metadata: Metadata = {
  title: "NPS to OD Reference Table",
  description:
    "ASME B36.10 / B36.19 nominal pipe size to true outside diameter reference table, in inches and millimetres, for mapping NPS to OD across the Pipe-Up calculator suite.",
};

export default function NpsReferencePage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / NPS to OD Reference
        </p>
        <p className="hero-kicker">Reference table</p>
        <h1>NPS to OD Reference Table</h1>
        <p>
          A lookup table for nominal pipe size to true outside diameter,
          under ASME B36.10 / B36.19. Outside diameter is fixed per NPS
          regardless of schedule or wall thickness, so this table applies no
          matter what wall thickness a project uses. Use it to convert an
          NPS callout into the true OD value the other calculators in this
          suite expect.
        </p>
      </header>

      <NpsReferenceTable />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this table covers</h2>
        <p>
          Nominal pipe size, or NPS, is a naming convention, not a physical
          measurement. For NPS 1/8 through NPS 12, the NPS number does not
          equal the true outside diameter. Starting at NPS 14, the NPS
          number equals the true outside diameter in inches exactly. This
          table lists the true OD for every standard NPS from 1/8 inch
          through 60 inch, in both inches and millimetres.
        </p>
        <p>
          This page lists outside diameter only. It does not include a
          schedule-by-schedule wall thickness chart, since wall thickness
          varies by schedule and by manufacturer, and larger transmission
          pipe is commonly specified by wall thickness directly rather than
          by a schedule number. Confirm wall thickness against project
          specifications or the current edition of ASME B36.10 / B36.19.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="nps-disclaimer-heading">
        <h2 id="nps-disclaimer-heading">Disclaimer</h2>
        <p>
          This table is an engineering aid for converting NPS to true
          outside diameter. It is not stamped design and it is not a
          substitute for the current edition of ASME B36.10 / B36.19 or
          project piping specifications. Confirm sizes against project data
          and keep the engineer of record in the loop.
        </p>
      </aside>
    </>
  );
}
