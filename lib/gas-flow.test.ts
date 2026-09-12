import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateGasFlow,
  DEFAULT_GAS_INPUTS,
  DEFAULT_GAS_UNIT_SYSTEM,
  formatFixed,
  formatRate,
  GAS_PB_KPA,
  GAS_PB_PSIA,
  GAS_TB_K,
  GAS_TB_R,
  GAS_TF_K,
  GAS_TF_R,
  GAS_Z,
  PANHANDLE_A_COEFF_METRIC,
  PANHANDLE_A_COEFF_US,
  PANHANDLE_B_COEFF_METRIC,
  PANHANDLE_B_COEFF_US,
  SM3D_PER_E3M3D,
  validateGasInputs,
  WEYMOUTH_COEFF_METRIC,
  WEYMOUTH_COEFF_US,
} from "./gas-flow.ts";
import {
  convertGasField,
  convertGasValues,
  formatInputNumber,
  KM_PER_MILE,
  MM_PER_IN,
  PSI_PER_KPA,
} from "./units.ts";

function expectedMetric(inputs = DEFAULT_GAS_INPUTS) {
  const id = inputs.od - 2 * inputs.wt;
  const dp2 = inputs.p1 * inputs.p1 - inputs.p2 * inputs.p2;
  const denom = inputs.gamma * GAS_TF_K * inputs.length * GAS_Z;
  const weymouthSm3d =
    WEYMOUTH_COEFF_METRIC *
    (GAS_TB_K / GAS_PB_KPA) *
    Math.sqrt((dp2 * Math.pow(id, 5.333)) / denom) *
    inputs.efficiency;
  const panhandleASm3d =
    PANHANDLE_A_COEFF_METRIC *
    Math.pow(GAS_TB_K / GAS_PB_KPA, 1.0788) *
    Math.pow(dp2 / (Math.pow(inputs.gamma, 0.8539) * GAS_TF_K * inputs.length * GAS_Z), 0.5394) *
    Math.pow(id, 2.6182) *
    inputs.efficiency;
  const panhandleBSm3d =
    PANHANDLE_B_COEFF_METRIC *
    Math.pow(GAS_TB_K / GAS_PB_KPA, 1.02) *
    Math.pow(dp2 / (Math.pow(inputs.gamma, 0.961) * GAS_TF_K * inputs.length * GAS_Z), 0.51) *
    Math.pow(id, 2.53) *
    inputs.efficiency;

  return {
    id,
    pressureDrop: inputs.p1 - inputs.p2,
    weymouth: weymouthSm3d / SM3D_PER_E3M3D,
    panhandleA: panhandleASm3d / SM3D_PER_E3M3D,
    panhandleB: panhandleBSm3d / SM3D_PER_E3M3D,
  };
}

function expectedUs(inputs: typeof DEFAULT_GAS_INPUTS) {
  const id = inputs.od - 2 * inputs.wt;
  const dp2 = inputs.p1 * inputs.p1 - inputs.p2 * inputs.p2;
  const denom = inputs.gamma * GAS_TF_R * inputs.length * GAS_Z;
  return {
    id,
    pressureDrop: inputs.p1 - inputs.p2,
    weymouth:
      WEYMOUTH_COEFF_US *
      (GAS_TB_R / GAS_PB_PSIA) *
      Math.sqrt((dp2 * Math.pow(id, 5.333)) / denom) *
      inputs.efficiency,
    panhandleA:
      PANHANDLE_A_COEFF_US *
      Math.pow(GAS_TB_R / GAS_PB_PSIA, 1.0788) *
      Math.pow(dp2 / (Math.pow(inputs.gamma, 0.8539) * GAS_TF_R * inputs.length * GAS_Z), 0.5394) *
      Math.pow(id, 2.6182) *
      inputs.efficiency,
    panhandleB:
      PANHANDLE_B_COEFF_US *
      Math.pow(GAS_TB_R / GAS_PB_PSIA, 1.02) *
      Math.pow(dp2 / (Math.pow(inputs.gamma, 0.961) * GAS_TF_R * inputs.length * GAS_Z), 0.51) *
      Math.pow(id, 2.53) *
      inputs.efficiency,
  };
}

