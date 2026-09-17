import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateFieldBendingLimits,
  COATING_DESIGNS,
  COATING_STRAIN_LIMIT_PCT,
  DEFAULT_FIELD_BENDING_INPUTS,
  FIELD_BENDING_REFERENCE,
  formatFixed,
  isCoatingDesign,
  maxDeflection,
  strainLimitPct,
  validateFieldBendingInputs,
} from "./field-bending-limits.ts";

test("coating table is the Appendix A set of 2%, 3%, and 5%", () => {
  assert.deepEqual(COATING_DESIGNS, [
    "Mortar-lined and coated",
    "Mortar-lined and flexible coated",
    "Flexible lining and coated",
  ]);
  assert.equal(COATING_STRAIN_LIMIT_PCT["Mortar-lined and coated"], 2);
  assert.equal(COATING_STRAIN_LIMIT_PCT["Mortar-lined and flexible coated"], 3);
  assert.equal(COATING_STRAIN_LIMIT_PCT["Flexible lining and coated"], 5);
  assert.equal(
    FIELD_BENDING_REFERENCE,
    "Pipeline Infrastructure: Appendix A Acceptance Criteria",
  );
});

test("default NPS 20 mortar-lined and coated path is 2% and 0.40 in", () => {
  assert.equal(DEFAULT_FIELD_BENDING_INPUTS.D, 20);
  assert.equal(DEFAULT_FIELD_BENDING_INPUTS.coating_type, "Mortar-lined and coated");

  const actual = calculateFieldBendingLimits(DEFAULT_FIELD_BENDING_INPUTS);
  assert.equal(actual.strain_limit_pct, 2);
  assert.equal(actual.max_deflection, (2 / 100) * 20);
  assert.equal(actual.max_deflection, 0.4);
  assert.equal(formatFixed(actual.max_deflection, 2), "0.40");
});

test("each coating design maps to its cited strain limit and D-scaled deflection", () => {
  const cases = [
    { coating_type: "Mortar-lined and coated" as const, pct: 2 },
    { coating_type: "Mortar-lined and flexible coated" as const, pct: 3 },
    { coating_type: "Flexible lining and coated" as const, pct: 5 },
  ];

  for (const { coating_type, pct } of cases) {
    const D = 16;
    const actual = calculateFieldBendingLimits({ D, coating_type });
    assert.equal(strainLimitPct(coating_type), pct);
    assert.equal(actual.strain_limit_pct, pct);
    assert.equal(actual.max_deflection, maxDeflection(pct, D));
    assert.equal(actual.max_deflection, (pct / 100) * D);
  }
});

test("max deflection scales linearly with diameter", () => {
  const small = calculateFieldBendingLimits({
    D: 10,
    coating_type: "Flexible lining and coated",
  });
  const large = calculateFieldBendingLimits({
    D: 20,
    coating_type: "Flexible lining and coated",
  });
  assert.equal(small.strain_limit_pct, 5);
  assert.equal(large.strain_limit_pct, 5);
  assert.equal(small.max_deflection, 0.5);
  assert.equal(large.max_deflection, 1);
  assert.equal(large.max_deflection, small.max_deflection * 2);
});

test("validation requires D>0 and an Appendix A coating design", () => {
  assert.deepEqual(validateFieldBendingInputs(DEFAULT_FIELD_BENDING_INPUTS), []);
  assert.equal(isCoatingDesign("Mortar-lined and coated"), true);
  assert.equal(isCoatingDesign("tape wrap"), false);

  const badD = validateFieldBendingInputs({ D: 0, coating_type: "Mortar-lined and coated" });
  const badCoat = validateFieldBendingInputs({ D: 20, coating_type: "unknown" });
  assert.ok(badD.some((error) => error.includes("outside diameter")));
  assert.ok(badCoat.some((error) => error.includes("Coating design")));
});
