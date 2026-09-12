import type { Metadata } from "next";
import Link from "next/link";
import { WallThicknessCalculator } from "@/components/wall-thickness-calculator";

export const metadata: Metadata = {
  title: "Pipeline Wall Thickness Calculator",
  description:
    "Pipeline wall thickness and MAOP calculator using encoded ASME B31.4, ASME B31.8, and CSA Z662 design factors. Metric SI and US Customary units.",
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
          metric example under ASME B31.4 (F=0.72). Switch to US Customary to
          convert those inputs. Results update as you edit.
        </p>
      </header>

      <WallThicknessCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Allowable hoop stress is F times SMYS. Minimum wall is the Barlow
          pressure design thickness plus the corrosion allowance. MAOP is the
          Barlow design-pressure capacity of the selected nominal wall after
          subtracting corrosion. The only gate shown is COMPLIANT when that
          MAOP is at or above design pressure, otherwise UNDERSIZED.
        </p>
        <p>
          Metric uses mm, kPa, and MPa, with SMYS converted from MPa to kPa.
          US Customary uses inches and PSI, including SMYS in PSI. Switching
          the unit toggle converts values already in the form: length and
          thickness by 25.4, SMYS by 145.038, and pressure by 0.145038.
        </p>
        <p>
          Design factors encoded here: ASME B31.4 liquid and ASME B31.8 Class 1
          Div 2 use 0.72. ASME B31.8 Class 1 Div 1 and CSA Z662 Class 1 use
          0.80. ASME B31.8 Class 2 uses 0.60, Class 3 uses 0.50, and Class 4
          uses 0.40. Joint factor E, temperature derating T, and a D/t grid
          are not applied. These are the numeric checks in this tool, not a
          full code review.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="wall-disclaimer-heading">
        <h2 id="wall-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It applies only the encoded
          design-factor wall and MAOP checks. It is not stamped design and it
          is not a full CSA Z662, ASME B31.4, or ASME B31.8 review. Use
          project data, confirm units, and keep the engineer of record in the
          loop.
        </p>
      </aside>
    </>
  );
}