function assertClose(actual: number, expected: number, tol = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) < tol,
    `expected ${expected}, got ${actual}`,
  );
}

test("default metric inputs match the encoded gas-flow formulas and sanity numbers", () => {
  const actual = calculateGasFlow(DEFAULT_GAS_INPUTS);
  const expected = expectedMetric();

  assert.equal(DEFAULT_GAS_INPUTS.p1, 7000);
  assert.equal(DEFAULT_GAS_INPUTS.p2, 5000);
  assert.equal(DEFAULT_GAS_INPUTS.gamma, 0.6);
  assert.equal(DEFAULT_GAS_INPUTS.od, 508);
  assert.equal(DEFAULT_GAS_INPUTS.wt, 9.5);
  assert.equal(DEFAULT_GAS_INPUTS.length, 50);
  assert.equal(DEFAULT_GAS_INPUTS.efficiency, 0.92);
  assert.equal(DEFAULT_GAS_UNIT_SYSTEM, "metric");

  assert.equal(actual.id, expected.id);
  assert.equal(actual.id, 489);
  assert.equal(actual.pressureDrop, 2000);
  assert.equal(actual.weymouth, expected.weymouth);
  assert.equal(actual.panhandleA, expected.panhandleA);
  assert.equal(actual.panhandleB, expected.panhandleB);

  assert.equal(formatFixed(actual.id, 1), "489.0");
  assert.equal(formatFixed(actual.pressureDrop, 0), "2,000");
  assert.ok(Math.abs(actual.weymouth - 8157) < 0.6);
  assert.ok(Math.abs(actual.panhandleA - 10638) < 0.6);
  assert.ok(Math.abs(actual.panhandleB - 10293) < 0.6);
  assert.equal(formatRate(actual.weymouth), "8,157");
  assert.equal(formatRate(actual.panhandleA), "10,638");
  assert.equal(formatRate(actual.panhandleB), "10,293");
});

test("US customary path uses inches, psia, miles, and MMSCFD", () => {
  const inputs = convertGasValues(DEFAULT_GAS_INPUTS, "metric", "us");
  const expected = expectedUs(inputs);
  const actual = calculateGasFlow(inputs, { unitSystem: "us" });

  assert.equal(inputs.p1, 7000 * 0.145038);
  assert.equal(inputs.p2, 5000 * 0.145038);
  assert.equal(inputs.od, 508 / 25.4);
  assert.equal(inputs.wt, 9.5 / 25.4);
  assert.equal(inputs.length, 50 / 1.60934);
  assert.equal(inputs.gamma, 0.6);
  assert.equal(inputs.efficiency, 0.92);

  assert.equal(actual.id, expected.id);
  assert.equal(actual.pressureDrop, expected.pressureDrop);
  assert.equal(actual.weymouth, expected.weymouth);
  assert.equal(actual.panhandleA, expected.panhandleA);
  assert.equal(actual.panhandleB, expected.panhandleB);
  assert.ok(Math.abs(actual.weymouth - 288) < 0.6);
  assert.ok(Math.abs(actual.panhandleA - 375) < 0.6);
  assert.ok(Math.abs(actual.panhandleB - 362) < 0.6);
});

test("unit conversion constants and field mapping match the approved prototype", () => {
  assert.equal(convertGasField("p1", 7000, "metric", "us"), 7000 * PSI_PER_KPA);
  assert.equal(convertGasField("p2", 5000, "metric", "us"), 5000 * PSI_PER_KPA);
  assert.equal(convertGasField("od", 508, "metric", "us"), 508 / MM_PER_IN);
  assert.equal(convertGasField("wt", 9.5, "metric", "us"), 9.5 / MM_PER_IN);
  assert.equal(convertGasField("length", 50, "metric", "us"), 50 / KM_PER_MILE);
  assert.equal(convertGasField("gamma", 0.6, "metric", "us"), 0.6);
  assert.equal(convertGasField("efficiency", 0.92, "metric", "us"), 0.92);

  assert.equal(formatInputNumber(508 / 25.4), "20");
  assert.equal(formatInputNumber((9.5 / 25.4) * 25.4), "9.5");

  const us = convertGasValues(DEFAULT_GAS_INPUTS, "metric", "us");
  const back = convertGasValues(us, "us", "metric");
  assertClose(back.p1, DEFAULT_GAS_INPUTS.p1);
  assertClose(back.p2, DEFAULT_GAS_INPUTS.p2);
  assertClose(back.od, DEFAULT_GAS_INPUTS.od);
  assertClose(back.wt, DEFAULT_GAS_INPUTS.wt);
  assertClose(back.length, DEFAULT_GAS_INPUTS.length);
  assert.equal(back.gamma, DEFAULT_GAS_INPUTS.gamma);
  assert.equal(back.efficiency, DEFAULT_GAS_INPUTS.efficiency);
});

