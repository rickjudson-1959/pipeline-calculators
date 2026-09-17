import {
  calculateSideboomSpanLift,
  DEFAULT_SIDEBOOM_INPUTS,
  formatFixed,
} from "../lib/sideboom-span-lift.ts";

const result = calculateSideboomSpanLift(DEFAULT_SIDEBOOM_INPUTS);

function printBlock() {
  const title = "Default sideboom span and lift outputs";
  const rows = [
    ["I (in^4)", formatFixed(result.I, 2), String(result.I)],
    ["L_s (in)", formatFixed(result.L_s, 1), String(result.L_s)],
    ["Lift_Load (lbs)", formatFixed(result.Lift_Load, 0), String(result.Lift_Load)],
    ["sigma_bs (psi)", formatFixed(result.sigma_bs, 0), String(result.sigma_bs)],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(40)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock();

if (
  !Number.isFinite(result.I) ||
  !Number.isFinite(result.L_s) ||
  !Number.isFinite(result.Lift_Load) ||
  !Number.isFinite(result.sigma_bs) ||
  Math.abs(result.sigma_bs - DEFAULT_SIDEBOOM_INPUTS.S_allow) >= 1e-6
) {
  console.error("Default sideboom outputs did not match the encoded sanity checks.");
  process.exit(1);
}

console.log("Default-input sideboom span and lift verification passed.");
