import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BBL_PER_M3,
  BLEACH_L_PER_M3,
  calculateHydrostatic,
  CODE_STANDARDS,
  CUFT_PER_BBL,
  DEFAULT_CODE_STANDARD,
  DEFAULT_HYDRO_INPUTS,
  DEFAULT_UNIT_SYSTEM,
  GAL_PER_L,
  getHighPointFactor,
  HEAD_KPA_PER_M,
  HEAD_PSI_PER_FT,
  HIGH_POINT_FACTORS,
  L_PER_M3,
  validateHydroInputs,
} from "./hydrostatic.ts";
import {
  convertHydroField,
  convertHydroValues,
  formatInputNumber,
  FT_PER_M,
  MM_PER_IN,
  PSI_PER_KPA,
  PSI_PER_MPA,
} from "./units.ts";

test("default metric CSA inputs match the encoded hydrostatic formulas exactly", () => {
  const od = 508;
  const wt = 6.6;
  const smys = 483;
  const length = 5000;
  const mop = 9930;
  const pTarget = 12413;
  const elHigh = 350;
  const elTest = 310;
  const elLow = 300;

  const id = od - 2 * wt;
  const area = (Math.PI * Math.pow(id / 1000.0, 2)) / 4.0;
  const fillVolume = area * length;
  const bleach = fillVolume * 1.0;
  const pYield = (2 * (smys * 1000) * wt) / od;
  const pHigh = pTarget + (elTest - elHigh) * 9.81;
  const pLow = pTarget + (elTest - elLow) * 9.81;
  const minPHigh = 1.25 * mop;

  const actual = calculateHydrostatic(DEFAULT_HYDRO_INPUTS);

  assert.equal(DEFAULT_HYDRO_INPUTS.od, od);
  assert.equal(DEFAULT_HYDRO_INPUTS.wt, wt);
  assert.equal(DEFAULT_HYDRO_INPUTS.smys, smys);
  assert.equal(DEFAULT_HYDRO_INPUTS.length, length);
  assert.equal(DEFAULT_HYDRO_INPUTS.mop, mop);
  assert.equal(DEFAULT_HYDRO_INPUTS.pTarget, pTarget);
  assert.equal(DEFAULT_HYDRO_INPUTS.elHigh, elHigh);
  assert.equal(DEFAULT_HYDRO_INPUTS.elTest, elTest);
  assert.equal(DEFAULT_HYDRO_INPUTS.elLow, elLow);
  assert.equal(DEFAULT_UNIT_SYSTEM, "metric");
  assert.equal(DEFAULT_CODE_STANDARD, "csa_z662");

  assert.equal(actual.id, id);
  assert.equal(actual.area, area);
  assert.equal(actual.fillVolume, fillVolume);
  assert.equal(actual.bleach, bleach);
  assert.equal(actual.pYield, pYield);
  assert.equal(actual.pHigh, pHigh);
  assert.equal(actual.pLow, pLow);
  assert.equal(actual.minFactor, 1.25);
  assert.equal(actual.minPHigh, minPHigh);
  assert.equal(actual.isHighOk, pHigh >= minPHigh);
  assert.equal(actual.isLowOk, pLow <= pYield);
  assert.equal(actual.isHighOk, false);
  assert.equal(actual.isLowOk, true);
});

test("US customary path uses inches, PSI, feet, barrels, and gallons", () => {
  const inputs = convertHydroValues(DEFAULT_HYDRO_INPUTS, "metric", "us");
  const { od, wt, smys, length, mop, pTarget, elHigh, elTest, elLow } = inputs;

  const id = od - 2 * wt;
  const area = (Math.PI * Math.pow(id / 12.0, 2)) / 4.0;
  const volCuFt = area * length;
  const fillVolume = volCuFt / 5.61458;
  const bleach = (fillVolume / 6.28981) * 0.264172 * 1000;
  const pYield = (2 * smys * wt) / od;
  const pHigh = pTarget + (elTest - elHigh) * 0.433;
  const pLow = pTarget + (elTest - elLow) * 0.433;
  const minPHigh = 1.25 * mop;

  const actual = calculateHydrostatic(inputs, {
    unitSystem: "us",
    code: "asme_b314",
  });

  assert.equal(od, 508 / 25.4);
  assert.equal(actual.id, id);
  assert.equal(actual.area, area);
  assert.equal(actual.fillVolume, fillVolume);
  assert.equal(actual.bleach, bleach);
  assert.equal(actual.pYield, pYield);
  assert.equal(actual.pHigh, pHigh);
  assert.equal(actual.pLow, pLow);
  assert.equal(actual.minFactor, 1.25);
  assert.equal(actual.minPHigh, minPHigh);
  assert.equal(actual.isHighOk, pHigh >= minPHigh);
  assert.equal(actual.isLowOk, pLow <= pYield);
});

