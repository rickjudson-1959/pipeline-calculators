import type { UnitSystem } from "./units";

export type WallThicknessInputs = {
  od: number;
  smys: number;
  pDesign: number;
  corr: number;
  tnom: number;
};

export type WallThicknessResults = {
  designFactor: number;
  allowableStress: number;
  pressureThickness: number;
  tMin: number;
  maop: number;
  isCompliant: boolean;
};

export type DesignCode =
  | "asme_b314"
  | "asme_b318_c1d1"
  | "asme_b318_c1d2"
  | "asme_b318_c2"
  | "asme_b318_c3"
  | "asme_b318_c4"
  | "csa_z662_c1";

export type WallCalcOptions = {
  unitSystem?: UnitSystem;
  code?: DesignCode;
};

export const DEFAULT_WALL_INPUTS: WallThicknessInputs = {
  od: 508,
  smys: 483,
  pDesign: 9930,
  corr: 1.6,
  tnom: 9.5,
};

export const DEFAULT_WALL_UNIT_SYSTEM: UnitSystem = "metric";
export const DEFAULT_DESIGN_CODE: DesignCode = "asme_b314";

export const DESIGN_FACTORS: Record<DesignCode, number> = {
  asme_b314: 0.72,
  asme_b318_c1d1: 0.8,
  asme_b318_c1d2: 0.72,
  asme_b318_c2: 0.6,
  asme_b318_c3: 0.5,
  asme_b318_c4: 0.4,
  csa_z662_c1: 0.8,
};

export const DESIGN_CODES: {
  id: DesignCode;
  label: string;
  designFactor: number;
}[] = [
  {
    id: "asme_b314",
    label: "ASME B31.4 liquid",
    designFactor: DESIGN_FACTORS.asme_b314,
  },
  {
    id: "asme_b318_c1d1",
    label: "ASME B31.8 Class 1 Div 1",
    designFactor: DESIGN_FACTORS.asme_b318_c1d1,
  },
  {
    id: "asme_b318_c1d2",
    label: "ASME B31.8 Class 1 Div 2",
    designFactor: DESIGN_FACTORS.asme_b318_c1d2,
  },
  {
    id: "asme_b318_c2",
    label: "ASME B31.8 Class 2",
    designFactor: DESIGN_FACTORS.asme_b318_c2,
  },
  {
    id: "asme_b318_c3",
    label: "ASME B31.8 Class 3",
    designFactor: DESIGN_FACTORS.asme_b318_c3,
  },
  {
    id: "asme_b318_c4",
    label: "ASME B31.8 Class 4",
    designFactor: DESIGN_FACTORS.asme_b318_c4,
  },
  {
    id: "csa_z662_c1",
    label: "CSA Z662 Class 1",
    designFactor: DESIGN_FACTORS.csa_z662_c1,
  },
];

export function getDesignFactor(code: DesignCode): number {
  return DESIGN_FACTORS[code];
}

export function formatDesignFactor(factor: number): string {
  return factor.toFixed(2);
}

export function calculateWallThickness(
  inputs: WallThicknessInputs,
  options: WallCalcOptions = {},
): WallThicknessResults {
  const unitSystem = options.unitSystem ?? DEFAULT_WALL_UNIT_SYSTEM;
  const code = options.code ?? DEFAULT_DESIGN_CODE;
  const { od, smys, pDesign, corr, tnom } = inputs;
  const designFactor = getDesignFactor(code);
  const allowableStress = designFactor * smys;

  const pressureThickness =
    unitSystem === "metric"
      ? (pDesign * od) / (2 * (allowableStress * 1000))
      : (pDesign * od) / (2 * allowableStress);
  const tMin = pressureThickness + corr;
  const remaining = tnom - corr;
  const maop =
    unitSystem === "metric"
      ? (2 * remaining * (allowableStress * 1000)) / od
      : (2 * remaining * allowableStress) / od;

  return {
    designFactor,
    allowableStress,
    pressureThickness,
    tMin,
    maop,
    isCompliant: maop >= pDesign,
  };
}

export function validateWallInputs(inputs: WallThicknessInputs): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(inputs.od) || !(inputs.od > 0)) {
    errors.push("Outside diameter must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.smys) || !(inputs.smys > 0)) {
    errors.push("SMYS must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.pDesign) || inputs.pDesign < 0) {
    errors.push("Design pressure must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.corr) || inputs.corr < 0) {
    errors.push("Corrosion allowance must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.tnom) || !(inputs.tnom > 0)) {
    errors.push("Selected nominal wall thickness must be a number greater than 0.");
  }
  if (
    Number.isFinite(inputs.tnom) &&
    Number.isFinite(inputs.corr) &&
    inputs.tnom > 0 &&
    inputs.corr >= 0 &&
    inputs.tnom <= inputs.corr
  ) {
    errors.push(
      "Selected nominal wall thickness must be greater than the corrosion allowance.",
    );
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
