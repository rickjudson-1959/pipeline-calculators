import type { Metadata } from "next";
import Link from "next/link";
import { PipeVolumeCalculator } from "@/components/pipe-volume-calculator";

export const metadata: Metadata = {
  title: "Pipeline Volume & Displacement Calculator",
  description:
    "Pipeline volume and displacement calculator for inside diameter, line fill volume, volume per distance, fluid fill mass, fill time, and chemical inhibitor dosage in metric and US Customary units.",
};

export default function PipeVolumePage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / Pipe Volume
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>Pipeline Volume &amp; Displacement</h1>
        <p>
          Size line fill volume, fill mass, displacement time, and chemical
          inhibitor dose for a pipe section. Defaults are a 508 mm, 9.5 mm WT,
          5000 m water-filled metric example at 250 m3/hr and 500 ppm. Switch
          to US Customary to convert those inputs. Results update as you edit.
        </p>
      </header>

      <PipeVolumeCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Inside diameter is OD minus two wall thicknesses. In metric, line
          fill volume is internal area times section length in cubic metres.
          Volume per kilometre is that fill volume divided by length in
          kilometres. Fill mass is volume times density, shown in tonnes. Fill
          time is volume divided by pumping rate. Chemical dosage is volume
          times dosing ppm / 1000, shown in litres.
        </p>
        <p>
          In US Customary, fill volume is internal area in square feet times
          length, converted to barrels at 5.61458 cubic feet per barrel.
          Volume per mile uses that barrel volume. Fill weight is cubic-foot
          volume times density in pounds. Fill time uses barrels per hour.
          Chemical gallons convert the same litre dose at 0.264172 gallons per
          litre.
        </p>
        <p>
          Switching the unit toggle converts values already in the form:
          diameter and wall by 25.4, length by 3.28084, density by 0.062428,
          and pumping rate by 6.28981. Dosing stays in ppm. Water, methanol,
          and glycol presets fill density from specific gravity. They are
          convenience values only, not a fluid-property table.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="volume-disclaimer-heading">
        <h2 id="volume-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. It estimates line-fill volume
          and displacement only. It is not stamped design. Confirm pipe ID,
          fluid density, pumping rate, and the chemical program that applies
          to your project before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
