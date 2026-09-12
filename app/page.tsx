import Link from "next/link";
import { CalculatorCard } from "@/components/calculator-card";
import { CALCULATORS } from "@/lib/calculators";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="hero-kicker">Pipe-Up</p>
        <h1>Pipeline calculators for the field and the office</h1>
        <p className="lede">
          A small toolkit for pipeline work in Canada and the United States. The
          first live tool is a hydrostatic test calculator for fill volume and
          elevation pressure checks under CSA Z662 and ASME B31.4 / B31.8 (49
          CFR).
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/calculators/hydrostatic-test">
            Open hydrostatic test calculator
          </Link>
        </div>
      </section>

      <section aria-labelledby="calculator-list-heading">
        <h2 id="calculator-list-heading" className="section-title">
          Calculators
        </h2>
        <div className="calc-card-grid">
          {CALCULATORS.map((calculator) => (
            <CalculatorCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>
      </section>

      <section className="context" aria-labelledby="codes-heading">
        <h2 id="codes-heading">Codes and gates in plain language</h2>
        <p>
          CSA Z662 is the Canadian standard for oil and gas pipeline systems.
          ASME B31.4 and 49 CFR 195 cover US liquids. ASME B31.8 and 49 CFR 192
          cover US gas, with a high-point factor that changes by class location.
          Strength tests are commonly planned so the high point still meets a
          minimum factor on MOP or MAOP, while the low point stays at or below
          pipe yield. Water also adds head with elevation, so the same target
          pressure is not the pressure at every point on the section.
        </p>
        <p>
          This site applies only the two numeric gates encoded in the hydrostatic
          tool: high-point pressure at or above the selected-code factor times
          MOP / MAOP, and low-point pressure at or below 100% SMYS using the
          Barlow yield formula. It does not cover hold time, test medium,
          temperature, fittings, or other code clauses. It is not a full code
          review and it is not stamped design.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="disclaimer-heading">
        <h2 id="disclaimer-heading">Disclaimer</h2>
        <p>
          These calculators are an engineering aid. They are not stamped design,
          a permit, or a substitute for a professional engineer of record.
          Confirm inputs, units, and the CSA Z662, ASME, or 49 CFR requirements
          that apply to your project before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
