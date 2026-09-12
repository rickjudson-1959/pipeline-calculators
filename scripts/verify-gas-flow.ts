import {
  calculateGasFlow,
  DEFAULT_GAS_INPUTS,
  formatFixed,
  formatRate,
} from "../lib/gas-flow.ts";
import { convertGasValues } from "../lib/units.ts";

const metric = calculateGasFlow(DEFAULT_GAS_INPUTS);
const usInputs = convertGasValues(DEFAULT_GAS_INPUTS, "metric", "us");
const us = calculateGasFlow(usInputs, { unitSystem: "us" });

function printBlock(
  title: string,
  result: ReturnType<typeof calculateGasFlow>,
  units: {
    id: string;
    pressure: string;
    flow: string;
  },
) {
  const rows = [
    [`ID (${units.id})`, formatFixed(result.id, 3), String(result.id)],
    [
      `Pressure drop (${units.pressure})`,
      formatFixed(result.pressureDrop, 1),
      String(result.pressureDrop),
    ],
    [`Weymouth (${units.flow})`, formatRate(result.weymouth), String(result.weymouth)],
    [
      `Panhandle A (${units.flow})`,
      formatRate(result.panhandleA),
      String(result.panhandleA),
    ],
    [
      `Panhandle B (${units.flow})`,
      formatRate(result.panhandleB),
      String(result.panhandleB),
    ],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(40)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock("Default metric gas-flow outputs", metric, {
  id: "mm",
  pressure: "kPa abs",
  flow: "10^3 m3/d",
});
printBlock("Converted US gas-flow outputs", us, {
  id: "in",
  pressure: "psia",
  flow: "MMSCFD",
});

if (
  metric.id !== 489 ||
  metric.pressureDrop !== 2000 ||
  Math.abs(metric.weymouth - 8157) >= 0.6 ||
  Math.abs(metric.panhandleA - 10638) >= 0.6 ||
  Math.abs(metric.panhandleB - 10293) >= 0.6
) {
  console.error("Default metric gas-flow outputs do not match the encoded sanity numbers.");
  process.exit(1);
}

if (
  !Number.isFinite(us.weymouth) ||
  !Number.isFinite(us.panhandleA) ||
  !Number.isFinite(us.panhandleB) ||
  Math.abs(us.weymouth - 288) >= 0.6 ||
  Math.abs(us.panhandleA - 375) >= 0.6 ||
  Math.abs(us.panhandleB - 362) >= 0.6
) {
  console.error("US customary path did not produce the encoded sanity numbers.");
  process.exit(1);
}

console.log("Default-input natural gas flow verification passed.");
