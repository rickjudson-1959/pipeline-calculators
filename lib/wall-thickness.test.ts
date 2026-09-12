import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateWallThickness,
  DEFAULT_DESIGN_CODE,
  DEFAULT_WALL_INPUTS,
  DEFAULT_WALL_UNIT_SYSTEM,
  DESIGN_CODES,
  DESIGN_FACTORS,
  getDesignFactor,
  validateWallInputs,
} from "./wall-thickness.ts";
import {
  convertWallField,
  convertWallValues,
  formatInputNumber,
  MM_PER_IN,
  PSI_PER_KPA,
  PSI_PER_MPA,
} from "./units.ts";

test("default metric B31.4 inputs match the encoded wall-thickness formulas exactly", () => {
  const od = 508;
  const smys = 483;
  const pDesign = 9930;
  const corr = 1.6;
  const tnom = 9.5;
  const designFactor = 0.72;
  const allowableStress = designFactor * smys;
  const pressureThickness = (pDesign * od) / (2 * (allowableStress * 1000));
  const tMin = pressureThickness + corr;
  const maop = (2 * (tnom - corr) * (allowableStress * 1000)) / od;

  const actual = calculateWallThickness(DEFAULT_WALL_INPUTS);

  assert.equal(DEFAULT_WALL_INPUTS.od, od);
  assert.equal(DEFAULT_WALL_INPUTS.smys, smys);
  assert.equal(DEFAULT_WALL_INPUTS.pDesign, pDesign);
  assert.equal(DEFAULT_WALL_INPUTS.corr, corr);
  assert.equal(DEFAULT_WALL_INPUTS.tnom, tnom);
  assert.equal(DEFAULT_WALL_UNIT_SYSTEM, "metric");
  assert.equal(DEFAULT_DESIGN_CODE, "asme_b314");
  assert.equal(getDesignFactor("asme_b314"), 0.72);

  assert.equal(actual.designFactor, designFactor);
  assert.equal(actual.allowableStress, allowableStress);
  assert.equal(actual.pressureThickness, pressureThickness);
  assert.equal(actual.tMin, tMin);
  assert.equal(actual.maop, maop);
  assert.equal(actual.isCompliant, maop >= pDesign);
  assert.equal(actual.isCompliant, true);
  assert.ok(Math.abs(actual.tMin - 8.853) < 0.001);
  assert.ok(Math.abs(actual.maop - 10816.2) < 0.05);
});

test("US customary path uses inches and PSI with the same design factor", () => {
  const inputs = convertWallValues(DEFAULT_WALL_INPUTS, "metric", "us");
  const { od, smys, pDesign, corr, tnom } = inputs;
  const designFactor = 0.72;
  const allowableStress = designFactor * smys;
  const pressureThickness = (pDesign * od) / (2 * allowableStress);
  const tMin = pressureThickness + corr;
  const maop = (2 * (tnom - corr) * allowableStress) / od;

  const actual = calculateWallThickness(inputs, {
    unitSystem: "us",
    code: "asme_b314",
  });

  assert.equal(od, 508 / 25.4);
  assert.equal(smys, 483 * 145.038);
  assert.equal(pDesign, 9930 * 0.145038);
  assert.equal(corr, 1.6 / 25.4);
  assert.equal(tnom, 9.5 / 25.4);
  assert.equal(actual.designFactor, designFactor);
  assert.equal(actual.pressureThickness, pressureThickness);
  assert.equal(actual.tMin, tMin);
  assert.equal(actual.maop, maop);
  assert.equal(actual.isCompliant, maop >= pDesign);
  assert.equal(actual.isCompliant, true);
});

