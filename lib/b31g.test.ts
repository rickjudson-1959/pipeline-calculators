import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateB31g,
  DEFAULT_B31G_INPUTS,
  DEFAULT_B31G_UNIT_SYSTEM,
  DEPTH_RATIO_REJECT,
  evaluateOperatingGate,
  formatOperatingGate,
  formatPercent,
  formatPressure,
  isPassingGate,
  METRIC_FLOW_ADD_MPA,
  MOD_AREA_FACTOR,
  MOD_FOLIAS_Z_LIMIT,
  ORIG_AREA_FACTOR,
  ORIG_FLOW_STRESS_FACTOR,
  ORIG_FOLIAS_A_LIMIT,
  US_FLOW_ADD_PSI,
  validateB31gInputs,
} from "./b31g.ts";
import {
  convertB31gField,
  convertB31gValues,
  formatInputNumber,
  MM_PER_IN,
  PSI_PER_KPA,
  PSI_PER_MPA,
} from "./units.ts";

function expectedMetric(inputs = DEFAULT_B31G_INPUTS) {
  const dt = inputs.depth / inputs.wt;
  const a = (0.893 * inputs.length) / Math.sqrt(inputs.od * inputs.wt);
  const z = (inputs.length * inputs.length) / (inputs.od * inputs.wt);
  const mOrig =
    a <= 4
      ? Math.sqrt(1 + 0.6275 * a * a - 0.003375 * a ** 4)
      : 0.032 * a * a + 3.29;
  const mMod =
    z <= 50
      ? Math.sqrt(1 + 0.6275 * z - 0.003375 * z * z)
      : 0.032 * z + 3.29;
  const maop = (2 * inputs.wt * (inputs.smys * 1000) * inputs.f) / inputs.od;
  const pOrigRaw =
    ((2 * inputs.wt * (1.1 * inputs.smys * 1000) * inputs.f) / inputs.od) *
    (a <= 4 ? (1 - 0.6667 * dt) / (1 - (0.6667 * dt) / mOrig) : 1 - dt);
  const pB31g = Math.min(maop, pOrigRaw);
  const sFlowM = (inputs.smys + 68.95) * 1000;
  const pModRaw =
    ((2 * inputs.wt * sFlowM * inputs.f) / inputs.od) *
    ((1 - 0.85 * dt) / (1 - (0.85 * dt) / mMod));
  const pMod = Math.min(maop, pModRaw);
  return {
    dt,
    a,
    z,
    mOrig,
    mMod,
    maop,
    pB31g,
    pMod,
    rsfMod: (pMod / maop) * 100,
    gate: evaluateOperatingGate(dt, inputs.poper, pMod),
  };
}

function expectedUs(inputs: typeof DEFAULT_B31G_INPUTS) {
  const dt = inputs.depth / inputs.wt;
  const a = (0.893 * inputs.length) / Math.sqrt(inputs.od * inputs.wt);
  const z = (inputs.length * inputs.length) / (inputs.od * inputs.wt);
  const mOrig =
    a <= 4
      ? Math.sqrt(1 + 0.6275 * a * a - 0.003375 * a ** 4)
      : 0.032 * a * a + 3.29;
  const mMod =
    z <= 50
      ? Math.sqrt(1 + 0.6275 * z - 0.003375 * z * z)
      : 0.032 * z + 3.29;
  const maop = (2 * inputs.wt * inputs.smys * inputs.f) / inputs.od;
  const pOrigRaw =
    ((2 * inputs.wt * (1.1 * inputs.smys) * inputs.f) / inputs.od) *
    (a <= 4 ? (1 - 0.6667 * dt) / (1 - (0.6667 * dt) / mOrig) : 1 - dt);
  const pB31g = Math.min(maop, pOrigRaw);
  const sFlowU = inputs.smys + 10000;
  const pModRaw =
    ((2 * inputs.wt * sFlowU * inputs.f) / inputs.od) *
    ((1 - 0.85 * dt) / (1 - (0.85 * dt) / mMod));
  const pMod = Math.min(maop, pModRaw);
  return {
    dt,
    maop,
    pB31g,
    pMod,
    rsfMod: (pMod / maop) * 100,
    gate: evaluateOperatingGate(dt, inputs.poper, pMod),
  };
}

function assertClose(actual: number, expected: number, tol = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) < tol,
    `expected ${expected}, got ${actual}`,
  );
}

