import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateSideboomSpanLift,
  DEFAULT_SIDEBOOM_INPUTS,
  formatFixed,
  momentOfInertia,
  SIDEBOOM_REFERENCE,
  SPAN_STRESS_FACTOR,
  spanningStress,
  validateSideboomInputs,
} from "./sideboom-span-lift.ts";

function expectedFromCitedFormulas(inputs = DEFAULT_SIDEBOOM_INPUTS) {
  const I = (Math.PI / 64) * (Math.pow(inputs.D, 4) - Math.pow(inputs.D - 2 * inputs.t, 4));
  const L_s = Math.sqrt((20 * inputs.S_allow * I) / (inputs.w * inputs.D));
  const Lift_Load = inputs.w * L_s;
  const sigma_bs = (inputs.w * Math.pow(L_s, 2) * inputs.D) / (20 * I);
  return { I, L_s, Lift_Load, sigma_bs };
}

test("cited reference and span factor stay locked to Eq 14-4", () => {
  assert.equal(SIDEBOOM_REFERENCE, "ASME B31 / Pipeline Infrastructure Eq 14-4");
  assert.equal(SPAN_STRESS_FACTOR, 20);
});

test("default NPS 20 inputs match the cited I, L_s, and Lift_Load formulas", () => {
  assert.equal(DEFAULT_SIDEBOOM_INPUTS.D, 20);
  assert.equal(DEFAULT_SIDEBOOM_INPUTS.t, 0.375);
  assert.equal(DEFAULT_SIDEBOOM_INPUTS.w, 10);
  assert.equal(DEFAULT_SIDEBOOM_INPUTS.S_allow, 70000);

  const actual = calculateSideboomSpanLift(DEFAULT_SIDEBOOM_INPUTS);
  const expected = expectedFromCitedFormulas();

  assert.equal(actual.I, expected.I);
  assert.equal(actual.L_s, expected.L_s);
  assert.equal(actual.Lift_Load, expected.Lift_Load);
  assert.equal(actual.sigma_bs, expected.sigma_bs);
  assert.equal(actual.I, momentOfInertia(20, 0.375));
  assert.equal(actual.Lift_Load, DEFAULT_SIDEBOOM_INPUTS.w * actual.L_s);
  assert.ok(Math.abs(actual.sigma_bs - DEFAULT_SIDEBOOM_INPUTS.S_allow) < 1e-9);
});

test("independent fixture: 12 in OD, 0.500 in WT, 4 lb/in, 36000 psi", () => {
  const inputs = { D: 12, t: 0.5, w: 4, S_allow: 36000 };
  const I = (Math.PI / 64) * (Math.pow(12, 4) - Math.pow(11, 4));
  const L_s = Math.sqrt((20 * 36000 * I) / (4 * 12));
  const actual = calculateSideboomSpanLift(inputs);

  assert.equal(actual.I, I);
  assert.equal(actual.L_s, L_s);
  assert.equal(actual.Lift_Load, 4 * L_s);
  assert.equal(actual.sigma_bs, spanningStress(4, L_s, 12, I));
  assert.ok(Math.abs(actual.sigma_bs - 36000) < 1e-9);
  assert.equal(formatFixed(actual.I, 3), formatFixed(I, 3));
});

test("hollow-section inertia uses D^4 minus (D - 2t)^4", () => {
  const solid = momentOfInertia(10, 5);
  const thin = momentOfInertia(10, 0.25);
  assert.ok(Math.abs(solid - (Math.PI / 64) * Math.pow(10, 4)) < 1e-12);
  assert.ok(thin < solid);
  assert.ok(thin > 0);
});

test("validation requires D>0, 0<t<D/2, w>0, and S_allow>0", () => {
  const valid = validateSideboomInputs(DEFAULT_SIDEBOOM_INPUTS);
  assert.deepEqual(valid, []);

  const badD = validateSideboomInputs({ ...DEFAULT_SIDEBOOM_INPUTS, D: 0 });
  const badTZero = validateSideboomInputs({ ...DEFAULT_SIDEBOOM_INPUTS, t: 0 });
  const badTHalf = validateSideboomInputs({ ...DEFAULT_SIDEBOOM_INPUTS, D: 10, t: 5 });
  const badTOver = validateSideboomInputs({ ...DEFAULT_SIDEBOOM_INPUTS, D: 10, t: 6 });
  const badW = validateSideboomInputs({ ...DEFAULT_SIDEBOOM_INPUTS, w: 0 });
  const badS = validateSideboomInputs({ ...DEFAULT_SIDEBOOM_INPUTS, S_allow: -1 });

  assert.ok(badD.some((error) => error.includes("outside diameter")));
  assert.ok(badTZero.some((error) => error.includes("Wall thickness must be a number greater than 0")));
  assert.ok(badTHalf.some((error) => error.includes("less than half the outside diameter")));
  assert.ok(badTOver.some((error) => error.includes("less than half the outside diameter")));
  assert.ok(badW.some((error) => error.includes("Net unit weight")));
  assert.ok(badS.some((error) => error.includes("Allowable bending stress")));
});