test("shared constants stay aligned with the encoded formulas", () => {
  assert.equal(GAS_TB_K, 288.15);
  assert.equal(GAS_PB_KPA, 101.325);
  assert.equal(GAS_TF_K, 288.15);
  assert.equal(GAS_Z, 0.88);
  assert.equal(GAS_TB_R, 520);
  assert.equal(GAS_PB_PSIA, 14.73);
  assert.equal(GAS_TF_R, 520);
  assert.equal(WEYMOUTH_COEFF_METRIC, 3.7435e-3);
  assert.equal(PANHANDLE_A_COEFF_METRIC, 4.596e-3);
  assert.equal(PANHANDLE_B_COEFF_METRIC, 1.004e-2);
  assert.equal(WEYMOUTH_COEFF_US, 433.5e-6);
  assert.equal(PANHANDLE_A_COEFF_US, 435.87e-6);
  assert.equal(PANHANDLE_B_COEFF_US, 737.0e-6);
  assert.equal(SM3D_PER_E3M3D, 1000);
  assert.equal(KM_PER_MILE, 1.60934);
  assert.equal(PSI_PER_KPA, 0.145038);
});

test("guards return zero flow instead of NaN when length, gravity, ID, or P1^2-P2^2 is invalid", () => {
  const noLength = calculateGasFlow({ ...DEFAULT_GAS_INPUTS, length: 0 });
  assert.equal(noLength.weymouth, 0);
  assert.equal(noLength.panhandleA, 0);
  assert.equal(noLength.panhandleB, 0);
  assert.ok(Number.isFinite(noLength.weymouth));

  const noGamma = calculateGasFlow({ ...DEFAULT_GAS_INPUTS, gamma: 0 });
  assert.equal(noGamma.weymouth, 0);

  const noId = calculateGasFlow({ ...DEFAULT_GAS_INPUTS, od: 10, wt: 6 });
  assert.equal(noId.id, -2);
  assert.equal(noId.weymouth, 0);

  const noDrop = calculateGasFlow({ ...DEFAULT_GAS_INPUTS, p1: 5000, p2: 5000 });
  assert.equal(noDrop.pressureDrop, 0);
  assert.equal(noDrop.weymouth, 0);

  const reversed = calculateGasFlow({ ...DEFAULT_GAS_INPUTS, p1: 4000, p2: 5000 });
  assert.equal(reversed.weymouth, 0);
  assert.ok(Number.isFinite(reversed.panhandleA));
});

test("validation catches non-positive length, gravity, ID, and a non-positive pressure-squared term", () => {
  const length = validateGasInputs({ ...DEFAULT_GAS_INPUTS, length: 0 });
  const gamma = validateGasInputs({ ...DEFAULT_GAS_INPUTS, gamma: 0 });
  const id = validateGasInputs({ ...DEFAULT_GAS_INPUTS, od: 10, wt: 6 });
  const drop = validateGasInputs({ ...DEFAULT_GAS_INPUTS, p2: 7000 });

  assert.ok(length.some((error) => error.includes("Pipeline length")));
  assert.ok(gamma.some((error) => error.includes("Gas specific gravity")));
  assert.ok(id.some((error) => error.includes("Inside diameter must be greater than 0")));
  assert.ok(drop.some((error) => error.includes("pressure-squared term")));
});