test("ASME B31.8 Class 4 uses a 1.50 high-point factor", () => {
  const actual = calculateHydrostatic(DEFAULT_HYDRO_INPUTS, {
    unitSystem: "metric",
    code: "asme_b318_c4",
  });

  assert.equal(getHighPointFactor("asme_b318_c4"), 1.5);
  assert.equal(actual.minFactor, 1.5);
  assert.equal(actual.minPHigh, 1.5 * DEFAULT_HYDRO_INPUTS.mop);
  assert.equal(actual.isHighOk, false);
  assert.equal(actual.isLowOk, true);
});

test("ASME B31.8 Class 1 uses a 1.10 high-point factor and can change the gate", () => {
  const actual = calculateHydrostatic(DEFAULT_HYDRO_INPUTS, {
    unitSystem: "metric",
    code: "asme_b318_c1",
  });

  assert.equal(actual.minFactor, 1.1);
  assert.equal(actual.minPHigh, 1.1 * DEFAULT_HYDRO_INPUTS.mop);
  assert.equal(actual.isHighOk, true);
  assert.equal(actual.isLowOk, true);
});

test("unit conversion constants and field mapping match the approved prototype", () => {
  assert.equal(convertHydroField("od", 508, "metric", "us"), 508 / MM_PER_IN);
  assert.equal(convertHydroField("wt", 6.6, "metric", "us"), 6.6 / MM_PER_IN);
  assert.equal(convertHydroField("length", 5000, "metric", "us"), 5000 * FT_PER_M);
  assert.equal(convertHydroField("elHigh", 350, "metric", "us"), 350 * FT_PER_M);
  assert.equal(convertHydroField("smys", 483, "metric", "us"), 483 * PSI_PER_MPA);
  assert.equal(convertHydroField("mop", 9930, "metric", "us"), 9930 * PSI_PER_KPA);
  assert.equal(convertHydroField("pTarget", 12413, "metric", "us"), 12413 * PSI_PER_KPA);

  assert.equal(formatInputNumber(508 / 25.4), "20");
  assert.equal(formatInputNumber((6.6 / 25.4) * 25.4), "6.6");

  const us = convertHydroValues(DEFAULT_HYDRO_INPUTS, "metric", "us");
  const back = convertHydroValues(us, "us", "metric");
  assertClose(back.od, DEFAULT_HYDRO_INPUTS.od);
  assertClose(back.wt, DEFAULT_HYDRO_INPUTS.wt);
  assertClose(back.smys, DEFAULT_HYDRO_INPUTS.smys);
  assertClose(back.length, DEFAULT_HYDRO_INPUTS.length);
  assertClose(back.mop, DEFAULT_HYDRO_INPUTS.mop);
  assertClose(back.pTarget, DEFAULT_HYDRO_INPUTS.pTarget);
  assertClose(back.elHigh, DEFAULT_HYDRO_INPUTS.elHigh);
  assertClose(back.elTest, DEFAULT_HYDRO_INPUTS.elTest);
  assertClose(back.elLow, DEFAULT_HYDRO_INPUTS.elLow);
});

function assertClose(actual: number, expected: number) {
  assert.ok(
    Math.abs(actual - expected) < 1e-10,
    `expected ${expected}, got ${actual}`,
  );
}

test("shared constants stay aligned with the encoded formulas", () => {
  assert.equal(BBL_PER_M3, 6.28981);
  assert.equal(CUFT_PER_BBL, 5.61458);
  assert.equal(GAL_PER_L, 0.264172);
  assert.equal(BLEACH_L_PER_M3, 1.0);
  assert.equal(HEAD_KPA_PER_M, 9.81);
  assert.equal(HEAD_PSI_PER_FT, 0.433);
  assert.equal(L_PER_M3, 1000);
  assert.equal(HIGH_POINT_FACTORS.csa_z662, 1.25);
  assert.equal(HIGH_POINT_FACTORS.asme_b314, 1.25);
  assert.equal(HIGH_POINT_FACTORS.asme_b318_c1, 1.1);
  assert.equal(HIGH_POINT_FACTORS.asme_b318_c2, 1.25);
  assert.equal(HIGH_POINT_FACTORS.asme_b318_c3, 1.4);
  assert.equal(HIGH_POINT_FACTORS.asme_b318_c4, 1.5);
  assert.equal(CODE_STANDARDS.length, 6);
});

test("validation catches a non-positive inside diameter", () => {
  const errors = validateHydroInputs({
    ...DEFAULT_HYDRO_INPUTS,
    od: 10,
    wt: 6,
  });
  assert.ok(
    errors.some((error) => error.includes("Inside diameter must be greater than 0")),
  );
});
