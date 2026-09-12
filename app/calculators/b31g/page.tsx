import type { Metadata } from "next";
import Link from "next/link";
import { B31gCalculator } from "@/components/b31g-calculator";

export const metadata: Metadata = {
  title: "ASME B31G Corroded Pipe Remaining Strength",
  description:
    "ASME B31G and Modified B31G corroded-pipe remaining strength calculator for uncorroded MAOP, depth ratio, safe pressure, modified RSF, and an operating safety gate in metric and US Customary units.",
};

export default function B31gPage() {
  return (
    <>
      <header className="page-intro">
        <p className="crumb">
          <Link href="/">Home</Link> / B31G
        </p>
        <p className="hero-kicker">Live calculator</p>
        <h1>ASME B31G &amp; Modified B31G Remaining Strength</h1>
        <p>
          Estimate remaining strength for a blunt metal-loss defect using
          original B31G and Modified B31G. Defaults are a 508 mm, 9.5 mm WT,
          Grade 483 metric example at F=0.72, with a 2.5 mm deep, 150 mm long
          defect at 9930 kPa operating pressure. Switch to US Customary to
          convert those inputs. Results update as you edit.
        </p>
      </header>

      <B31gCalculator />

      <section className="context" aria-labelledby="method-heading">
        <h2 id="method-heading">What this tool calculates</h2>
        <p>
          Uncorroded MAOP is the Barlow hoop-stress pressure 2 x WT x SMYS x F
          / OD. Depth ratio is d/t. Original B31G uses a parabolic metal-loss
          area (about 2/3 dL) and a Folias factor based on A = 0.893 L /
          sqrt(OD x WT), with flow stress 1.1 x SMYS. If A is greater than 4,
          the long-defect form uses (1 - d/t).
        </p>
        <p>
          Modified B31G uses a 0.85dL rectangular area and an RSTRENG-style
          Folias factor based on z = L^2 / (OD x WT). Metric flow stress is
          (SMYS + 68.95) MPa. US flow stress is SMYS + 10,000 PSI. Both safe
          pressures are capped at uncorroded MAOP. Modified RSF is P&apos;_Mod
          divided by that MAOP.
        </p>
        <p>
          The operating safety gate uses Modified B31G. Depth ratio above 80%
          is REJECT (&gt;80% DEPTH). Otherwise the gate is SAFE AT OPERATING
          PRESSURE when current operating pressure is at or below P&apos;_Mod,
          or DERATING REQUIRED when it is above.
        </p>
        <p>
          Switching the unit toggle converts values already in the form: OD,
          wall, defect depth, and defect length by 25.4, SMYS by 145.038, and
          operating pressure by 0.145038. Design factor F is dimensionless and
          does not convert. Metric uses mm, kPa, and MPa. US Customary uses
          inches and PSI.
        </p>
      </section>

      <aside className="disclaimer" aria-labelledby="b31g-disclaimer-heading">
        <h2 id="b31g-disclaimer-heading">Disclaimer</h2>
        <p>
          This calculator is an engineering aid. Original B31G (parabolic /
          Folias A) and Modified B31G (0.85dL / RSTRENG-style Folias z) are
          encoded Level 1 checks only. It is not a stamped integrity
          assessment and it is not a full ASME B31G or company-procedure
          review. Confirm ILI or field defect measurements, units, and the
          B31G edition or company procedure that applies to your project
          before you use a result in the field.
        </p>
      </aside>
    </>
  );
}
