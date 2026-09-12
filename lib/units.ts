export type UnitSystem = "metric" | "us";

export type HydroUnitField =
  | "od"
  | "wt"
  | "smys"
  | "length"
  | "mop"
  | "pTarget"
  | "elHigh"
  | "elTest"
  | "elLow";

export const MM_PER_IN = 25.4;
export const FT_PER_M = 3.28084;
export const PSI_PER_MPA = 145.038;
export const PSI_PER_KPA = 0.145038;

export type HydroUnitLabels = {
  diameter: string;
  smys: string;
  length: string;
  elevation: string;
  pressure: string;
  volume: string;
  bleach: string;
  head: string;
};

export function hydroUnitLabels(unitSystem: UnitSystem): HydroUnitLabels {
  if (unitSystem === "metric") {
    return {
      diameter: "mm",
      smys: "MPa",
      length: "m",
      elevation: "m",
      pressure: "kPa",
      volume: "m3",
      bleach: "L",
      head: "9.81 kPa per metre",
    };
  }

  return {
    diameter: "in",
    smys: "PSI",
    length: "ft",
    elevation: "ft",
    pressure: "PSI",
    volume: "bbls",
    bleach: "gal",
    head: "0.433 PSI per foot",
  };
}

export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value * FT_PER_M : value / FT_PER_M;
}

export function convertDiameter(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value / MM_PER_IN : value * MM_PER_IN;
}

export function convertSmys(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value * PSI_PER_MPA : value / PSI_PER_MPA;
}

export function convertPressure(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value * PSI_PER_KPA : value / PSI_PER_KPA;
}

export function convertHydroField(
  key: HydroUnitField,
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) {
    return value;
  }

  switch (key) {
    case "od":
    case "wt":
      return convertDiameter(value, from, to);
    case "smys":
      return convertSmys(value, from, to);
    case "length":
    case "elHigh":
    case "elTest":
    case "elLow":
      return convertLength(value, from, to);
    case "mop":
    case "pTarget":
      return convertPressure(value, from, to);
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function convertHydroValues<T extends Record<HydroUnitField, number>>(
  values: T,
  from: UnitSystem,
  to: UnitSystem,
): T {
  if (from === to) {
    return { ...values };
  }

  return {
    ...values,
    od: convertHydroField("od", values.od, from, to),
    wt: convertHydroField("wt", values.wt, from, to),
    smys: convertHydroField("smys", values.smys, from, to),
    length: convertHydroField("length", values.length, from, to),
    mop: convertHydroField("mop", values.mop, from, to),
    pTarget: convertHydroField("pTarget", values.pTarget, from, to),
    elHigh: convertHydroField("elHigh", values.elHigh, from, to),
    elTest: convertHydroField("elTest", values.elTest, from, to),
    elLow: convertHydroField("elLow", values.elLow, from, to),
  };
}

export function formatInputNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }
  const rounded = Math.round(value * 1e8) / 1e8;
  return String(rounded);
}