test("default metric inputs match the encoded B31G formulas and display numbers", () => {
  const actual = calculateB31g(DEFAULT_B31G_INPUTS);
  const expected = expectedMetric();

  assert.equal(DEFAULT_B31G_INPUTS.od, 508);
  assert.equal(DEFAULT_B31G_INPUTS.wt, 9.5);
  assert.equal(DEFAULT_B31G_INPUTS.smys, 483);
  assert.equal(DEFAULT_B31G_INPUTS.f, 0.72);
  assert.equal(DEFAULT_B31G_INPUTS.depth, 2.5);
  assert.equal(DEFAULT_B31G_INPUTS.length, 150);
  assert.equal(DEFAULT_B31G_INPUTS.poper, 9930);
  assert.equal(DEFAULT_B31G_UNIT_SYSTEM, "metric");

  assert.equal(actual.dt, expected.dt);
  assert.equal(actual.a, expected.a);
  assert.equal(actual.z, expected.z);
  assert.equal(actual.mOrig, expected.mOrig);
  assert.equal(actual.mMod, expected.mMod);
  assert.equal(actual.maop, expected.maop);
  assert.equal(actual.pB31g, expected.pB31g);
  assert.equal(actual.pMod, expected.pMod);
  assert.equal(actual.rsfMod, expected.rsfMod);
  assert.equal(actual.gate, "safe");
  assert.equal(formatOperatingGate(actual.gate), "SAFE AT OPERATING PRESSURE");
  assert.equal(isPassingGate(actual.gate), true);

  assert.ok(Math.abs(actual.dt * 100 - 26.3) < 0.05);
  assert.ok(Math.abs(actual.maop - 13007) < 1);
  assert.ok(Math.abs(actual.pB31g - 13007) < 1);
  assert.ok(Math.abs(actual.pMod - 13007) < 1);
  assert.ok(Math.abs(actual.rsfMod - 100) < 0.05);
  assert.equal(formatPercent(actual.dt * 100), "26.3");
  assert.equal(formatPressure(actual.maop), "13,007");
  assert.equal(formatPressure(actual.pB31g), "13,007");
  assert.equal(formatPressure(actual.pMod), "13,007");
  assert.equal(formatPercent(actual.rsfMod), "100.0");
});

test("US customary path uses inches and PSI with the same geometry formulas", () => {
  const inputs = convertB31gValues(DEFAULT_B31G_INPUTS, "metric", "us");
  const expected = expectedUs(inputs);
  const actual = calculateB31g(inputs, { unitSystem: "us" });

  assert.equal(inputs.od, 508 / 25.4);
  assert.equal(inputs.wt, 9.5 / 25.4);
  assert.equal(inputs.depth, 2.5 / 25.4);
  assert.equal(inputs.length, 150 / 25.4);
  assert.equal(inputs.smys, 483 * 145.038);
  assert.equal(inputs.poper, 9930 * 0.145038);
  assert.equal(inputs.f, 0.72);

  assertClose(actual.dt, expected.dt);
  assert.equal(actual.maop, expected.maop);
  assert.equal(actual.pB31g, expected.pB31g);
  assert.equal(actual.pMod, expected.pMod);
  assert.equal(actual.rsfMod, expected.rsfMod);
  assert.equal(actual.gate, "safe");
  assert.ok(Number.isFinite(actual.maop));
  assert.ok(Number.isFinite(actual.pB31g));
  assert.ok(Number.isFinite(actual.pMod));
});

test("unit conversion constants and field mapping leave F unchanged", () => {
  assert.equal(convertB31gField("od", 508, "metric", "us"), 508 / MM_PER_IN);
  assert.equal(convertB31gField("wt", 9.5, "metric", "us"), 9.5 / MM_PER_IN);
  assert.equal(convertB31gField("depth", 2.5, "metric", "us"), 2.5 / MM_PER_IN);
  assert.equal(convertB31gField("length", 150, "metric", "us"), 150 / MM_PER_IN);
  assert.equal(convertB31gField("smys", 483, "metric", "us"), 483 * PSI_PER_MPA);
  assert.equal(
    convertB31gField("poper", 9930, "metric", "us"),
    9930 * PSI_PER_KPA,
  );
  assert.equal(convertB31gField("f", 0.72, "metric", "us"), 0.72);

  assert.equal(formatInputNumber(508 / 25.4), "20");
  assert.equal(formatInputNumber((2.5 / 25.4) * 25.4), "2.5");

  const us = convertB31gValues(DEFAULT_B31G_INPUTS, "metric", "us");
  assert.equal(us.f, 0.72);
  const back = convertB31gValues(us, "us", "metric");
  assertClose(back.od, DEFAULT_B31G_INPUTS.od);
  assertClose(back.wt, DEFAULT_B31G_INPUTS.wt);
  assertClose(back.depth, DEFAULT_B31G_INPUTS.depth);
  assertClose(back.length, DEFAULT_B31G_INPUTS.length);
  assertClose(back.smys, DEFAULT_B31G_INPUTS.smys);
  assertClose(back.poper, DEFAULT_B31G_INPUTS.poper);
  assert.equal(back.f, 0.72);
});

