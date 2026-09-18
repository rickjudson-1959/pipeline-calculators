import type { WallThicknessInputs } from "./wall-thickness";

export type SizingMode = "required-wall" | "maop-from-wall";

export const DEFAULT_MODE: SizingMode = "required-wall";

export type ModeFieldConfig = {
  requiredKeys: (keyof WallThicknessInputs)[];
  hiddenKeys: (keyof WallThicknessInputs)[];
  placeholderKeys: (keyof WallThicknessInputs)[];
  headline: "tMin" | "maop";
};

const ALWAYS_REQUIRED: (keyof WallThicknessInputs)[] = [
  "od",
  "smys",
  "corr",
  "jointE",
  "tempT",
];

export function modeFieldConfig(mode: SizingMode): ModeFieldConfig {
  if (mode === "required-wall") {
    return {
      requiredKeys: [...ALWAYS_REQUIRED, "pDesign"],
      hiddenKeys: [],
      placeholderKeys: ["tnom"],
      headline: "tMin",
    };
  }

  return {
    requiredKeys: [...ALWAYS_REQUIRED, "tnom"],
    hiddenKeys: [],
    placeholderKeys: ["pDesign"],
    headline: "maop",
  };
}

export function modeHeadlineLabel(mode: SizingMode): string {
  return mode === "required-wall"
    ? "Minimum required wall (t_min)"
    : "Design pressure capacity (MAOP)";
}
