import {
  calculateHydrostatic,
  DEFAULT_HYDRO_INPUTS,
  formatFixed,
} from "../lib/hydrostatic.ts";

const result = calculateHydrostatic(DEFAULT_HYDRO_INPUTS);

const rows = [
  ["ID (mm)", formatFixed(result.id, 1), String(result.id)],
  ["CUBES (m3)", formatFixed(result.cubes, 3), String(result.cubes)],
  ["Barrels", formatFixed(result.bbls, 2), String(result.bbls)],
  ["Bleach (L)", formatFixed(result.bleach, 2), String(result.bleach)],
  ["100% SMYS (kPa)", formatFixed(result.pYield, 1), String(result.pYield)],
  ["High-point P (kPa)", formatFixed(result.pHigh, 1), String(result.pHigh)],
  ["Low-point P (kPa)", formatFixed(result.pLow, 1), String(result.pLow)],
  ["1.25 x MOP (kPa)", formatFixed(result.minPHigh, 1), String(result.minPHigh)],
  ["High gate", result.isHighOk ? "MEETS" : "DOES NOT MEET", String(result.isHighOk)],
  ["Low gate", result.isLowOk ? "MEETS" : "DOES NOT MEET", String(result.isLowOk)],
];

console.log("Default hydrostatic outputs");
console.log("---------------------------");
for (const [label, display, raw] of rows) {
  console.log(`${label.padEnd(20)} ${display.padStart(16)}   raw=${raw}`);
}

if (result.isHighOk !== false || result.isLowOk !== true) {
  console.error("Default gate outcomes do not match the encoded formulas.");
  process.exit(1);
}

console.log("\nDefault-input verification passed.");
