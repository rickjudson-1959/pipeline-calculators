import {
  calculateB31g,
  DEFAULT_B31G_INPUTS,
  formatOperatingGate,
  formatPercent,
  formatPressure,
} from "../lib/b31g.ts";
import { convertB31gValues } from "../lib/units.ts";

const metric = calculateB31g(DEFAULT_B31G_INPUTS);
const usInputs = convertB31gValues(DEFAULT_B31G_INPUTS, "metric", "us");
const us = calculateB31g(usInputs, { unitSystem: "us" });

function printBlock(
  title: string,
  result: ReturnType<typeof calculateB31g>,
  units: { pressure: string },
) {
  const rows = [
    [`Uncorroded MAOP (${units.pressure})`, formatPressure(result.maop), String(result.maop)],
    ["Depth ratio d/t (%)", formatPercent(result.dt * 100), String(result.dt)],
    [`P'_B31G (${units.pressure})`, formatPressure(result.pB31g), String(result.pB31g)],
    [`P'_Mod (${units.pressure})`, formatPressure(result.pMod), String(result.pMod)],
    ["Modified RSF (%)", formatPercent(result.rsfMod), String(result.rsfMod)],
    ["Operating safety gate", formatOperatingGate(result.gate), result.gate],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(36)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock("Default metric B31G outputs", metric, { pressure: "kPa" });
printBlock("Converted US B31G outputs", us, { pressure: "PSI" });

if (
  metric.gate !== "safe" ||
  Math.abs(metric.dt * 100 - 26.3) >= 0.05 ||
  Math.abs(metric.maop - 13007) >= 1 ||
  Math.abs(metric.pB31g - 13007) >= 1 ||
  Math.abs(metric.pMod - 13007) >= 1 ||
  Math.abs(metric.rsfMod - 100) >= 0.05
) {
  console.error("Default metric B31G outputs do not match the encoded sanity numbers.");
  process.exit(1);
}

if (
  us.gate !== "safe" ||
  !Number.isFinite(us.maop) ||
  !Number.isFinite(us.pB31g) ||
  !Number.isFinite(us.pMod) ||
  !Number.isFinite(us.rsfMod)
) {
  console.error("US customary path did not produce complete finite results.");
  process.exit(1);
}

console.log("Default-input ASME B31G verification passed.");
