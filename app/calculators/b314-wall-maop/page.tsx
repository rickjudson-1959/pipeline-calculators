import type { Metadata } from "next";
import Link from "next/link";
import { B314WallMaopCalculator } from "@/components/b314-wall-maop-calculator";

export const metadata: Metadata = {
  title: "ASME B31.4 Wall Thickness & MAOP Sizer",
  description:
    "Dedicated ASME B31.4 liquid pipeline calculator for pressure design minimum wall thickness and MAOP. Solve for required wall from a target design pressure, or for MAOP from an already selected wall thickness.",
};

export default function B314WallMaopPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / ASME B31.4 Wall &amp; MAOP
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>ASME B31.4 Wall Thickness &amp; MAOP Sizer</h1>
        <p>
          A dedicated sizer for ASME B31.4 liquid pipelines. Choose a mode,
          enter pipe and design data, and get the pressure design result for
          that mode. Design factor F is fixed at 0.72 for B31.4 liquid
          service. Switch to US Customary to convert the inputs already in
          the form.
        </p>
      </header>

      <B314WallMaopCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Allowable hoop stress is S = F times SMYS, with F fixed at 0.72 for
          ASME B31.4 liquid pipelines. Pressure design thickness is
          t_p = (P x D) / (2 x S x E x T). Minimum required wall is
          t_min = t_p plus the corrosion allowance. MAOP is
          2 x (t_nom minus A) x S x E x T / D.
        </p>
        <p>
          In Required wall mode, enter the design pressure and the tool
          solves for t_min. The nominal wall field is optional in this mode
          and is used only to check slenderness and compliance if entered.
          In MAOP mode, enter the selected nominal wall thickness and the
          tool solves for MAOP. The design pressure field is optional in
          this mode and, if entered, is used only to show a compliance check
          against that target.
        </p>
        <p>
          Slenderness checks are D/t_nom and D/t_min. Either ratio above 140
          fails that check.
        </p>
        <p>
          Metric uses mm, kPa, and MPa, with SMYS converted from MPa to kPa
          inside the hoop stress term. US Customary uses inches and PSI,
          including SMYS in PSI. Switching the unit toggle converts values
          already in the form, length and thickness by 25.4, SMYS by
          145.038, and pressure by 0.145038. E and T are dimensionless and
          do not convert.
        </p>
        <p>
          This page uses the same pressure design math as the suite wide
          Wall Thickness calculator, locked to the ASME B31.4 design factor.
          It does not apply location class factors, since ASME B31.4 does
          not use location classes. Default E is 1.00 for Seamless or ERW.
          Default T is 1.00 at or below 121 degrees C or 250 degrees F. This
          tool does not apply a full temperature derating table or a mill
          tolerance adjustment.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="b314-disclaimer-heading">
        <h2 id="b314-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It applies only the encoded
          ASME B31.4 pressure design wall, MAOP, E, T, and D/t checks. It is
          not stamped design and it is not a full ASME B31.4 code review.
          Use project data, confirm units, and keep the engineer of record
          in the loop.
        </p>
      </aside>
    </>
  );
}
