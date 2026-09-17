export const COATING_DESIGNS = [
  "Mortar-lined and coated",
  "Mortar-lined and flexible coated",
  "Flexible lining and coated",
] as const;

export type CoatingDesign = (typeof COATING_DESIGNS)[number];

export const COATING_STRAIN_LIMIT_PCT: Record<CoatingDesign, number> = {
  "Mortar-lined and coated": 2,
  "Mortar-lined and flexible coated": 3,
  "Flexible lining and coated": 5,
};

export const FIELD_BENDING_REFERENCE =
  "Pipeline Infrastructure: Appendix A Acceptance Criteria";

export type FieldBendingInputs = {
  D: number;
  coating_type: CoatingDesign;
};

export type FieldBendingResults = {
  strain_limit_pct: number;
  max_deflection: number;
};

export const DEFAULT_FIELD_BENDING_INPUTS: FieldBendingInputs = {
  D: 20,
  coating_type: "Mortar-lined and coated",
};

export function isCoatingDesign(value: string): value is CoatingDesign {
  return (COATING_DESIGNS as readonly string[]).includes(value);
}

export function strainLimitPct(coating_type: CoatingDesign): number {
  return COATING_STRAIN_LIMIT_PCT[coating_type];
}

export function maxDeflection(strain_limit_pct: number, D: number): number {
  return (strain_limit_pct / 100) * D;
}

export function calculateFieldBendingLimits(
  inputs: FieldBendingInputs,
): FieldBendingResults {
  const strain_limit_pct = strainLimitPct(inputs.coating_type);
  return {
    strain_limit_pct,
    max_deflection: maxDeflection(strain_limit_pct, inputs.D),
  };
}

export function validateFieldBendingInputs(inputs: {
  D: number;
  coating_type: string;
}): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(inputs.D) || !(inputs.D > 0)) {
    errors.push("Pipe outside diameter must be a number greater than 0.");
  }
  if (!isCoatingDesign(inputs.coating_type)) {
    errors.push(
      "Coating design must be mortar-lined and coated, mortar-lined and flexible coated, or flexible lining and coated.",
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
