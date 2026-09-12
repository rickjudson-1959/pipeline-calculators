import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BBL_PER_M3,
  calculatePipeVolume,
  CUFT_PER_BBL,
  DEFAULT_FLUID_PRESET,
  DEFAULT_VOLUME_INPUTS,
  DEFAULT_VOLUME_UNIT_SYSTEM,
  densityFromPreset,
  FLUID_SPECIFIC_GRAVITY,
  formatFixed,
  FT_PER_MILE,
  GAL_PER_L,
  KG_PER_TONNE,
  LB_PER_CUFT_PER_KG_M3 as VOLUME_LB_PER_CUFT_PER_KG_M3,
  L_PER_M3,
  M_PER_KM,
  validateVolumeInputs,
  WATER_DENSITY_METRIC,
} from "./pipe-volume.ts";
import {
  BBL_PER_M3_RATE,
  convertVolumeField,
  convertVolumeValues,
  formatInputNumber,
  FT_PER_M,
  LB_PER_CUFT_PER_KG_M3,
  MM_PER_IN,
} from "./units.ts";

function expectedMetric(inputs = DEFAULT_VOLUME_INPUTS) {
  const id = inputs.od - 2 * inputs.wt;
  const area = (Math.PI * Math.pow(id / 1000.0, 2)) / 4.0;
  const volM3 = area * inputs.length;
  return {
    id,
    area,
    fillVolume: volM3,
    volumePerDistance: inputs.length > 0 ? volM3 / (inputs.length / M_PER_KM) : 0,
    fillMass: (volM3 * inputs.density) / KG_PER_TONNE,
    fillTimeHours: inputs.rate > 0 ? volM3 / inputs.rate : 0,
    chemicalDose: volM3 * (inputs.dosing / 1000),
  };
}

function expectedUs(inputs: typeof DEFAULT_VOLUME_INPUTS) {
  const id = inputs.od - 2 * inputs.wt;
  const area = (Math.PI * Math.pow(id / 12.0, 2)) / 4.0;
  const volCuFt = area * inputs.length;
  const volBbls = volCuFt / CUFT_PER_BBL;
  const volM3 = volBbls / BBL_PER_M3;
  return {
    id,
    area,
    fillVolume: volBbls,
    volumePerDistance: inputs.length > 0 ? volBbls / (inputs.length / FT_PER_MILE) : 0,
    fillMass: volCuFt * inputs.density,
    fillTimeHours: inputs.rate > 0 ? volBbls / inputs.rate : 0,
    chemicalDose: volM3 * L_PER_M3 * (inputs.dosing / 1000) * GAL_PER_L,
  };
}

function assertClose(actual: number, expected: number, tol = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) < tol,
    `expected ${expected}, got ${actual}`,
  );
}

test("default metric inputs match the encoded volume formulas and sanity numbers", () => {
  const actual = calculatePipeVolume(DEFAULT_VOLUME_INPUTS);
  const expected = expectedMetric();

  assert.equal(DEFAULT_VOLUME_INPUTS.od, 508);
  assert.equal(DEFAULT_VOLUME_INPUTS.wt, 9.5);
  assert.equal(DEFAULT_VOLUME_INPUTS.length, 5000);
  assert.equal(DEFAULT_VOLUME_INPUTS.density, 1000);
  assert.equal(DEFAULT_VOLUME_INPUTS.rate, 250);
  assert.equal(DEFAULT_VOLUME_INPUTS.dosing, 500);
  assert.equal(DEFAULT_VOLUME_UNIT_SYSTEM, "metric");
  assert.equal(DEFAULT_FLUID_PRESET, "water");

  assert.equal(actual.id, expected.id);
  assert.equal(actual.id, 489);
  assert.equal(actual.area, expected.area);
  assert.equal(actual.fillVolume, expected.fillVolume);
  assert.equal(actual.volumePerDistance, expected.volumePerDistance);
  assert.equal(actual.fillMass, expected.fillMass);
  assert.equal(actual.fillTimeHours, expected.fillTimeHours);
  assert.equal(actual.chemicalDose, expected.chemicalDose);

  assert.equal(formatFixed(actual.id, 1), "489.0");
  assert.ok(Math.abs(actual.fillVolume - 939.0) < 0.05);
  assert.ok(Math.abs(actual.volumePerDistance - 187.8) < 0.05);
  assert.ok(Math.abs(actual.fillMass - 939.0) < 0.05);
  assert.ok(Math.abs(actual.fillTimeHours - 3.76) < 0.01);
  assert.ok(Math.abs(actual.chemicalDose - 469.5) < 0.05);
  assert.equal(formatFixed(actual.fillVolume, 1), "939.0");
  assert.equal(formatFixed(actual.volumePerDistance, 1), "187.8");
  assert.equal(formatFixed(actual.fillMass, 1), "939.0");
  assert.equal(formatFixed(actual.fillTimeHours, 2), "3.76");
  assert.equal(formatFixed(actual.chemicalDose, 1), "469.5");
});

test("US customary path uses inches, feet, barrels, lb/ft3, bbl/hr, and gallons", () => {
  const inputs = convertVolumeValues(DEFAULT_VOLUME_INPUTS, "metric", "us");
  const expected = expectedUs(inputs);
  const actual = calculatePipeVolume(inputs, { unitSystem: "us" });

  assert.equal(inputs.od, 508 / 25.4);
  assert.equal(inputs.wt, 9.5 / 25.4);
  assert.equal(inputs.length, 5000 * 3.28084);
  assert.equal(inputs.density, 1000 * 0.062428);
  assert.equal(inputs.rate, 250 * 6.28981);
  assert.equal(inputs.dosing, 500);

  assert.equal(actual.id, expected.id);
  assert.equal(actual.area, expected.area);
  assert.equal(actual.fillVolume, expected.fillVolume);
  assert.equal(actual.volumePerDistance, expected.volumePerDistance);
  assert.equal(actual.fillMass, expected.fillMass);
  assert.equal(actual.fillTimeHours, expected.fillTimeHours);
  assert.equal(actual.chemicalDose, expected.chemicalDose);
});

