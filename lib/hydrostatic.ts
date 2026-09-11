export type HydroInputs = {
  od: number;
  wt: number;
  smys: number;
  length: number;
  mop: number;
  pTarget: number;
  elHigh: number;
  elTest: number;
  elLow: number;
};

export type HydroResults = {
  id: number;
  area: number;
  cubes: number;
  bbls: number;
  bleach: number;
  pYield: number;
  pHigh: number;
  pLow: number;
  minPHigh: number;
  isHighOk: boolean;
  isLowOk: boolean;
};

export const DEFAULT_HYDRO_INPUTS: HydroInputs = {
  od: 508,
  wt: 6.6,
  smys: 483,
  length: 5000,
  mop: 9930,
  pTarget: 12413,
  elHigh: 350,
  elTest: 310,
  elLow: 300,
};

export const BBL_PER_M3 = 6.28981;
export const BLEACH_L_PER_M3 = 1.0;
export const HEAD_KPA_PER_M = 9.81;
export const HIGH_POINT_MOP_FACTOR = 1.25;

export function calculateHydrostatic(inputs: HydroInputs): HydroResults {
  const { od, wt, smys, length, mop, pTarget, elHigh, elTest, elLow } = inputs;

  const id = od - 2 * wt;
  const area = (Math.PI * Math.pow(id / 1000.0, 2)) / 4.0;
  const cubes = area * length;
  const bbls = cubes * BBL_PER_M3;
  const bleach = cubes * BLEACH_L_PER_M3;
  const pYield = (2 * (smys * 1000) * wt) / od;
  const pHigh = pTarget + (elTest - elHigh) * HEAD_KPA_PER_M;
  const pLow = pTarget + (elTest - elLow) * HEAD_KPA_PER_M;
  const minPHigh = HIGH_POINT_MOP_FACTOR * mop;
  const isHighOk = pHigh >= minPHigh;
  const isLowOk = pLow <= pYield;

  return {
    id,
    area,
    cubes,
    bbls,
    bleach,
    pYield,
    pHigh,
    pLow,
    minPHigh,
    isHighOk,
    isLowOk,
  };
}

export function validateHydroInputs(inputs: HydroInputs): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(inputs.od) || !(inputs.od > 0)) {
    errors.push("Outside diameter must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.wt) || !(inputs.wt > 0)) {
    errors.push("Wall thickness must be a number greater than 0.");
  }
  if (
    Number.isFinite(inputs.od) &&
    Number.isFinite(inputs.wt) &&
    inputs.od > 0 &&
    inputs.wt > 0 &&
    inputs.od - 2 * inputs.wt <= 0
  ) {
    errors.push(
      "Wall thickness is too large for the outside diameter. Inside diameter must be greater than 0.",
    );
  }
  if (!Number.isFinite(inputs.smys) || !(inputs.smys > 0)) {
    errors.push("SMYS must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.length) || inputs.length < 0) {
    errors.push("Section length must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.mop) || inputs.mop < 0) {
    errors.push("Licensed MOP must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.pTarget)) {
    errors.push("Target test pressure must be a number.");
  }
  if (!Number.isFinite(inputs.elHigh)) {
    errors.push("High-point elevation must be a number.");
  }
  if (!Number.isFinite(inputs.elTest)) {
    errors.push("Test-point elevation must be a number.");
  }
  if (!Number.isFinite(inputs.elLow)) {
    errors.push("Low-point elevation must be a number.");
  }

  return errors;
}

export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return null;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function formatFixed(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return value.toLocaleString("en-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
