import {
  calculateFieldBendingLimits,
  DEFAULT_FIELD_BENDING_INPUTS,
  formatFixed,
} from "../lib/field-bending-limits.ts";

const mortar = calculateFieldBendingLimits(DEFAULT_FIELD_BENDING_INPUTS);
const mortarFlex = calculateFieldBendingLimits({
  ...DEFAULT_FIELD_BENDING_INPUTS,
  coating_type: "Mortar-lined and flexible coated",
});
const flexible = calculateFieldBendingLimits({
  ...DEFAULT_FIELD_BENDING_INPUTS,
  coating_type: "Flexible lining and coated",
});

function printBlock(
  title: string,
  result: ReturnType<typeof calculateFieldBendingLimits>,
) {
  const rows = [
    ["strain_limit_pct (%)", formatFixed(result.strain_limit_pct, 0), String(result.strain_limit_pct)],
    ["max_deflection (in)", formatFixed(result.max_deflection, 3), String(result.max_deflection)],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(40)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock("Default mortar-lined and coated outputs", mortar);
printBlock("Mortar-lined and flexible coated outputs", mortarFlex);
printBlock("Flexible lining and coated outputs", flexible);

if (
  mortar.strain_limit_pct !== 2 ||
  mortar.max_deflection !== 0.4 ||
  mortarFlex.strain_limit_pct !== 3 ||
  mortarFlex.max_deflection !== 0.6 ||
  flexible.strain_limit_pct !== 5 ||
  flexible.max_deflection !== 1
) {
  console.error("Field bending outputs do not match the encoded Appendix A table.");
  process.exit(1);
}

console.log("Default-input field bending verification passed.");
