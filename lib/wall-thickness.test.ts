import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateWallThickness,
  compareWallStandards,
  DEFAULT_DESIGN_CODE,
  DEFAULT_WALL_INPUTS,
  DEFAULT_WALL_UNIT_SYSTEM,
  DESIGN_CODES,
  DESIGN_FACTORS,
  formatCompliance,
  formatFixed,
  getDesignFactor,
  SLENDERNESS_LIMIT,
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

const METRIC_B314 = {
  od: 508,
  smys: 483,
  pDesign: 9930,
  corr: 1.6,
  tnom: 9.5,
  jointE: 1,
  tempT: 1,
  designFactor: 0.72,
  allowableStress: 347.76,
  pressureThickness: 7.25,
  tMin: 8.85,
  maop: 10816,
};

function expectedMetric(designFactor: number, inputs = DEFAULT_WALL_INPUTS) {
  const allowableStress = designFactor * inputs.smys;
  const denom = 2 * (allowableStress * 1000) * inputs.jointE * inputs.tempT;
  const pressureThickness = (inputs.pDesign * inputs.od) / denom;
  const tMin = pressureThickness + inputs.corr;
  const maop = ((inputs.tnom - inputs.corr) * denom) / inputs.od;
  return {
    allowableStress,
    pressureThickness,
    tMin,
    maop,
    isCompliant: inputs.tnom >= tMin && maop >= inputs.pDesign,
    dtNom: inputs.od / inputs.tnom,
    dtMin: inputs.od / tMin,
  };
}

test("default metric B31.4 inputs match Rick Version 2 sanity numbers", () => {
  const actual = calculateWallThickness(DEFAULT_WALL_INPUTS);

  assert.equal(DEFAULT_WALL_INPUTS.od, METRIC_B314.od);
  assert.equal(DEFAULT_WALL_INPUTS.smys, METRIC_B314.smys);
  assert.equal(DEFAULT_WALL_INPUTS.pDesign, METRIC_B314.pDesign);
  assert.equal(DEFAULT_WALL_INPUTS.corr, METRIC_B314.corr);
  assert.equal(DEFAULT_WALL_INPUTS.tnom, METRIC_B314.tnom);
  assert.equal(DEFAULT_WALL_INPUTS.jointE, 1);
  assert.equal(DEFAULT_WALL_INPUTS.tempT, 1);
  assert.equal(DEFAULT_WALL_UNIT_SYSTEM, "metric");
  assert.equal(DEFAULT_DESIGN_CODE, "asme_b314");
  assert.equal(getDesignFactor("asme_b314"), 0.72);

  const expected = expectedMetric(0.72);
  assert.equal(actual.designFactor, 0.72);
  assert.equal(actual.allowableStress, expected.allowableStress);
  assert.equal(actual.allowableStress, METRIC_B314.allowableStress);
  assert.equal(actual.pressureThickness, expected.pressureThickness);
  assert.equal(actual.tMin, expected.tMin);
  assert.equal(actual.maop, expected.maop);
  assert.equal(actual.isCompliant, true);
  assert.equal(formatCompliance(actual.isCompliant), "COMPLIANT");
  assert.equal(formatFixed(actual.allowableStress, 2), "347.76");
  assert.ok(Math.abs(actual.pressureThickness - 7.25) < 0.01);
  assert.ok(Math.abs(actual.tMin - 8.85) < 0.01);
  assert.ok(Math.abs(actual.maop - 10816) < 1);
  assert.equal(formatFixed(actual.tMin, 2), "8.85");
  assert.equal(formatFixed(actual.maop, 0), "10,816");
});

test("US customary path uses inches and PSI with E and T in the same equation", () => {
  const inputs = convertWallValues(DEFAULT_WALL_INPUTS, "metric", "us");
  const { od, smys, pDesign, corr, tnom, jointE, tempT } = inputs;
  const designFactor = 0.72;
  const allowableStress = designFactor * smys;
  const denom = 2 * allowableStress * jointE * tempT;
  const pressureThickness = (pDesign * od) / denom;
  const tMin = pressureThickness + corr;
  const maop = ((tnom - corr) * denom) / od;

  const actual = calculateWallThickness(inputs, {
    unitSystem: "us",
    code: "asme_b314",
  });

  assert.equal(od, 508 / 25.4);
  assert.equal(smys, 483 * 145.038);
  assert.equal(pDesign, 9930 * 0.145038);
  assert.equal(corr, 1.6 / 25.4);
  assert.equal(tnom, 9.5 / 25.4);
  assert.equal(jointE, 1);
  assert.equal(tempT, 1);
  assert.equal(actual.designFactor, designFactor);
  assert.equal(actual.pressureThickness, pressureThickness);
  assert.equal(actual.tMin, tMin);
  assert.equal(actual.maop, maop);
  assert.equal(actual.isCompliant, tnom >= tMin && maop >= pDesign);
  assert.equal(actual.isCompliant, true);
});

