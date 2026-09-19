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
          This suite is complete for now. Live tools cover hydrostatic test
          fill volume and elevation pressure checks, design-factor wall
          thickness and MAOP sizing under CSA Z662 and ASME B31.4 / B31.8, a
          dedicated ASME B31.4 wall thickness and MAOP sizer, standalone
          pipe volume and displacement estimates, natural gas flow and
          pressure drop with Weymouth, Panhandle A, and Panhandle B, and
          ASME B31G / Modified B31G remaining strength for corroded pipe.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/calculators/hydrostatic-test">
            Open hydrostatic test calculator
          </Link>
          <Link className="btn btn-ghost" href="/calculators/wall-thickness">
            Open wall thickness calculator
          </Link>
          <Link className="btn btn-ghost" href="/calculators/b314-wall-maop">
            Open B31.4 wall &amp; MAOP calculator
          </Link>
          <Link className="btn btn-ghost" href="/calculators/pipe-volume">
            Open pipe volume calculator
          </Link>
          <Link className="btn btn-ghost" href="/calculators/gas-flow">
            Open gas flow calculator
          </Link>
          <Link className="btn btn-ghost" href="/calculators/b31g">
            Open B31G calculator
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
          less, and a multi-standard comparison grid. The B31.4 wall &amp;
          MAOP sizer uses the same pressure-design equation, locked to the
          fixed ASME B31.4 design factor, in two modes: required wall from
          design pressure, or MAOP from an entered wall. The volume calculator
          estimates line fill, fill mass, displacement time, and chemical
          dose from OD, wall, length, density, rate, and ppm. The gas flow
          calculator estimates Weymouth, Panhandle A, and Panhandle B rates
          from absolute inlet and outlet pressure. The B31G calculator
          estimates original and Modified B31G safe pressure for a measured
          metal-loss defect and gates operating pressure against Modified
          B31G. None of the tools cover hold time, test medium, fittings, or
          other code clauses. They are not a full code review and they are
          not stamped design.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="disclaimer-heading">
        <h2 id="disclaimer-heading">Disclaimer</h2>
        <p>
          These calculators are an engineering aid. They are not stamped design,
          a permit, or a substitute for a professional engineer of record.
          Volume, displacement, gas flow, and B31G remaining-strength
          results are estimates only. Confirm inputs, units, and the CSA
          Z662, ASME, or 49 CFR requirements that apply to your project
          before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
