import {
  calculatePipeVolume,
  DEFAULT_VOLUME_INPUTS,
  formatFixed,
} from "../lib/pipe-volume.ts";
import { convertVolumeValues } from "../lib/units.ts";

const metric = calculatePipeVolume(DEFAULT_VOLUME_INPUTS);
const usInputs = convertVolumeValues(DEFAULT_VOLUME_INPUTS, "metric", "us");
const us = calculatePipeVolume(usInputs, { unitSystem: "us" });

function printBlock(
  title: string,
  result: ReturnType<typeof calculatePipeVolume>,
  units: {
    id: string;
    volume: string;
    gradient: string;
    mass: string;
    time: string;
    chemical: string;
  },
) {
  const rows = [
    [`ID (${units.id})`, formatFixed(result.id, 3), String(result.id)],
    [`Line fill (${units.volume})`, formatFixed(result.fillVolume, 1), String(result.fillVolume)],
    [
      `Volume per distance (${units.gradient})`,
      formatFixed(result.volumePerDistance, 1),
      String(result.volumePerDistance),
    ],
    [`Fill mass (${units.mass})`, formatFixed(result.fillMass, 1), String(result.fillMass)],
    [
      `Fill / displacement time (${units.time})`,
      formatFixed(result.fillTimeHours, 2),
      String(result.fillTimeHours),
    ],
    [
      `Chemical dosage (${units.chemical})`,
      formatFixed(result.chemicalDose, 1),
      String(result.chemicalDose),
    ],
  ];

  console.log(title);
  console.log("-".repeat(title.length));
  for (const [label, display, raw] of rows) {
    console.log(`${label.padEnd(40)} ${display.padStart(16)}   raw=${raw}`);
  }
  console.log("");
}

printBlock("Default metric volume outputs", metric, {
  id: "mm",
  volume: "m3",
  gradient: "m3/km",
  mass: "t",
  time: "h",
  chemical: "L",
});
printBlock("Converted US volume outputs", us, {
  id: "in",
  volume: "bbls",
  gradient: "bbl/mi",
  mass: "lb",
  time: "h",
  chemical: "gal",
});

if (
  metric.id !== 489 ||
  Math.abs(metric.fillVolume - 939.0) >= 0.05 ||
  Math.abs(metric.volumePerDistance - 187.8) >= 0.05 ||
  Math.abs(metric.fillMass - 939.0) >= 0.05 ||
  Math.abs(metric.fillTimeHours - 3.76) >= 0.01 ||
  Math.abs(metric.chemicalDose - 469.5) >= 0.05
) {
  console.error("Default metric volume outputs do not match the encoded sanity numbers.");
  process.exit(1);
}

if (
  !Number.isFinite(us.fillVolume) ||
  !Number.isFinite(us.volumePerDistance) ||
  !Number.isFinite(us.fillMass) ||
  !Number.isFinite(us.fillTimeHours) ||
  !Number.isFinite(us.chemicalDose)
) {
  console.error("US customary path did not produce finite results.");
  process.exit(1);
}

console.log("Default-input pipe volume verification passed.");