test("shared constants stay aligned with the encoded formulas", () => {
  assert.equal(DEPTH_RATIO_REJECT, 0.8);
  assert.equal(ORIG_FOLIAS_A_LIMIT, 4);
  assert.equal(MOD_FOLIAS_Z_LIMIT, 50);
  assert.equal(ORIG_AREA_FACTOR, 0.6667);
  assert.equal(MOD_AREA_FACTOR, 0.85);
  assert.equal(ORIG_FLOW_STRESS_FACTOR, 1.1);
  assert.equal(METRIC_FLOW_ADD_MPA, 68.95);
  assert.equal(US_FLOW_ADD_PSI, 10000);
  assert.equal(MM_PER_IN, 25.4);
  assert.equal(PSI_PER_MPA, 145.038);
  assert.equal(PSI_PER_KPA, 0.145038);
});

test("operating gate rejects depth above 80 percent, then compares operating pressure to Modified B31G", () => {
  const deep = calculateB31g({
    ...DEFAULT_B31G_INPUTS,
    depth: 7.7,
  });
  assert.ok(deep.dt > 0.8);
  assert.equal(deep.gate, "reject-depth");
  assert.equal(formatOperatingGate(deep.gate), "REJECT (>80% DEPTH)");
  assert.equal(isPassingGate(deep.gate), false);

  const derate = calculateB31g({
    ...DEFAULT_B31G_INPUTS,
    poper: 20000,
  });
  assert.equal(derate.gate, "derating");
  assert.equal(formatOperatingGate(derate.gate), "DERATING REQUIRED");
  assert.equal(isPassingGate(derate.gate), false);

  const safe = calculateB31g(DEFAULT_B31G_INPUTS);
  assert.equal(safe.gate, "safe");
  assert.ok(DEFAULT_B31G_INPUTS.poper <= safe.pMod);
});

test("long original defects (A > 4) use (1 - d/t) and long modified defects (z > 50) use 0.032z + 3.29", () => {
  const longOrig = calculateB31g({
    ...DEFAULT_B31G_INPUTS,
    length: 400,
  });
  assert.ok(longOrig.a > 4);
  const dt = 2.5 / 9.5;
  const expectedOrig =
    ((2 * 9.5 * (1.1 * 483 * 1000) * 0.72) / 508) * (1 - dt);
  assertClose(longOrig.pB31g, Math.min(longOrig.maop, expectedOrig));

  const longMod = calculateB31g({
    ...DEFAULT_B31G_INPUTS,
    length: 1600,
  });
  assert.ok(longMod.z > 50);
  const expectedM = 0.032 * longMod.z + 3.29;
  assertClose(longMod.mMod, expectedM);
  assert.ok(Number.isFinite(longMod.pMod));
});

test("validation catches non-positive geometry and Folias denominators that would blow up", () => {
  const od = validateB31gInputs({ ...DEFAULT_B31G_INPUTS, od: 0 });
  const wt = validateB31gInputs({ ...DEFAULT_B31G_INPUTS, wt: 0 });
  const depth = validateB31gInputs({ ...DEFAULT_B31G_INPUTS, depth: -1 });
  const length = validateB31gInputs({ ...DEFAULT_B31G_INPUTS, length: -1 });
  const through = validateB31gInputs({ ...DEFAULT_B31G_INPUTS, depth: 9.5 });

  assert.ok(od.some((error) => error.includes("Outside diameter")));
  assert.ok(wt.some((error) => error.includes("Nominal wall thickness")));
  assert.ok(depth.some((error) => error.includes("Defect depth")));
  assert.ok(length.some((error) => error.includes("Defect axial length")));
  assert.ok(through.some((error) => error.includes("less than nominal wall")));

  const ready = validateB31gInputs(DEFAULT_B31G_INPUTS);
  assert.deepEqual(ready, []);
});
