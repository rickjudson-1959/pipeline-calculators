import type { UnitSystem } from "./units";

export type GasFlowInputs = {
  p1: number;
  p2: number;
  gamma: number;
  od: number;
  wt: number;
  length: number;
  efficiency: number;
};

export type GasFlowResults = {
  id: number;
  pressureDrop: number;
  weymouth: number;
  panhandleA: number;
  panhandleB: number;
};

export type GasFlowCalcOptions = {
  unitSystem?: UnitSystem;
};

export const DEFAULT_GAS_INPUTS: GasFlowInputs = {
  p1: 7000,
  p2: 5000,
  gamma: 0.6,
  od: 508,
  wt: 9.5,
  length: 50,
  efficiency: 0.92,
};

export const DEFAULT_GAS_UNIT_SYSTEM: UnitSystem = "metric";

export const GAS_Z = 0.88;
export const GAS_TB_K = 288.15;
export const GAS_PB_KPA = 101.325;
export const GAS_TF_K = 288.15;
export const GAS_TB_R = 520;
export const GAS_PB_PSIA = 14.73;
export const GAS_TF_R = 520;

export const WEYMOUTH_COEFF_METRIC = 3.7435e-3;
export const PANHANDLE_A_COEFF_METRIC = 4.596e-3;
export const PANHANDLE_B_COEFF_METRIC = 1.004e-2;
export const WEYMOUTH_COEFF_US = 433.5e-6;
export const PANHANDLE_A_COEFF_US = 435.87e-6;
export const PANHANDLE_B_COEFF_US = 737.0e-6;

export const SM3D_PER_E3M3D = 1000;

function pressureSquaredDelta(p1: number, p2: number): number {
  return p1 * p1 - p2 * p2;
}

function emptyResults(id: number, pressureDrop: number): GasFlowResults {
  return {
    id,
    pressureDrop,
    weymouth: 0,
    panhandleA: 0,
    panhandleB: 0,
  };
}

function calculateMetricFlow(inputs: GasFlowInputs, id: number): GasFlowResults {
  const { p1, p2, gamma, length, efficiency } = inputs;
  const dp2 = pressureSquaredDelta(p1, p2);
  const pressureDrop = p1 - p2;

  if (length <= 0 || gamma <= 0 || id <= 0 || dp2 <= 0) {
    return emptyResults(id, pressureDrop);
  }

  const tb = GAS_TB_K;
  const pb = GAS_PB_KPA;
  const tf = GAS_TF_K;
  const z = GAS_Z;
  const denom = gamma * tf * length * z;

  const weymouthSm3d =
    WEYMOUTH_COEFF_METRIC *
    (tb / pb) *
    Math.sqrt((dp2 * Math.pow(id, 5.333)) / denom) *
    efficiency;
  const panhandleASm3d =
    PANHANDLE_A_COEFF_METRIC *
    Math.pow(tb / pb, 1.0788) *
    Math.pow(dp2 / (Math.pow(gamma, 0.8539) * tf * length * z), 0.5394) *
    Math.pow(id, 2.6182) *
    efficiency;
  const panhandleBSm3d =
    PANHANDLE_B_COEFF_METRIC *
    Math.pow(tb / pb, 1.02) *
    Math.pow(dp2 / (Math.pow(gamma, 0.961) * tf * length * z), 0.51) *
    Math.pow(id, 2.53) *
    efficiency;

  return {
    id,
    pressureDrop,
    weymouth: weymouthSm3d / SM3D_PER_E3M3D,
    panhandleA: panhandleASm3d / SM3D_PER_E3M3D,
    panhandleB: panhandleBSm3d / SM3D_PER_E3M3D,
  };
}

function calculateUsFlow(inputs: GasFlowInputs, id: number): GasFlowResults {
  const { p1, p2, gamma, length, efficiency } = inputs;
  const dp2 = pressureSquaredDelta(p1, p2);
  const pressureDrop = p1 - p2;

  if (length <= 0 || gamma <= 0 || id <= 0 || dp2 <= 0) {
    return emptyResults(id, pressureDrop);
  }

  const tb = GAS_TB_R;
  const pb = GAS_PB_PSIA;
  const tf = GAS_TF_R;
  const z = GAS_Z;
  const denom = gamma * tf * length * z;

  const weymouth =
    WEYMOUTH_COEFF_US *
    (tb / pb) *
    Math.sqrt((dp2 * Math.pow(id, 5.333)) / denom) *
    efficiency;
  const panhandleA =
    PANHANDLE_A_COEFF_US *
    Math.pow(tb / pb, 1.0788) *
    Math.pow(dp2 / (Math.pow(gamma, 0.8539) * tf * length * z), 0.5394) *
    Math.pow(id, 2.6182) *
    efficiency;
  const panhandleB =
    PANHANDLE_B_COEFF_US *
    Math.pow(tb / pb, 1.02) *
    Math.pow(dp2 / (Math.pow(gamma, 0.961) * tf * length * z), 0.51) *
    Math.pow(id, 2.53) *
    efficiency;

  return {
    id,
    pressureDrop,
    weymouth,
    panhandleA,
    panhandleB,
  };
}

export function calculateGasFlow(
  inputs: GasFlowInputs,
  options: GasFlowCalcOptions = {},
): GasFlowResults {
  const unitSystem = options.unitSystem ?? DEFAULT_GAS_UNIT_SYSTEM;
  const id = inputs.od - 2 * inputs.wt;

  if (unitSystem === "metric") {
    return calculateMetricFlow(inputs, id);
  }

  return calculateUsFlow(inputs, id);
}

export function validateGasInputs(inputs: GasFlowInputs): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(inputs.p1) || !(inputs.p1 > 0)) {
    errors.push("Inlet pressure P1 must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.p2) || !(inputs.p2 > 0)) {
    errors.push("Outlet pressure P2 must be a number greater than 0.");
  }
  if (
    Number.isFinite(inputs.p1) &&
    Number.isFinite(inputs.p2) &&
    inputs.p1 > 0 &&
    inputs.p2 > 0 &&
    pressureSquaredDelta(inputs.p1, inputs.p2) <= 0
  ) {
    errors.push(
      "Inlet pressure P1 must be greater than outlet pressure P2 so the pressure-squared term is greater than 0.",
    );
  }
  if (!Number.isFinite(inputs.gamma) || !(inputs.gamma > 0)) {
    errors.push("Gas specific gravity must be a number greater than 0.");
  }
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
  if (!Number.isFinite(inputs.length) || !(inputs.length > 0)) {
    errors.push("Pipeline length must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.efficiency) || inputs.efficiency < 0) {
    errors.push("Line efficiency must be a number of 0 or greater.");
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

export function formatRate(value: number): string {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return Math.round(value).toLocaleString("en-CA");
}
