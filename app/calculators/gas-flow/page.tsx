import type { Metadata } from "next";
import Link from "next/link";
import { GasFlowCalculator } from "@/components/gas-flow-calculator";

export const metadata: Metadata = {
  title: "Natural Gas Flow & Pressure Drop Calculator",
  description:
    "Natural gas pipeline flow and pressure drop calculator using Weymouth, Panhandle A, and Panhandle B equations in metric and US Customary units.",
};

export default function GasFlowPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / Gas Flow
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>Natural Gas Flow &amp; Pressure Drop</h1>
        <p>
          Estimate steady-state gas flow from inlet and outlet pressure, gravity,
          pipe size, length, and line efficiency. Defaults are a 508 mm, 9.5 mm
          WT, 50 km metric example at 7000 / 5000 kPa abs, γg 0.60, and E 0.92.
          Switch to US Customary to convert those inputs. Results update as you
          edit.
        </p>
      </header>

      <GasFlowCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Inside diameter is OD minus two wall thicknesses. Pressure drop is P1
          minus P2. Flow uses the encoded Weymouth, Panhandle A, and Panhandle B
          equations with a fully turbulent, horizontal-line assumption. Metric
          rates are shown in 10³ m3/d. US rates are shown in MMSCFD.
        </p>
        <p>
          Phase 1 hardcodes flowing temperature, compressibility, and base
          conditions. Metric uses Tf = 288.15 K, Z = 0.88, Tb = 288.15 K, and
          Pb = 101.325 kPa. US Customary uses Tf = 520 R, Z = 0.88, Tb = 520 R,
          and Pb = 14.73 psia. Those values are not editable on this page.
        </p>
        <p>
          Switching the unit toggle converts values already in the form:
          pressure by 0.145038, diameter and wall by 25.4, and length by
          1.60934 (km to miles). Gas specific gravity and line efficiency are
          dimensionless and do not convert.
        </p>
        <p>
          Weymouth is a better fit for shorter, higher-friction gathering.
          Panhandle A is commonly used on medium-to-large transmission.
          Panhandle B is intended for large, smooth, high-pressure lines. If
          length, gravity, or inside diameter is not greater than 0, or if
          P1² minus P2² is not greater than 0, results pause instead of showing
          NaN.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="gas-disclaimer-heading">
        <h2 id="gas-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. Weymouth, Panhandle A, and
          Panhandle B results are estimates only. They are not stamped design
          and they are not a full CSA Z662 or ASME B31.8 review. Confirm
          pressures as absolute, units, gas gravity, efficiency, and the code
          that applies to your project before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
