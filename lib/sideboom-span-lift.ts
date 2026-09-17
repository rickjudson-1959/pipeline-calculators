export type SideboomInputs = {
  D: number;
  t: number;
  w: number;
  S_allow: number;
};

export type SideboomResults = {
  I: number;
  L_s: number;
  Lift_Load: number;
  sigma_bs: number;
};

export const SIDEBOOM_REFERENCE = "ASME B31 / Pipeline Infrastructure Eq 14-4";
export const SPAN_STRESS_FACTOR = 20;

export const DEFAULT_SIDEBOOM_INPUTS: SideboomInputs = {
  D: 20,
  t: 0.375,
  w: 10,
  S_allow: 70000,
};

export function momentOfInertia(D: number, t: number): number {
  return (Math.PI / 64) * (Math.pow(D, 4) - Math.pow(D - 2 * t, 4));
}

export function spanningStress(
  w: number,
  L_s: number,
  D: number,
  I: number,
): number {
  return (w * Math.pow(L_s, 2) * D) / (SPAN_STRESS_FACTOR * I);
}

export function calculateSideboomSpanLift(inputs: SideboomInputs): SideboomResults {
  const { D, t, w, S_allow } = inputs;
  const I = momentOfInertia(D, t);
  const L_s = Math.sqrt((SPAN_STRESS_FACTOR * S_allow * I) / (w * D));
  const Lift_Load = w * L_s;
  const sigma_bs = spanningStress(w, L_s, D, I);

  return {
    I,
    L_s,
    Lift_Load,
    sigma_bs,
  };
}

export function validateSideboomInputs(inputs: SideboomInputs): string[] {
  const errors: string[] = [];

  if (!Number.isFinite(inputs.D) || !(inputs.D > 0)) {
    errors.push("Pipe outside diameter must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.t) || !(inputs.t > 0)) {
    errors.push("Wall thickness must be a number greater than 0.");
  }
  if (
    Number.isFinite(inputs.D) &&
    Number.isFinite(inputs.t) &&
    inputs.D > 0 &&
    inputs.t > 0 &&
    !(inputs.t < inputs.D / 2)
  ) {
    errors.push(
      "Wall thickness must be less than half the outside diameter so the inside diameter is greater than 0.",
    );
  }
  if (!Number.isFinite(inputs.w) || !(inputs.w > 0)) {
    errors.push("Net unit weight must be a number greater than 0.");
  }
  if (!Number.isFinite(inputs.S_allow) || !(inputs.S_allow > 0)) {
    errors.push("Allowable bending stress must be a number greater than 0.");
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
