import {
  calculateWallThickness,
  compareWallStandards,
  DEFAULT_WALL_INPUTS,
  formatCompliance,
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
const grid = compareWallStandards(DEFAULT_WALL_INPUTS);

function printBlock(
  title: string,
  result: ReturnType<typeof calculateWallThickness>,
  units: { thickness: string; pressure: string; stress: string },
) {
  const rows = [
    ["Design factor F", formatDesignFactor(result.designFactor), String(result.designFactor)],
    [
      `S = F x SMYS (${units.stress})`,
      formatFixed(result.allowableStress, 2),
      String(result.allowableStress),
    ],
    [
      `t_p (${units.thickness})`,
      formatFixed(result.pressureThickness, 2),
      String(result.pressureThickness),
    ],
    [
      `t_min (${units.thickness})`,
      formatFixed(result.tMin, 2),
      String(result.tMin),
    ],
    [
      `MAOP (${units.pressure})`,
      formatFixed(result.maop, 0),
      String(result.maop),
    ],
    [
      "Thickness gate",
      formatCompliance(result.isCompliant),
      String(result.isCompliant),
    ],
    [
      "D/t_nom",
      formatFixed(result.dtNom, 1),
      `${result.dtNom} ok=${result.dtNomOk}`,
    ],
    [
      "D/t_min",
      formatFixed(result.dtMin, 1),
      `${result.dtMin} ok=${result.dtMinOk}`,
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
  stress: "MPa",
});
printBlock("Converted US ASME B31.4 outputs", us, {
  thickness: "in",
  pressure: "PSI",
  stress: "PSI",
});
printBlock("Default metric ASME B31.8 Class 4 outputs", class4, {
  thickness: "mm",
  pressure: "kPa",
  stress: "MPa",
});

console.log("Multi-standard comparison grid (same OD, SMYS, P, A, t_nom, E, T)");
console.log("-----------------------------------------------------------------");
for (const row of grid) {
  console.log(
    `${row.label.padEnd(28)} F=${formatDesignFactor(row.designFactor)}  t_min=${formatFixed(row.tMin, 2)} mm  MAOP=${formatFixed(row.maop, 0)} kPa  ${formatCompliance(row.isCompliant)}`,
  );
}
console.log("");

if (
  metric.designFactor !== 0.72 ||
  metric.isCompliant !== true ||
  Math.abs(metric.allowableStress - 347.76) >= 1e-10 ||
  Math.abs(metric.tMin - 8.85) >= 0.01 ||
  Math.abs(metric.maop - 10816) >= 1
) {
  console.error("Default metric B31.4 outcomes do not match the Version 2 sanity case.");
  process.exit(1);
}

if (
  class4.designFactor !== 0.4 ||
  class4.isCompliant !== false ||
  Math.abs(class4.allowableStress - 193.2) >= 1e-10 ||
  Math.abs(class4.tMin - 14.66) >= 0.01 ||
  Math.abs(class4.maop - 6009) >= 1
) {
  console.error("Class 4 design factor or sanity numbers do not match Version 2.");
  process.exit(1);
}

if (grid.length !== 7 || !Number.isFinite(us.tMin) || !Number.isFinite(us.maop)) {
  console.error("Comparison grid or US customary path did not produce complete results.");
  process.exit(1);
}

console.log("Default-input wall thickness verification passed.");
