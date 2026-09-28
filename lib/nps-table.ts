export type NpsRow = {
  nps: string;
  odIn: number;
  odMm: number;
};

/**
 * ASME B36.10 / B36.19 nominal pipe size to true outside diameter.
 * OD is fixed per NPS regardless of schedule/wall thickness. For NPS 14
 * and above, OD in inches equals the NPS number exactly, by convention.
 * odMm is odIn x 25.4, rounded to one decimal.
 */
export const NPS_OD_TABLE: NpsRow[] = [
  { nps: "1/8", odIn: 0.405, odMm: 10.3 },
  { nps: "1/4", odIn: 0.54, odMm: 13.7 },
  { nps: "3/8", odIn: 0.675, odMm: 17.1 },
  { nps: "1/2", odIn: 0.84, odMm: 21.3 },
  { nps: "3/4", odIn: 1.05, odMm: 26.7 },
  { nps: "1", odIn: 1.315, odMm: 33.4 },
  { nps: "1-1/4", odIn: 1.66, odMm: 42.2 },
  { nps: "1-1/2", odIn: 1.9, odMm: 48.3 },
  { nps: "2", odIn: 2.375, odMm: 60.3 },
  { nps: "2-1/2", odIn: 2.875, odMm: 73.0 },
  { nps: "3", odIn: 3.5, odMm: 88.9 },
  { nps: "3-1/2", odIn: 4.0, odMm: 101.6 },
  { nps: "4", odIn: 4.5, odMm: 114.3 },
  { nps: "5", odIn: 5.563, odMm: 141.3 },
  { nps: "6", odIn: 6.625, odMm: 168.3 },
  { nps: "8", odIn: 8.625, odMm: 219.1 },
  { nps: "10", odIn: 10.75, odMm: 273.1 },
  { nps: "12", odIn: 12.75, odMm: 323.9 },
  { nps: "14", odIn: 14.0, odMm: 355.6 },
  { nps: "16", odIn: 16.0, odMm: 406.4 },
  { nps: "18", odIn: 18.0, odMm: 457.2 },
  { nps: "20", odIn: 20.0, odMm: 508.0 },
  { nps: "22", odIn: 22.0, odMm: 558.8 },
  { nps: "24", odIn: 24.0, odMm: 609.6 },
  { nps: "26", odIn: 26.0, odMm: 660.4 },
  { nps: "28", odIn: 28.0, odMm: 711.2 },
  { nps: "30", odIn: 30.0, odMm: 762.0 },
  { nps: "32", odIn: 32.0, odMm: 812.8 },
  { nps: "34", odIn: 34.0, odMm: 863.6 },
  { nps: "36", odIn: 36.0, odMm: 914.4 },
  { nps: "38", odIn: 38.0, odMm: 965.2 },
  { nps: "40", odIn: 40.0, odMm: 1016.0 },
  { nps: "42", odIn: 42.0, odMm: 1066.8 },
  { nps: "44", odIn: 44.0, odMm: 1117.6 },
  { nps: "46", odIn: 46.0, odMm: 1168.4 },
  { nps: "48", odIn: 48.0, odMm: 1219.2 },
  { nps: "54", odIn: 54.0, odMm: 1371.6 },
  { nps: "60", odIn: 60.0, odMm: 1524.0 },
];

export function findNpsRow(nps: string): NpsRow | undefined {
  const normalized = nps.trim();
  return NPS_OD_TABLE.find((row) => row.nps === normalized);
}

export function filterNpsTable(query: string): NpsRow[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") {
    return NPS_OD_TABLE;
  }
  return NPS_OD_TABLE.filter(
    (row) =>
      row.nps.toLowerCase().includes(normalized) ||
      String(row.odIn).includes(normalized) ||
      String(row.odMm).includes(normalized),
  );
}
