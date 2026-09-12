import {
  calculateWallThickness,
  DEFAULT_WALL_INPUTS,
  formatDesignFactor,
  formatFixed,
} from "../lib/wall-thickness.ts";
import { convertWallValues } from "../lib/units.ts";

const metric = calculateWallThickness(DEFAULT_WALL_INPUTS);
const usInputs = convertWallValues(DEFAULT_WALL_INPUTS, "metric", "us");
const us = calculateWallThickness(usInputs, {
  unitSystem: "us",
  code: "asme_b314",
});
const class4 = calculateWallThickness(DEFAULT_WALL_INPUTS, {
  unitSystem: "metric",
  code: "asme_b318_c4",
});

function printBlock(
  title: string,
  result: ReturnType<typeof calculateWallThickness>,
  units: { thickness: string; pressure: string },
) {
  const rows = [
    ["Design factor F", formatDesignFactor(result.designFactor), String(result.designFactor)],
    [
      `t_min (${units.thickness})`,
      formatFixed(result.tMin, 3),
      String(result.tMin),
    ],
    [
      `MAOP (${units.pressure})`,
      formatFixed(result.maop, 1),
      String(result.maop),
    ],
    [
      "Thickness gate",
      result.isCompliant ? "COMPLIANT" : "UNDERSIZED",
      String(result.isCompliant),
    ],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(32)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock("Default metric ASME B31.4 outputs", metric, {
  thickness: "mm",
  pressure: "kPa",
});
printBlock("Converted US ASME B31.4 outputs", us, {
  thickness: "in",
  pressure: "PSI",
});
printBlock("Default metric ASME B31.8 Class 4 outputs", class4, {
  thickness: "mm",
  pressure: "kPa",
});

if (metric.designFactor !== 0.72 || metric.isCompliant !== true) {
  console.error("Default metric B31.4 outcomes do not match the encoded formulas.");
  process.exit(1);
}

if (class4.designFactor !== 0.4 || class4.isCompliant !== false) {
  console.error("Class 4 design factor or compliance gate does not match the encoded formulas.");
  process.exit(1);
}

if (!Number.isFinite(us.tMin) || !Number.isFinite(us.maop)) {
  console.error("US customary path did not produce finite results.");
  process.exit(1);
}

console.log("Default-input wall thickness verification passed.");
