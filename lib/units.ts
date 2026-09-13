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
export const LB_PER_CUFT_PER_KG_M3 = 0.062428;
export const BBL_PER_M3_RATE = 6.28981;
export const KM_PER_MILE = 1.60934;

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

export type WallUnitField =
  | "od"
  | "smys"
  | "pDesign"
  | "corr"
  | "tnom"
  | "jointE"
  | "tempT";

export type WallUnitLabels = {
  diameter: string;
  thickness: string;
  smys: string;
  pressure: string;
};

export function wallUnitLabels(unitSystem: UnitSystem): WallUnitLabels {
  if (unitSystem === "metric") {
    return {
      diameter: "mm",
      thickness: "mm",
      smys: "MPa",
      pressure: "kPa",
    };
  }

  return {
    diameter: "in",
    thickness: "in",
    smys: "PSI",
    pressure: "PSI",
  };
}

export function convertWallField(
  key: WallUnitField,
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) {
    return value;
  }

  switch (key) {
    case "od":
    case "corr":
    case "tnom":
      return convertDiameter(value, from, to);
    case "smys":
      return convertSmys(value, from, to);
    case "pDesign":
      return convertPressure(value, from, to);
    case "jointE":
    case "tempT":
      return value;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function convertWallValues<T extends Record<WallUnitField, number>>(
  values: T,
  from: UnitSystem,
  to: UnitSystem,
): T {
  if (from === to) {
    return { ...values };
  }

  return {
    ...values,
    od: convertWallField("od", values.od, from, to),
    smys: convertWallField("smys", values.smys, from, to),
    pDesign: convertWallField("pDesign", values.pDesign, from, to),
    corr: convertWallField("corr", values.corr, from, to),
    tnom: convertWallField("tnom", values.tnom, from, to),
    jointE: convertWallField("jointE", values.jointE, from, to),
    tempT: convertWallField("tempT", values.tempT, from, to),
  };
}

export type VolumeUnitField = "od" | "wt" | "length" | "density" | "rate" | "dosing";

export type VolumeUnitLabels = {
  diameter: string;
  length: string;
  volume: string;
  density: string;
  rate: string;
  dosing: string;
  mass: string;
  chemical: string;
  time: string;
  gradient: string;
};

export function volumeUnitLabels(unitSystem: UnitSystem): VolumeUnitLabels {
  if (unitSystem === "metric") {
    return {
      diameter: "mm",
      length: "m",
      volume: "m3",
      density: "kg/m3",
      rate: "m3/hr",
      dosing: "ppm",
      mass: "t",
      chemical: "L",
      time: "h",
      gradient: "m3/km",
    };
  }

  return {
    diameter: "in",
    length: "ft",
    volume: "bbls",
    density: "lb/ft3",
    rate: "bbl/hr",
    dosing: "ppm",
    mass: "lb",
    chemical: "gal",
    time: "h",
    gradient: "bbl/mi",
  };
}

export function convertDensity(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value * LB_PER_CUFT_PER_KG_M3 : value / LB_PER_CUFT_PER_KG_M3;
}

export function convertVolumeRate(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value * BBL_PER_M3_RATE : value / BBL_PER_M3_RATE;
}

export function convertVolumeField(
  key: VolumeUnitField,
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
    case "length":
      return convertLength(value, from, to);
    case "density":
      return convertDensity(value, from, to);
    case "rate":
      return convertVolumeRate(value, from, to);
    case "dosing":
      return value;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function convertVolumeValues<T extends Record<VolumeUnitField, number>>(
  values: T,
  from: UnitSystem,
  to: UnitSystem,
): T {
  if (from === to) {
    return { ...values };
  }

  return {
    ...values,
    od: convertVolumeField("od", values.od, from, to),
    wt: convertVolumeField("wt", values.wt, from, to),
    length: convertVolumeField("length", values.length, from, to),
    density: convertVolumeField("density", values.density, from, to),
    rate: convertVolumeField("rate", values.rate, from, to),
    dosing: convertVolumeField("dosing", values.dosing, from, to),
  };
}

export type GasUnitField =
  | "p1"
  | "p2"
  | "gamma"
  | "od"
  | "wt"
  | "length"
  | "efficiency";

export type GasUnitLabels = {
  pressure: string;
  diameter: string;
  length: string;
  flow: string;
};

export function gasUnitLabels(unitSystem: UnitSystem): GasUnitLabels {
  if (unitSystem === "metric") {
    return {
      pressure: "kPa abs",
      diameter: "mm",
      length: "km",
      flow: "10³ m3/d",
    };
  }

  return {
    pressure: "psia",
    diameter: "in",
    length: "mi",
    flow: "MMSCFD",
  };
}

export function convertPipelineLengthKmMi(
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) {
    return value;
  }
  return from === "metric" ? value / KM_PER_MILE : value * KM_PER_MILE;
}

export function convertGasField(
  key: GasUnitField,
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) {
    return value;
  }

  switch (key) {
    case "p1":
    case "p2":
      return convertPressure(value, from, to);
    case "od":
    case "wt":
      return convertDiameter(value, from, to);
    case "length":
      return convertPipelineLengthKmMi(value, from, to);
    case "gamma":
    case "efficiency":
      return value;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function convertGasValues<T extends Record<GasUnitField, number>>(
  values: T,
  from: UnitSystem,
  to: UnitSystem,
): T {
  if (from === to) {
    return { ...values };
  }

  return {
    ...values,
    p1: convertGasField("p1", values.p1, from, to),
    p2: convertGasField("p2", values.p2, from, to),
    gamma: convertGasField("gamma", values.gamma, from, to),
    od: convertGasField("od", values.od, from, to),
    wt: convertGasField("wt", values.wt, from, to),
    length: convertGasField("length", values.length, from, to),
    efficiency: convertGasField("efficiency", values.efficiency, from, to),
  };
}

export type B31gUnitField =
  | "od"
  | "wt"
  | "smys"
  | "f"
  | "depth"
  | "length"
  | "poper";

export type B31gUnitLabels = {
  diameter: string;
  smys: string;
  pressure: string;
};

export function b31gUnitLabels(unitSystem: UnitSystem): B31gUnitLabels {
  if (unitSystem === "metric") {
    return {
      diameter: "mm",
      smys: "MPa",
      pressure: "kPa",
    };
  }

  return {
    diameter: "in",
    smys: "PSI",
    pressure: "PSI",
  };
}

export function convertB31gField(
  key: B31gUnitField,
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
    case "depth":
    case "length":
      return convertDiameter(value, from, to);
    case "smys":
      return convertSmys(value, from, to);
    case "poper":
      return convertPressure(value, from, to);
    case "f":
      return value;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function convertB31gValues<T extends Record<B31gUnitField, number>>(
  values: T,
  from: UnitSystem,
  to: UnitSystem,
): T {
  if (from === to) {
    return { ...values };
  }

  return {
    ...values,
    od: convertB31gField("od", values.od, from, to),
    wt: convertB31gField("wt", values.wt, from, to),
    smys: convertB31gField("smys", values.smys, from, to),
    f: convertB31gField("f", values.f, from, to),
    depth: convertB31gField("depth", values.depth, from, to),
    length: convertB31gField("length", values.length, from, to),
    poper: convertB31gField("poper", values.poper, from, to),
  };
}

export function formatInputNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }
  const rounded = Math.round(value * 1e8) / 1e8;
  return String(rounded);
}
