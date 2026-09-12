import type { Metadata } from "next";
import Link from "next/link";
import { WallThicknessCalculator } from "@/components/wall-thickness-calculator";

export const metadata: Metadata = {
  title: "Pipeline Wall Thickness Calculator",
  description:
    "Pipeline wall thickness and MAOP calculator using the pressure-design equation with F, E, and T, plus D/t slenderness and a multi-standard comparison grid for ASME B31.4, ASME B31.8, and CSA Z662.",
};

export default function WallThicknessPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / Wall Thickness
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>Pipeline Wall Thickness Sizing</h1>
        <p>
          Size minimum required wall and check the selected nominal thickness
          against design pressure. Defaults are a 508 mm, Grade 483, 9.5 mm WT
          metric example under ASME B31.4 (F=0.72) with E=1.00 and T=1.00.
          Switch to US Customary to convert those inputs. Results update as you
          edit.
        </p>
      </header>

      <WallThicknessCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Allowable hoop stress is S = F times SMYS. Pressure design thickness
          is t_p = (P x D) / (2 x S x E x T). Minimum wall is t_min = t_p plus
          the corrosion allowance. MAOP is 2 x (t_nom - A) x S x E x T / D.
          The thickness gate is COMPLIANT when t_nom is at or above t_min and
          MAOP is at or above design pressure. Otherwise it is UNDERSIZED.
        </p>
        <p>
          Slenderness checks are D/t_nom and D/t_min. Either ratio above 140
          fails that check. The comparison grid repeats the same OD, SMYS,
          design pressure, corrosion allowance, nominal wall, E, and T across
          every encoded location class. The primary code selector still drives
          the main results panel.
        </p>
        <p>
          Metric uses mm, kPa, and MPa, with SMYS converted from MPa to kPa
          inside the hoop-stress term. US Customary uses inches and PSI,
          including SMYS in PSI. Switching the unit toggle converts values
          already in the form: length and thickness by 25.4, SMYS by 145.038,
          and pressure by 0.145038. E and T are dimensionless and do not
          convert.
        </p>
        <p>
          Design factors encoded here: ASME B31.4 liquid and ASME B31.8 Class 1
          Div 2 use 0.72. ASME B31.8 Class 1 Div 1 and CSA Z662 Class 1 use
          0.80. ASME B31.8 Class 2 uses 0.60, Class 3 uses 0.50, and Class 4
          uses 0.40. Default E is 1.00 for Seamless / ERW. Default T is 1.00
          at or below 121 °C / 250 °F. The grid is encoded design-factor
          checks only. These are the numeric checks in this tool, not a full
          code review.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="wall-disclaimer-heading">
        <h2 id="wall-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It applies only the encoded
          design-factor wall, MAOP, E, T, and D/t checks, plus the
          multi-standard comparison grid. It is not stamped design and it is
          not a full CSA Z662, ASME B31.4, or ASME B31.8 review. Use project
          data, confirm units, and keep the engineer of record in the loop.
        </p>
      </aside>
    </>
  );
}
