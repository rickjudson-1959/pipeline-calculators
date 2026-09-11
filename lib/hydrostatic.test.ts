import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BBL_PER_M3,
  BLEACH_L_PER_M3,
  calculateHydrostatic,
  DEFAULT_HYDRO_INPUTS,
  HEAD_KPA_PER_M,
  HIGH_POINT_MOP_FACTOR,
  validateHydroInputs,
} from "./hydrostatic.ts";

test("default inputs match the encoded hydrostatic formulas exactly", () => {
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
  const cubes = area * length;
  const bbls = cubes * 6.28981;
  const bleach = cubes * 1.0;
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

  assert.equal(actual.id, id);
  assert.equal(actual.area, area);
  assert.equal(actual.cubes, cubes);
  assert.equal(actual.bbls, bbls);
  assert.equal(actual.bleach, bleach);
  assert.equal(actual.pYield, pYield);
  assert.equal(actual.pHigh, pHigh);
  assert.equal(actual.pLow, pLow);
  assert.equal(actual.minPHigh, minPHigh);
  assert.equal(actual.isHighOk, pHigh >= minPHigh);
  assert.equal(actual.isLowOk, pLow <= pYield);
  assert.equal(actual.isHighOk, false);
  assert.equal(actual.isLowOk, true);
});

test("shared constants stay aligned with the encoded formulas", () => {
  assert.equal(BBL_PER_M3, 6.28981);
  assert.equal(BLEACH_L_PER_M3, 1.0);
  assert.equal(HEAD_KPA_PER_M, 9.81);
  assert.equal(HIGH_POINT_MOP_FACTOR, 1.25);
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
