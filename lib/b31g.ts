import type { UnitSystem } from "./units";

export type B31gInputs = {
  od: number;
  wt: number;
  smys: number;
  f: number;
  depth: number;
  length: number;
  poper: number;
};

export type OperatingGate = "reject-depth" | "safe" | "derating";

export type B31gResults = {
  dt: number;
  maop: number;
  a: number;
  z: number;
  mOrig: number;
  mMod: number;
  pB31g: number;
  pMod: number;
  rsfMod: number;
  gate: OperatingGate;
};

export type B31gCalcOptions = {
  unitSystem?: UnitSystem;
};

export const DEFAULT_B31G_INPUTS: B31gInputs = {
  od: 508,
  wt: 9.5,
  smys: 483,
  f: 0.72,
  depth: 2.5,
  length: 150,
  poper: 9930,
};

export const DEFAULT_B31G_UNIT_SYSTEM: UnitSystem = "metric";
export const DEPTH_RATIO_REJECT = 0.8;
export const ORIG_FOLIAS_A_LIMIT = 4;
export const MOD_FOLIAS_Z_LIMIT = 50;
export const ORIG_AREA_FACTOR = 0.6667;
export const MOD_AREA_FACTOR = 0.85;
export const ORIG_FLOW_STRESS_FACTOR = 1.1;
export const METRIC_FLOW_ADD_MPA = 68.95;
export const US_FLOW_ADD_PSI = 10000;

export function evaluateOperatingGate(
  dt: number,
  poper: number,
  pMod: number,
): OperatingGate {
  if (dt > DEPTH_RATIO_REJECT) {
    return "reject-depth";
  }
  if (poper <= pMod) {
    return "safe";
  }
  return "derating";
}

export function formatOperatingGate(gate: OperatingGate): string {
  switch (gate) {
    case "reject-depth":
      return "REJECT (>80% DEPTH)";
    case "safe":
      return "SAFE AT OPERATING PRESSURE";
    case "derating":
      return "DERATING REQUIRED";
  }
}

export function isPassingGate(gate: OperatingGate): boolean {
  return gate === "safe";
}

function originalFoliasM(a: number): number {
  if (a <= ORIG_FOLIAS_A_LIMIT) {
    const a2 = a * a;
    return Math.sqrt(1 + 0.6275 * a2 - 0.003375 * a2 * a2);
  }
  return 0.032 * a * a + 3.29;
}

function modifiedFoliasM(z: number): number {
  if (z <= MOD_FOLIAS_Z_LIMIT) {
    return Math.sqrt(1 + 0.6275 * z - 0.003375 * z * z);
  }
  return 0.032 * z + 3.29;
}

function remainingStrength(
  areaFactor: number,
  dt: number,
  m: number,
): number | null {
  const denom = 1 - (areaFactor * dt) / m;
  if (!Number.isFinite(denom) || denom <= 0 || !Number.isFinite(m) || m <= 0) {
    return null;
  }
  return (1 - areaFactor * dt) / denom;
}

function hoopPressure(wt: number, stress: number, f: number, od: number): number {
  return (2 * wt * stress * f) / od;
}

export function calculateB31g(
  inputs: B31gInputs,
  options: B31gCalcOptions = {},
): B31gResults {
  const unitSystem = options.unitSystem ?? DEFAULT_B31G_UNIT_SYSTEM;
  const { od, wt, smys, f, depth, length, poper } = inputs;
  const dt = depth / wt;
  const a = (0.893 * length) / Math.sqrt(od * wt);
  const z = (length * length) / (od * wt);
  const mOrig = originalFoliasM(a);
  const mMod = modifiedFoliasM(z);

  const smysPressure = unitSystem === "metric" ? smys * 1000 : smys;
  const maop = hoopPressure(wt, smysPressure, f, od);

  const origFlow = ORIG_FLOW_STRESS_FACTOR * smysPressure;
  const origFactor =
    a <= ORIG_FOLIAS_A_LIMIT
      ? remainingStrength(ORIG_AREA_FACTOR, dt, mOrig)
      : 1 - dt;
  const pOrigRaw =
    origFactor !== null && origFactor > 0
      ? hoopPressure(wt, origFlow, f, od) * origFactor
      : Number.NaN;
  const pB31g = Math.min(maop, pOrigRaw);

  const modFlow =
    unitSystem === "metric"
      ? (smys + METRIC_FLOW_ADD_MPA) * 1000
      : smys + US_FLOW_ADD_PSI;
  const modFactor = remainingStrength(MOD_AREA_FACTOR, dt, mMod);
  const pModRaw =
    modFactor !== null && modFactor > 0
      ? hoopPressure(wt, modFlow, f, od) * modFactor
      : Number.NaN;
  const pMod = Math.min(maop, pModRaw);
  const rsfMod = (pMod / maop) * 100;

  return {
    dt,
    maop,
    a,
    z,
    mOrig,
    mMod,
    pB31g,
    pMod,
    rsfMod,
    gate: evaluateOperatingGate(dt, poper, pMod),
  };
}

export function validateB31gInputs(inputs: B31gInputs): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(inputs.od) || !(inputs.od > 0)) {
    errors.push("Outside diameter must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.wt) || !(inputs.wt > 0)) {
    errors.push("Nominal wall thickness must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.smys) || !(inputs.smys > 0)) {
    errors.push("SMYS must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.f) || !(inputs.f > 0)) {
    errors.push("Design factor F must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.depth) || inputs.depth < 0) {
    errors.push("Defect depth must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.length) || inputs.length < 0) {
    errors.push("Defect axial length must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.poper) || inputs.poper < 0) {
    errors.push("Current operating pressure must be a number of 0 or greater.");
  }
  if (
    Number.isFinite(inputs.wt) &&
    Number.isFinite(inputs.depth) &&
    inputs.wt > 0 &&
    inputs.depth >= 0 &&
    inputs.depth >= inputs.wt
  ) {
    errors.push("Defect depth must be less than nominal wall thickness.");
  }

  if (errors.length > 0) {
    return errors;
  }

  const preview = calculateB31g(inputs);
  if (!Number.isFinite(preview.maop) || preview.maop <= 0) {
    errors.push("Uncorroded MAOP could not be calculated from these inputs.");
  }
  if (!Number.isFinite(preview.pB31g) || preview.pB31g < 0) {
    errors.push(
      "Original B31G safe pressure could not be calculated. Check defect size so (1 - 0.6667 d/t / M) stays greater than 0.",
    );
  }
  if (!Number.isFinite(preview.pMod) || preview.pMod < 0) {
    errors.push(
      "Modified B31G safe pressure could not be calculated. Check defect size so (1 - 0.85 d/t / M) stays greater than 0.",
    );
  }
  if (!Number.isFinite(preview.rsfMod)) {
    errors.push("Modified RSF could not be calculated from these inputs.");
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

export function formatPressure(value: number): string {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return Math.round(value).toLocaleString("en-CA");
}

export function formatPercent(value: number): string {
  return formatFixed(value, 1);
}
