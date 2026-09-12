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
          A small toolkit for pipeline work in Canada and the United States.
          Live tools cover hydrostatic test fill volume and elevation pressure
          checks, plus design-factor wall thickness and MAOP sizing under CSA
          Z662 and ASME B31.4 / B31.8.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/calculators/hydrostatic-test">
            Open hydrostatic test calculator
          </Link>
          <Link className="btn btn-ghost" href="/calculators/wall-thickness">
            Open wall thickness calculator
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
          cover US gas, with both a hydrostatic high-point factor and a wall
          design factor that change by class location. Strength tests are
          commonly planned so the high point still meets a minimum factor on
          MOP or MAOP, while the low point stays at or below pipe yield. Wall
          sizing uses the same Barlow hoop-stress idea with a location-class
          design factor F.
        </p>
        <p>
          This site applies only the numeric checks encoded in the live tools.
          The hydrostatic calculator uses high-point pressure at or above the
          selected-code factor times MOP / MAOP, and low-point pressure at or
          below 100% SMYS. The wall thickness calculator uses the
          pressure-design equation with F, E, and T, D/t slenderness of 140 or
          less, and a multi-standard comparison grid. Neither tool covers hold
          time, test medium, fittings, or other code clauses. They are not a
          full code review and they are not stamped design.
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