test("ASME B31.8 Class 4 uses F=0.40 and marks the default wall undersized", () => {
  const actual = calculateWallThickness(DEFAULT_WALL_INPUTS, {
    unitSystem: "metric",
    code: "asme_b318_c4",
  });
  const s = 0.4 * DEFAULT_WALL_INPUTS.smys;
  const tp =
    (DEFAULT_WALL_INPUTS.pDesign * DEFAULT_WALL_INPUTS.od) / (2 * (s * 1000));
  const tMin = tp + DEFAULT_WALL_INPUTS.corr;
  const maop =
    (2 *
      (DEFAULT_WALL_INPUTS.tnom - DEFAULT_WALL_INPUTS.corr) *
      (s * 1000)) /
    DEFAULT_WALL_INPUTS.od;

  assert.equal(getDesignFactor("asme_b318_c4"), 0.4);
  assert.equal(actual.designFactor, 0.4);
  assert.equal(actual.tMin, tMin);
  assert.equal(actual.maop, maop);
  assert.equal(actual.isCompliant, false);
});

test("CSA Z662 Class 1 and B31.8 Class 1 Div 1 both use F=0.80", () => {
  const csa = calculateWallThickness(DEFAULT_WALL_INPUTS, {
    code: "csa_z662_c1",
  });
  const b318 = calculateWallThickness(DEFAULT_WALL_INPUTS, {
    code: "asme_b318_c1d1",
  });

  assert.equal(getDesignFactor("csa_z662_c1"), 0.8);
  assert.equal(getDesignFactor("asme_b318_c1d1"), 0.8);
  assert.equal(csa.designFactor, 0.8);
  assert.equal(b318.designFactor, 0.8);
  assert.equal(csa.tMin, b318.tMin);
  assert.equal(csa.maop, b318.maop);
  assert.equal(csa.isCompliant, true);
});

test("unit conversion constants and wall field mapping match the approved prototype", () => {
  assert.equal(convertWallField("od", 508, "metric", "us"), 508 / MM_PER_IN);
  assert.equal(convertWallField("corr", 1.6, "metric", "us"), 1.6 / MM_PER_IN);
  assert.equal(convertWallField("tnom", 9.5, "metric", "us"), 9.5 / MM_PER_IN);
  assert.equal(convertWallField("smys", 483, "metric", "us"), 483 * PSI_PER_MPA);
  assert.equal(
    convertWallField("pDesign", 9930, "metric", "us"),
    9930 * PSI_PER_KPA,
  );

  assert.equal(formatInputNumber(508 / 25.4), "20");
  assert.equal(formatInputNumber((1.6 / 25.4) * 25.4), "1.6");

  const us = convertWallValues(DEFAULT_WALL_INPUTS, "metric", "us");
  const back = convertWallValues(us, "us", "metric");
  assertClose(back.od, DEFAULT_WALL_INPUTS.od);
  assertClose(back.smys, DEFAULT_WALL_INPUTS.smys);
  assertClose(back.pDesign, DEFAULT_WALL_INPUTS.pDesign);
  assertClose(back.corr, DEFAULT_WALL_INPUTS.corr);
  assertClose(back.tnom, DEFAULT_WALL_INPUTS.tnom);
});

function assertClose(actual: number, expected: number) {
  assert.ok(
    Math.abs(actual - expected) < 1e-10,
    `expected ${expected}, got ${actual}`,
  );
}

test("shared design factors stay aligned with the encoded table", () => {
  assert.equal(DESIGN_FACTORS.asme_b314, 0.72);
  assert.equal(DESIGN_FACTORS.asme_b318_c1d1, 0.8);
  assert.equal(DESIGN_FACTORS.asme_b318_c1d2, 0.72);
  assert.equal(DESIGN_FACTORS.asme_b318_c2, 0.6);
  assert.equal(DESIGN_FACTORS.asme_b318_c3, 0.5);
  assert.equal(DESIGN_FACTORS.asme_b318_c4, 0.4);
  assert.equal(DESIGN_FACTORS.csa_z662_c1, 0.8);
  assert.equal(DESIGN_CODES.length, 7);
});

test("validation catches a nominal wall that is not thicker than corrosion allowance", () => {
  const errors = validateWallInputs({
    ...DEFAULT_WALL_INPUTS,
    tnom: 1.6,
    corr: 1.6,
  });
  assert.ok(
    errors.some((error) =>
      error.includes("greater than the corrosion allowance"),
    ),
  );
});
