import type { Metadata } from "next";
import Link from "next/link";
import { SideboomSpanLiftCalculator } from "@/components/sideboom-span-lift-calculator";
import { SIDEBOOM_REFERENCE } from "@/lib/sideboom-span-lift";

export const metadata: Metadata = {
  title: "Sideboom Spanning and Lift Load Calculator",
  description:
    "Free sideboom spanning and lift load calculator for hollow-section moment of inertia, maximum safe span between sidebooms, and required lift capacity per machine using ASME B31 / Pipeline Infrastructure Eq 14-4.",
};

export default function SideboomSpanLiftPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / Sideboom Span
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>Sideboom Spanning and Lift Load</h1>
        <p>
          Estimate the maximum safe distance between sidebooms and the lift
          capacity each machine needs so bending stays at or below the
          allowable stress. Defaults are a 20 in OD, 0.375 in WT, 10 lb/in
          net unit weight example at 70,000 psi allowable bending stress.
          Results update as you edit.
        </p>
      </header>

      <SideboomSpanLiftCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Citation: {SIDEBOOM_REFERENCE}. The page only displays results from
          the isolated math module. It does not re-derive the equations.
        </p>
        <p>
          Hollow-section moment of inertia I uses outside diameter D and wall
          thickness t. Maximum safe span L_s is the distance that keeps
          spanning stress at the allowable bending stress. Required lift
          capacity is net unit weight times that span. The spanning-stress
          note sigma_bs is shown so you can confirm it returns to S_allow
          when the cited span equation is used.
        </p>
        <p>
          Inputs are US Customary only: inches, lb/in, psi, and pounds.
          Results pause when D is not greater than 0, wall is not between 0
          and D/2, or weight or allowable stress is not greater than 0.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="sideboom-disclaimer-heading">
        <h2 id="sideboom-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It is not stamped PE advice
          and it is not a full ASME B31 or company lift-plan review. Results
          depend on correct inputs and the applicable code edition. Confirm
          pipe size, coating and contents weight, allowable stress, and the
          lift procedure that applies to your project before you use a
          result in the field.
        </p>
      </aside>
    </>
  );
}
