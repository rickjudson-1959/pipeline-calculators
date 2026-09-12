import type { UnitSystem } from "./units";

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
  fillVolume: number;
  bleach: number;
  pYield: number;
  pHigh: number;
  pLow: number;
  minPHigh: number;
  minFactor: number;
  isHighOk: boolean;
  isLowOk: boolean;
};

export type CodeStandard =
  | "csa_z662"
  | "asme_b314"
  | "asme_b318_c1"
  | "asme_b318_c2"
  | "asme_b318_c3"
  | "asme_b318_c4";

export type HydroCalcOptions = {
  unitSystem?: UnitSystem;
  code?: CodeStandard;
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

export const DEFAULT_UNIT_SYSTEM: UnitSystem = "metric";
export const DEFAULT_CODE_STANDARD: CodeStandard = "csa_z662";

export const BBL_PER_M3 = 6.28981;
export const CUFT_PER_BBL = 5.61458;
export const GAL_PER_L = 0.264172;
export const BLEACH_L_PER_M3 = 1.0;
export const HEAD_KPA_PER_M = 9.81;
export const HEAD_PSI_PER_FT = 0.433;
export const L_PER_M3 = 1000;

export const HIGH_POINT_FACTORS: Record<CodeStandard, number> = {
  csa_z662: 1.25,
  asme_b314: 1.25,
  asme_b318_c1: 1.1,
  asme_b318_c2: 1.25,
  asme_b318_c3: 1.4,
  asme_b318_c4: 1.5,
};

export const CODE_STANDARDS: {
  id: CodeStandard;
  label: string;
  minFactor: number;
}[] = [
  {
    id: "csa_z662",
    label: "CSA Z662 (Canada)",
    minFactor: HIGH_POINT_FACTORS.csa_z662,
  },
  {
    id: "asme_b314",
    label: "ASME B31.4 / 49 CFR 195 (US liquids)",
    minFactor: HIGH_POINT_FACTORS.asme_b314,
  },
  {
    id: "asme_b318_c1",
    label: "ASME B31.8 / 49 CFR 192 Gas Class 1",
    minFactor: HIGH_POINT_FACTORS.asme_b318_c1,
  },
  {
    id: "asme_b318_c2",
    label: "ASME B31.8 / 49 CFR 192 Gas Class 2",
    minFactor: HIGH_POINT_FACTORS.asme_b318_c2,
  },
  {
    id: "asme_b318_c3",
    label: "ASME B31.8 / 49 CFR 192 Gas Class 3",
    minFactor: HIGH_POINT_FACTORS.asme_b318_c3,
  },
  {
    id: "asme_b318_c4",
    label: "ASME B31.8 / 49 CFR 192 Gas Class 4",
    minFactor: HIGH_POINT_FACTORS.asme_b318_c4,
  },
];

export function getHighPointFactor(code: CodeStandard): number {
  return HIGH_POINT_FACTORS[code];
}

export function formatFactor(factor: number): string {
  return factor.toFixed(2);
}

export function hydrostaticHead(
  elTest: number,
  el: number,
  unitSystem: UnitSystem,
): number {
  const factor = unitSystem === "metric" ? HEAD_KPA_PER_M : HEAD_PSI_PER_FT;
  return (elTest - el) * factor;
}

export function barlowYieldPressure(
  od: number,
  wt: number,
  smys: number,
  unitSystem: UnitSystem,
): number {
  if (unitSystem === "metric") {
    return (2 * (smys * 1000) * wt) / od;
  }
  return (2 * smys * wt) / od;
}

export function fillVolumeAndBleach(
  id: number,
  length: number,
  unitSystem: UnitSystem,
): { area: number; fillVolume: number; bleach: number } {
  if (unitSystem === "metric") {
    const area = (Math.PI * Math.pow(id / 1000.0, 2)) / 4.0;
    const fillVolume = area * length;
    return {
      area,
      fillVolume,
      bleach: fillVolume * BLEACH_L_PER_M3,
    };
  }

  const area = (Math.PI * Math.pow(id / 12.0, 2)) / 4.0;
  const volCuFt = area * length;
  const fillVolume = volCuFt / CUFT_PER_BBL;
  return {
    area,
    fillVolume,
    bleach: (fillVolume / BBL_PER_M3) * GAL_PER_L * L_PER_M3,
  };
}

export function calculateHydrostatic(
  inputs: HydroInputs,
  options: HydroCalcOptions = {},
): HydroResults {
  const unitSystem = options.unitSystem ?? DEFAULT_UNIT_SYSTEM;
  const code = options.code ?? DEFAULT_CODE_STANDARD;
  const { od, wt, smys, length, mop, pTarget, elHigh, elTest, elLow } = inputs;

  const id = od - 2 * wt;
  const { area, fillVolume, bleach } = fillVolumeAndBleach(id, length, unitSystem);
  const pYield = barlowYieldPressure(od, wt, smys, unitSystem);
  const pHigh = pTarget + hydrostaticHead(elTest, elHigh, unitSystem);
  const pLow = pTarget + hydrostaticHead(elTest, elLow, unitSystem);
  const minFactor = getHighPointFactor(code);
  const minPHigh = minFactor * mop;
  const isHighOk = pHigh >= minPHigh;
  const isLowOk = pLow <= pYield;

  return {
    id,
    area,
    fillVolume,
    bleach,
    pYield,
    pHigh,
    pLow,
    minPHigh,
    minFactor,
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
    errors.push("MOP / MAOP must be a number of 0 or greater.");
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
