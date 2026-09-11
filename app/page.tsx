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
          A small toolkit for Canadian pipeline work. The first live tool is a
          hydrostatic test calculator for fill volume and elevation pressure
          checks in a CSA Z662 context.
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

      <section className="context" aria-labelledby="z662-heading">
        <h2 id="z662-heading">CSA Z662 in plain language</h2>
        <p>
          CSA Z662 is the Canadian standard for oil and gas pipeline systems.
          Strength tests are commonly planned so the high point still meets a
          minimum factor on licensed MOP, while the low point stays at or below
          pipe yield. Water also adds head with elevation, so the same target
          pressure is not the pressure at every point on the section.
        </p>
        <p>
          This site applies only the two numeric gates encoded in the hydrostatic
          tool: high-point pressure at or above 1.25 times licensed MOP, and
          low-point pressure at or below 100% SMYS using the Barlow yield
          formula. It does not cover hold time, test medium, temperature,
          fittings, or other code clauses.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="disclaimer-heading">
        <h2 id="disclaimer-heading">Disclaimer</h2>
        <p>
          These calculators are an engineering aid. They are not stamped design,
          a permit, or a substitute for a professional engineer of record.
          Confirm inputs, units, and the CSA Z662 requirements that apply to
          your project before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
