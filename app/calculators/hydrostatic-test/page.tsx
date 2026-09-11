import type { Metadata } from "next";
import Link from "next/link";
import { HydrostaticCalculator } from "@/components/hydrostatic-calculator";

export const metadata: Metadata = {
  title: "Hydrostatic Test Calculator",
  description:
    "CSA Z662 hydrostatic test calculator for fill volume, bleach dose, Barlow yield pressure, and high/low elevation pressure gates.",
};

export default function HydrostaticTestPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / Hydrostatic Test
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>Hydrostatic Test Calculator</h1>
        <p>
          Size fill volume and check high-point and low-point pressure for a
          test section. Defaults are a 508 mm, 6.6 mm WT, Grade 483 example.
          Results update as you edit.
        </p>
      </header>

      <HydrostaticCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Inside diameter is OD minus two wall thicknesses. CUBES is internal
          area times section length. Barrels use 6.28981 barrels per cubic
          metre. Bleach is 1 litre per cubic metre.
        </p>
        <p>
          Yield pressure is Barlow: 2 x SMYS x WT / OD, with SMYS converted from
          MPa to kPa. High and low pressures apply 9.81 kPa of head per metre
          between the test point and each elevation. The only gates shown are
          high-point pressure at or above 1.25 x licensed MOP, and low-point
          pressure at or below 100% SMYS.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="hydro-disclaimer-heading">
        <h2 id="hydro-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid for hydrostatic test planning.
          It is not stamped design and it is not a full CSA Z662 review. Use
          project data, confirm units, and keep the engineer of record in the
          loop.
        </p>
      </aside>
    </>
  );
}
