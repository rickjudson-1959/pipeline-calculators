import type { Metadata } from "next";
import Link from "next/link";
import { FieldBendingLimitsCalculator } from "@/components/field-bending-limits-calculator";
import { FIELD_BENDING_REFERENCE } from "@/lib/field-bending-limits";

export const metadata: Metadata = {
  title: "Field Bending Strain and Limits Calculator",
  description:
    "Free field bending strain and deflection-limit calculator for mortar-lined and flexible pipeline coatings using Pipeline Infrastructure Appendix A acceptance criteria.",
};

export default function FieldBendingLimitsPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / Field Bending
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>Field Bending Strain and Limits</h1>
        <p>
          Set a coating-based bending strain limit and the matching maximum
          deflection so field bends stay inside the Appendix A acceptance
          table. Defaults are a 20 in OD pipe with mortar-lined and coated
          protection. Results update as you edit.
        </p>
      </header>

      <FieldBendingLimitsCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Citation: {FIELD_BENDING_REFERENCE}. The page only displays results
          from the isolated math module. It does not re-derive the strain
          table or the deflection equation.
        </p>
        <p>
          Coating design selects the allowable strain limit. Maximum
          deflection is that strain, as a fraction, times outside diameter.
          The three encoded coating designs are mortar-lined and coated,
          mortar-lined and flexible coated, and flexible lining and coated.
        </p>
        <p>
          Inputs are US Customary only. Results pause when D is not greater
          than 0 or the coating design is not one of the three Appendix A
          options.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="field-bend-disclaimer-heading">
        <h2 id="field-bend-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It is not stamped PE advice
          and it is not a full coating or field-bend procedure review.
          Results depend on correct inputs and the applicable code edition.
          Confirm pipe diameter, coating system, and the acceptance criteria
          that apply to your project before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
