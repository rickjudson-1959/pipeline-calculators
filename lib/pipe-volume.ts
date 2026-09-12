import type { UnitSystem } from "./units";

export type PipeVolumeInputs = {
  od: number;
  wt: number;
  length: number;
  density: number;
  rate: number;
  dosing: number;
};

export type PipeVolumeResults = {
  id: number;
  area: number;
  fillVolume: number;
  volumePerDistance: number;
  fillMass: number;
  fillTimeHours: number;
  chemicalDose: number;
};

export type FluidPreset = "water" | "methanol" | "glycol" | "custom";

export type PipeVolumeCalcOptions = {
  unitSystem?: UnitSystem;
};

export const DEFAULT_VOLUME_INPUTS: PipeVolumeInputs = {
  od: 508,
  wt: 9.5,
  length: 5000,
  density: 1000,
  rate: 250,
  dosing: 500,
};

export const DEFAULT_VOLUME_UNIT_SYSTEM: UnitSystem = "metric";
export const DEFAULT_FLUID_PRESET: FluidPreset = "water";

export const BBL_PER_M3 = 6.28981;
export const CUFT_PER_BBL = 5.61458;
export const GAL_PER_L = 0.264172;
export const L_PER_M3 = 1000;
export const KG_PER_TONNE = 1000;
export const M_PER_KM = 1000;
export const FT_PER_MILE = 5280;
export const WATER_DENSITY_METRIC = 1000;
export const LB_PER_CUFT_PER_KG_M3 = 0.062428;

export const FLUID_SPECIFIC_GRAVITY: Record<Exclude<FluidPreset, "custom">, number> = {
  water: 1,
  methanol: 0.79,
  glycol: 1.11,
};

export const FLUID_PRESETS: {
  id: FluidPreset;
  label: string;
}[] = [
  { id: "water", label: "Water (SG 1.00)" },
  { id: "methanol", label: "Methanol (SG 0.79)" },
  { id: "glycol", label: "Glycol (SG 1.11)" },
  { id: "custom", label: "Custom density" },
];

export function densityFromPreset(
  preset: Exclude<FluidPreset, "custom">,
  unitSystem: UnitSystem,
): number {
  const metric = FLUID_SPECIFIC_GRAVITY[preset] * WATER_DENSITY_METRIC;
  return unitSystem === "metric" ? metric : metric * LB_PER_CUFT_PER_KG_M3;
}

export function isFluidPreset(value: string): value is FluidPreset {
  return FLUID_PRESETS.some((preset) => preset.id === value);
}

export function calculatePipeVolume(
  inputs: PipeVolumeInputs,
  options: PipeVolumeCalcOptions = {},
): PipeVolumeResults {
  const unitSystem = options.unitSystem ?? DEFAULT_VOLUME_UNIT_SYSTEM;
  const { od, wt, length, density, rate, dosing } = inputs;
  const id = od - 2 * wt;

  if (unitSystem === "metric") {
    const area = (Math.PI * Math.pow(id / 1000.0, 2)) / 4.0;
    const volM3 = area * length;
    const fillMass = (volM3 * density) / KG_PER_TONNE;
    const fillTimeHours = rate > 0 ? volM3 / rate : 0;
    const chemicalDose = volM3 * (dosing / 1000);
    const volumePerDistance = length > 0 ? volM3 / (length / M_PER_KM) : 0;

    return {
      id,
      area,
      fillVolume: volM3,
      volumePerDistance,
      fillMass,
      fillTimeHours,
      chemicalDose,
    };
  }

  const area = (Math.PI * Math.pow(id / 12.0, 2)) / 4.0;
  const volCuFt = area * length;
  const volBbls = volCuFt / CUFT_PER_BBL;
  const volM3 = volBbls / BBL_PER_M3;
  const fillMass = volCuFt * density;
  const fillTimeHours = rate > 0 ? volBbls / rate : 0;
  const chemicalDose = volM3 * L_PER_M3 * (dosing / 1000) * GAL_PER_L;
  const volumePerDistance = length > 0 ? volBbls / (length / FT_PER_MILE) : 0;

  return {
    id,
    area,
    fillVolume: volBbls,
    volumePerDistance,
    fillMass,
    fillTimeHours,
    chemicalDose,
  };
}

export function validateVolumeInputs(inputs: PipeVolumeInputs): string[] {
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
  if (!Number.isFinite(inputs.length) || inputs.length < 0) {
    errors.push("Section length must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.density) || !(inputs.density > 0)) {
    errors.push("Fluid density must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.rate) || inputs.rate < 0) {
    errors.push("Pumping rate must be a number of 0 or greater.");
  }
  if (!Number.isFinite(inputs.dosing) || inputs.dosing < 0) {
    errors.push("Chemical inhibitor dosing must be a number of 0 or greater.");
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
