import type { Metadata } from "next";
import Link from "next/link";
import { HydrostaticCalculator } from "@/components/hydrostatic-calculator";

export const metadata: Metadata = {
  title: "Hydrostatic Test Calculator",
  description:
    "Cross-border hydrostatic test calculator for fill volume, bleach dose, Barlow yield pressure, and high/low elevation pressure gates under CSA Z662 and ASME B31.4 / B31.8 (49 CFR).",
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
          test section. Defaults are a 508 mm, 6.6 mm WT, Grade 483 metric
          example. Switch to US Customary to convert those inputs. Results
          update as you edit.
        </p>
      </header>

      <HydrostaticCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Inside diameter is OD minus two wall thicknesses. In metric, fill
          volume is internal area times section length in cubic metres, and
          bleach is 1 litre per cubic metre. In US Customary, fill volume is
          internal area in square feet times length, converted to barrels at
          5.61458 cubic feet per barrel. Bleach gallons follow the prototype
          conversion from that barrel volume.
        </p>
        <p>
          Yield pressure is Barlow: 2 x SMYS x WT / OD. Metric SMYS is entered
          in MPa and converted to kPa. US SMYS is already in PSI. High and low
          pressures apply 9.81 kPa per metre, or 0.433 PSI per foot, between
          the test point and each elevation. The only gates shown are
          high-point pressure at or above the selected-code factor times MOP /
          MAOP, and low-point pressure at or below 100% SMYS.
        </p>
        <p>
          Code factors encoded here: CSA Z662 and ASME B31.4 / 49 CFR 195 use
          1.25. ASME B31.8 / 49 CFR 192 uses 1.10 for Class 1, 1.25 for Class
          2, 1.40 for Class 3, and 1.50 for Class 4. These are the numeric
          gates in this tool, not a full code review.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="hydro-disclaimer-heading">
        <h2 id="hydro-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid for hydrostatic test planning.
          It is not stamped design and it is not a full CSA Z662, ASME B31.4,
          ASME B31.8, or 49 CFR review. Use project data, confirm units, and
          keep the engineer of record in the loop.
        </p>
      </aside>
    </>
  );
}
