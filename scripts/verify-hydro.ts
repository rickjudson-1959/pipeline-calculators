import {
  calculateHydrostatic,
  DEFAULT_HYDRO_INPUTS,
  formatFactor,
  formatFixed,
} from "../lib/hydrostatic.ts";
import { convertHydroValues } from "../lib/units.ts";

const metric = calculateHydrostatic(DEFAULT_HYDRO_INPUTS);
const usInputs = convertHydroValues(DEFAULT_HYDRO_INPUTS, "metric", "us");
const us = calculateHydrostatic(usInputs, {
  unitSystem: "us",
  code: "asme_b314",
});
const class4 = calculateHydrostatic(DEFAULT_HYDRO_INPUTS, {
  unitSystem: "metric",
  code: "asme_b318_c4",
});

function printBlock(
  title: string,
  result: ReturnType<typeof calculateHydrostatic>,
  units: { id: string; volume: string; bleach: string; pressure: string },
) {
  const rows = [
    [`ID (${units.id})`, formatFixed(result.id, 3), String(result.id)],
    [`Fill (${units.volume})`, formatFixed(result.fillVolume, 3), String(result.fillVolume)],
    [`Bleach (${units.bleach})`, formatFixed(result.bleach, 2), String(result.bleach)],
    [`100% SMYS (${units.pressure})`, formatFixed(result.pYield, 1), String(result.pYield)],
    [`High-point P (${units.pressure})`, formatFixed(result.pHigh, 1), String(result.pHigh)],
    [`Low-point P (${units.pressure})`, formatFixed(result.pLow, 1), String(result.pLow)],
    [
      `${formatFactor(result.minFactor)} x MOP / MAOP (${units.pressure})`,
      formatFixed(result.minPHigh, 1),
      String(result.minPHigh),
    ],
    ["High gate", result.isHighOk ? "MEETS" : "DOES NOT MEET", String(result.isHighOk)],
    ["Low gate", result.isLowOk ? "MEETS" : "DOES NOT MEET", String(result.isLowOk)],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(32)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock("Default metric CSA Z662 outputs", metric, {
  id: "mm",
  volume: "m3",
  bleach: "L",
  pressure: "kPa",
});
printBlock("Converted US ASME B31.4 outputs", us, {
  id: "in",
  volume: "bbls",
  bleach: "gal",
  pressure: "PSI",
});
printBlock("Default metric ASME B31.8 Class 4 outputs", class4, {
  id: "mm",
  volume: "m3",
  bleach: "L",
  pressure: "kPa",
});

if (metric.isHighOk !== false || metric.isLowOk !== true) {
  console.error("Default metric CSA gate outcomes do not match the encoded formulas.");
  process.exit(1);
}

if (class4.minFactor !== 1.5) {
  console.error("Class 4 high-point factor is not 1.50.");
  process.exit(1);
}

if (!Number.isFinite(us.fillVolume) || !Number.isFinite(us.bleach) || !Number.isFinite(us.pYield)) {
  console.error("US customary path did not produce finite results.");
  process.exit(1);
}

console.log("Default-input and cross-border verification passed.");