test("ASME B31.8 Class 4 uses F=0.40 and matches the undersized sanity case", () => {
  const actual = calculateWallThickness(DEFAULT_WALL_INPUTS, {
    unitSystem: "metric",
    code: "asme_b318_c4",
  });
  const expected = expectedMetric(0.4);

  assert.equal(getDesignFactor("asme_b318_c4"), 0.4);
  assert.equal(actual.designFactor, 0.4);
  assert.ok(Math.abs(actual.allowableStress - 193.2) < 1e-10);
  assert.equal(actual.tMin, expected.tMin);
  assert.equal(actual.maop, expected.maop);
  assert.equal(actual.isCompliant, false);
  assert.equal(formatCompliance(actual.isCompliant), "UNDERSIZED");
  assert.ok(Math.abs(actual.pressureThickness - 13.06) < 0.01);
  assert.ok(Math.abs(actual.tMin - 14.66) < 0.01);
  assert.ok(Math.abs(actual.maop - 6009) < 1);
  assert.equal(formatFixed(actual.allowableStress, 2), "193.20");
  assert.equal(formatFixed(actual.tMin, 2), "14.65");
  assert.equal(formatFixed(actual.maop, 0), "6,009");
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

test("joint efficiency E and temperature derating T scale t_p and MAOP", () => {
  const derated = calculateWallThickness({
    ...DEFAULT_WALL_INPUTS,
    jointE: 0.8,
    tempT: 0.867,
  });
  const baseline = calculateWallThickness(DEFAULT_WALL_INPUTS);
  const scale = 0.8 * 0.867;

  assert.ok(Math.abs(derated.pressureThickness - baseline.pressureThickness / scale) < 1e-10);
  assert.ok(Math.abs(derated.maop - baseline.maop * scale) < 1e-8);
  assert.equal(derated.isCompliant, false);
});

test("slenderness flags D/t_nom and D/t_min against the 140 limit", () => {
  const defaultResult = calculateWallThickness(DEFAULT_WALL_INPUTS);
  assert.equal(SLENDERNESS_LIMIT, 140);
  assert.ok(defaultResult.dtNom < 140);
  assert.ok(defaultResult.dtMin < 140);
  assert.equal(defaultResult.dtNomOk, true);
  assert.equal(defaultResult.dtMinOk, true);

  const slender = calculateWallThickness({
    ...DEFAULT_WALL_INPUTS,
    tnom: 3,
  });
  assert.ok(slender.dtNom > 140);
  assert.equal(slender.dtNomOk, false);
  assert.equal(slender.dtMinOk, defaultResult.dtMinOk);
});

test("comparison grid evaluates every encoded location class on the same inputs", () => {
  const rows = compareWallStandards(DEFAULT_WALL_INPUTS);
  assert.equal(rows.length, DESIGN_CODES.length);
  assert.deepEqual(
    rows.map((row) => row.code),
    DESIGN_CODES.map((standard) => standard.id),
  );

  const b314 = rows.find((row) => row.code === "asme_b314");
  const class4 = rows.find((row) => row.code === "asme_b318_c4");
  assert.ok(b314);
  assert.ok(class4);
  assert.equal(b314.designFactor, 0.72);
  assert.equal(class4.designFactor, 0.4);
  assert.ok(Math.abs(b314.tMin - 8.85) < 0.01);
  assert.ok(Math.abs(b314.maop - 10816) < 1);
  assert.equal(b314.isCompliant, true);
  assert.ok(Math.abs(class4.tMin - 14.66) < 0.01);
  assert.ok(Math.abs(class4.maop - 6009) < 1);
  assert.equal(class4.isCompliant, false);
});

test("unit conversion constants and wall field mapping leave E and T unchanged", () => {
  assert.equal(convertWallField("od", 508, "metric", "us"), 508 / MM_PER_IN);
  assert.equal(convertWallField("corr", 1.6, "metric", "us"), 1.6 / MM_PER_IN);
  assert.equal(convertWallField("tnom", 9.5, "metric", "us"), 9.5 / MM_PER_IN);
  assert.equal(convertWallField("smys", 483, "metric", "us"), 483 * PSI_PER_MPA);
  assert.equal(
    convertWallField("pDesign", 9930, "metric", "us"),
    9930 * PSI_PER_KPA,
  );
  assert.equal(convertWallField("jointE", 0.8, "metric", "us"), 0.8);
  assert.equal(convertWallField("tempT", 1, "metric", "us"), 1);

  assert.equal(formatInputNumber(508 / 25.4), "20");
  assert.equal(formatInputNumber((1.6 / 25.4) * 25.4), "1.6");

  const us = convertWallValues(
    { ...DEFAULT_WALL_INPUTS, jointE: 0.8, tempT: 0.867 },
    "metric",
    "us",
  );
  assert.equal(us.jointE, 0.8);
  assert.equal(us.tempT, 0.867);
  const back = convertWallValues(us, "us", "metric");
  assertClose(back.od, DEFAULT_WALL_INPUTS.od);
  assertClose(back.smys, DEFAULT_WALL_INPUTS.smys);
  assertClose(back.pDesign, DEFAULT_WALL_INPUTS.pDesign);
  assertClose(back.corr, DEFAULT_WALL_INPUTS.corr);
  assertClose(back.tnom, DEFAULT_WALL_INPUTS.tnom);
  assert.equal(back.jointE, 0.8);
  assert.equal(back.tempT, 0.867);
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

test("validation rejects non-positive E and T", () => {
  const zeroE = validateWallInputs({ ...DEFAULT_WALL_INPUTS, jointE: 0 });
  const zeroT = validateWallInputs({ ...DEFAULT_WALL_INPUTS, tempT: 0 });
  assert.ok(zeroE.some((error) => error.includes("joint efficiency")));
  assert.ok(zeroT.some((error) => error.includes("Temperature derating")));
});