test("unit conversion constants and field mapping match the approved prototype", () => {
  assert.equal(convertVolumeField("od", 508, "metric", "us"), 508 / MM_PER_IN);
  assert.equal(convertVolumeField("wt", 9.5, "metric", "us"), 9.5 / MM_PER_IN);
  assert.equal(convertVolumeField("length", 5000, "metric", "us"), 5000 * FT_PER_M);
  assert.equal(
    convertVolumeField("density", 1000, "metric", "us"),
    1000 * LB_PER_CUFT_PER_KG_M3,
  );
  assert.equal(
    convertVolumeField("rate", 250, "metric", "us"),
    250 * BBL_PER_M3_RATE,
  );
  assert.equal(convertVolumeField("dosing", 500, "metric", "us"), 500);

  assert.equal(formatInputNumber(508 / 25.4), "20");
  assert.equal(formatInputNumber((9.5 / 25.4) * 25.4), "9.5");

  const us = convertVolumeValues(DEFAULT_VOLUME_INPUTS, "metric", "us");
  const back = convertVolumeValues(us, "us", "metric");
  assertClose(back.od, DEFAULT_VOLUME_INPUTS.od);
  assertClose(back.wt, DEFAULT_VOLUME_INPUTS.wt);
  assertClose(back.length, DEFAULT_VOLUME_INPUTS.length);
  assertClose(back.density, DEFAULT_VOLUME_INPUTS.density);
  assertClose(back.rate, DEFAULT_VOLUME_INPUTS.rate);
  assert.equal(back.dosing, DEFAULT_VOLUME_INPUTS.dosing);
});

test("shared constants stay aligned with the encoded formulas", () => {
  assert.equal(BBL_PER_M3, 6.28981);
  assert.equal(BBL_PER_M3_RATE, 6.28981);
  assert.equal(CUFT_PER_BBL, 5.61458);
  assert.equal(GAL_PER_L, 0.264172);
  assert.equal(L_PER_M3, 1000);
  assert.equal(KG_PER_TONNE, 1000);
  assert.equal(M_PER_KM, 1000);
  assert.equal(FT_PER_MILE, 5280);
  assert.equal(LB_PER_CUFT_PER_KG_M3, 0.062428);
  assert.equal(VOLUME_LB_PER_CUFT_PER_KG_M3, 0.062428);
  assert.equal(WATER_DENSITY_METRIC, 1000);
  assert.equal(FLUID_SPECIFIC_GRAVITY.water, 1);
  assert.equal(FLUID_SPECIFIC_GRAVITY.methanol, 0.79);
  assert.equal(FLUID_SPECIFIC_GRAVITY.glycol, 1.11);
});

test("zero pumping rate yields zero fill time and zero length yields zero gradient", () => {
  const noRate = calculatePipeVolume({
    ...DEFAULT_VOLUME_INPUTS,
    rate: 0,
  });
  assert.equal(noRate.fillTimeHours, 0);
  assert.ok(noRate.fillVolume > 0);

  const noLength = calculatePipeVolume({
    ...DEFAULT_VOLUME_INPUTS,
    length: 0,
  });
  assert.equal(noLength.fillVolume, 0);
  assert.equal(noLength.volumePerDistance, 0);
  assert.equal(noLength.fillTimeHours, 0);
  assert.equal(noLength.chemicalDose, 0);
});

test("fluid presets fill water, methanol, and glycol densities", () => {
  assert.equal(densityFromPreset("water", "metric"), 1000);
  assert.equal(densityFromPreset("methanol", "metric"), 790);
  assert.equal(densityFromPreset("glycol", "metric"), 1110);
  assert.equal(densityFromPreset("water", "us"), 1000 * 0.062428);
  assert.equal(densityFromPreset("methanol", "us"), 790 * 0.062428);
  assert.equal(densityFromPreset("glycol", "us"), 1110 * 0.062428);

  const methanol = calculatePipeVolume({
    ...DEFAULT_VOLUME_INPUTS,
    density: densityFromPreset("methanol", "metric"),
  });
  const water = calculatePipeVolume(DEFAULT_VOLUME_INPUTS);
  assertClose(methanol.fillMass, water.fillMass * 0.79);
});

test("validation catches a non-positive inside diameter", () => {
  const errors = validateVolumeInputs({
    ...DEFAULT_VOLUME_INPUTS,
    od: 10,
    wt: 6,
  });
  assert.ok(
    errors.some((error) => error.includes("Inside diameter must be greater than 0")),
  );
});

test("validation rejects non-positive density and negative rate or dosing", () => {
  const density = validateVolumeInputs({ ...DEFAULT_VOLUME_INPUTS, density: 0 });
  const rate = validateVolumeInputs({ ...DEFAULT_VOLUME_INPUTS, rate: -1 });
  const dosing = validateVolumeInputs({ ...DEFAULT_VOLUME_INPUTS, dosing: -1 });
  assert.ok(density.some((error) => error.includes("Fluid density")));
  assert.ok(rate.some((error) => error.includes("Pumping rate")));
  assert.ok(dosing.some((error) => error.includes("Chemical inhibitor dosing")));
});
