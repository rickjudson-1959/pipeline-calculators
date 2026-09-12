# Pipeline Calculators

Pipe-Up field and office calculators for pipeline work in Canada and the United States. This suite is complete for now. Live tools are a hydrostatic test calculator for fill volume and elevation pressure checks, a wall thickness calculator for pressure-design minimum wall, MAOP, slenderness, and a multi-standard comparison grid under CSA Z662 and ASME B31.4 / B31.8, a pipe volume and displacement calculator for line fill, fill mass, fill time, and chemical dosage, a natural gas flow calculator for Weymouth, Panhandle A, and Panhandle B rates, and an ASME B31G / Modified B31G calculator for corroded-pipe remaining strength.

This is an engineering aid, not stamped design.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready (`npm run build`)

No AdSense, email gate, or Hostinger setup is included in v1.

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Hydrostatic calculator: `/calculators/hydrostatic-test`
- Wall thickness calculator: `/calculators/wall-thickness`
- Pipe volume calculator: `/calculators/pipe-volume`
- Gas flow calculator: `/calculators/gas-flow`
- B31G calculator: `/calculators/b31g`

## Test and verify

Default metric math, a US Customary path, unit conversion, and extra code factors, volume formulas, gas-flow equations, or B31G remaining-strength formulas are checked against the encoded formulas:

```bash
npm test
npm run verify
```

`verify` prints hydrostatic defaults (metric CSA, converted US B31.4, metric Class 4), wall-thickness defaults (metric B31.4, converted US B31.4, metric B31.8 Class 4, plus the multi-standard grid), pipe-volume defaults (metric water-filled 508 mm example and the converted US path), gas-flow defaults (metric 508 mm example and the converted US path), and B31G defaults (metric 508 mm example and the converted US path).

Hydrostatic metric defaults (508 mm OD, 6.6 mm WT, 483 MPa SMYS, 5000 m, 9930 kPa MOP, 12413 kPa target, elevations 350 / 310 / 300 m): the CSA / 1.25 high-point gate does not meet and the low-point gate meets 100% SMYS. That is expected from the formulas, not a page error. Switching the same inputs to ASME B31.8 Class 1 (1.10) meets the high-point gate.

Wall-thickness metric defaults (508 mm OD, 483 MPa SMYS, 9930 kPa design pressure, 1.6 mm corrosion, 9.5 mm selected WT, E=1.00, T=1.00, ASME B31.4 F=0.72): S is 347.76 MPa, t_p is 7.25 mm, t_min is 8.85 mm, and MAOP is 10,816 kPa, so the thickness gate is COMPLIANT. Switching the same inputs to ASME B31.8 Class 4 (F=0.40) gives t_min of 14.66 mm and MAOP of 6,009 kPa, so the selected wall is UNDERSIZED.

Pipe-volume metric defaults (508 mm OD, 9.5 mm WT, 5000 m, 1000 kg/m3 water, 250 m3/hr, 500 ppm): ID is 489.0 mm, line fill is about 939.0 m3, volume per distance is about 187.8 m3/km, fill mass is about 939.0 t, fill time is about 3.76 h, and chemical dosage is about 469.5 L.

Gas-flow metric defaults (P1 7000 kPa abs, P2 5000 kPa abs, γg 0.60, 508 mm OD, 9.5 mm WT, 50 km, E 0.92): ID is 489.0 mm, pressure drop is 2,000 kPa, Weymouth is about 8,157 10³ m3/d, Panhandle A is about 10,638 10³ m3/d, and Panhandle B is about 10,293 10³ m3/d. Phase 1 hardcodes Tf = 288.15 K, Z = 0.88, Tb = 288.15 K, and Pb = 101.325 kPa. The same inputs converted to US Customary are about 288 / 375 / 362 MMSCFD.

B31G metric defaults (508 mm OD, 9.5 mm WT, 483 MPa SMYS, F 0.72, 2.5 mm depth, 150 mm axial length, 9930 kPa operating pressure): uncorroded MAOP is 13,007 kPa, d/t is 26.3%, P'_B31G is 13,007 kPa, P'_Mod is 13,007 kPa, Modified RSF is 100.0%, and the operating safety gate is SAFE AT OPERATING PRESSURE. Those safe pressures are capped at uncorroded MAOP. A 26% deep, 150 mm defect on this pipe does not derate below Barlow MAOP. Switching the same inputs to US Customary keeps the gate SAFE.

## Production build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Import `rickjudson-1959/pipeline-calculators` in the Vercel dashboard.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Output: Next.js default. No environment variables are required.
5. Assign a domain when you are ready. This repo does not ship Hostinger or ads config.

## Encoded hydrostatic gates

The hydrostatic calculator applies only these checks:

- High-point pressure at or above the selected-code factor times MOP / MAOP
- Low-point pressure at or below 100% SMYS using Barlow yield (`2 x SMYS x WT / OD`)

High-point factors: CSA Z662 and ASME B31.4 / 49 CFR 195 use 1.25. ASME B31.8 / 49 CFR 192 uses 1.10 (Class 1), 1.25 (Class 2), 1.40 (Class 3), and 1.50 (Class 4).

Metric head is 9.81 kPa per metre. US head is 0.433 PSI per foot. Metric bleach is 1 L per cubic metre.

## Encoded wall-thickness checks

The wall thickness calculator applies only these checks:

- Allowable hoop stress `S = F x SMYS`
- Pressure design thickness `t_p = (P x D) / (2 x S x E x T)`
- Minimum required wall `t_min = t_p + corrosion allowance`
- `MAOP = 2 x (t_nom - A) x S x E x T / D`
- COMPLIANT when `t_nom` is at or above `t_min` and MAOP is at or above design pressure, otherwise UNDERSIZED
- Slenderness `D/t_nom` and `D/t_min`, each flagged if greater than 140
- A comparison grid of the same inputs across every encoded location class

Design factors F: ASME B31.4 liquid and ASME B31.8 Class 1 Div 2 use 0.72. ASME B31.8 Class 1 Div 1 and CSA Z662 Class 1 use 0.80. ASME B31.8 Class 2 uses 0.60, Class 3 uses 0.50, and Class 4 uses 0.40.

Default E is 1.00 (Seamless / ERW). Default T is 1.00 at or below 121 °C / 250 °F. Metric SMYS is entered in MPa and converted to kPa. US SMYS is already in PSI. E and T do not convert. The grid is encoded design-factor checks only. Do not treat the hydrostatic or wall pages as a full CSA Z662, ASME, or 49 CFR review.

## Encoded pipe-volume checks

The volume calculator applies only these estimates:

- Inside diameter `ID = OD - 2 x WT`
- Metric fill volume `area = pi x (ID/1000)^2 / 4`, `vol = area x length`
- US fill volume `area = pi x (ID/12)^2 / 4`, cubic feet to barrels at 5.61458
- Volume per distance: m3/km or bbls/mi
- Fill mass: metric tonnes from `vol x density / 1000`, US pounds from cubic feet times density
- Fill / displacement time: volume divided by pumping rate, or 0 if rate is 0
- Chemical dosage: metric litres from `vol x (ppm / 1000)`, US gallons at 0.264172 gal/L

Unit toggle conversions: OD and WT by 25.4, length by 3.28084, density by 0.062428, pumping rate by 6.28981. Dosing stays in ppm. Fluid presets for water (SG 1.00), methanol (SG 0.79), and glycol (SG 1.11) only fill density. Volume and displacement results are estimates only.

## Encoded gas-flow checks

The gas flow calculator applies only these estimates:

- Inside diameter `ID = OD - 2 x WT`
- Pressure drop `ΔP = P1 - P2`
- Metric Weymouth, Panhandle A, and Panhandle B using Tb = 288.15 K, Pb = 101.325 kPa, Tf = 288.15 K, and Z = 0.88, then scaled from sm3/d to 10³ m3/d
- US Weymouth, Panhandle A, and Panhandle B using Tb = 520 R, Pb = 14.73 psia, Tf = 520 R, and Z = 0.88, reported in MMSCFD
- Results pause when length, gravity, or ID is not greater than 0, or when `P1² - P2²` is not greater than 0

Unit toggle conversions: pressure by 0.145038, OD and WT by 25.4, length by 1.60934 (km to miles). Gas gravity and line efficiency do not convert. Tf, Z, Pb, and Tb are hardcoded in Phase 1. Gas flow results are estimates only. Do not treat them as stamped design.

## Encoded B31G checks

The B31G calculator applies only these checks:

- Depth ratio `d/t`
- Uncorroded MAOP `2 x WT x SMYS x F / OD` (metric SMYS in MPa converted to kPa)
- Original B31G Folias `A = 0.893 L / sqrt(OD x WT)`. If A <= 4, `M = sqrt(1 + 0.6275 A^2 - 0.003375 A^4)`. If A > 4, `M = 0.032 A^2 + 3.29` and the strength term is `(1 - d/t)`
- Original safe pressure uses flow stress `1.1 x SMYS` and, for A <= 4, `(1 - 0.6667 d/t) / (1 - 0.6667 d/t / M)`, then `min(MAOP, P'_raw)`
- Modified B31G Folias `z = L^2 / (OD x WT)`. If z <= 50, `M = sqrt(1 + 0.6275 z - 0.003375 z^2)`. If z > 50, `M = 0.032 z + 3.29`
- Modified safe pressure uses metric flow stress `(SMYS + 68.95) MPa` or US flow stress `SMYS + 10,000 PSI`, times `(1 - 0.85 d/t) / (1 - 0.85 d/t / M)`, then `min(MAOP, P'_raw)`
- Modified RSF is `P'_Mod / MAOP`
- Operating gate: `REJECT (>80% DEPTH)` when `d/t > 0.80`. Otherwise `SAFE AT OPERATING PRESSURE` when operating pressure is at or below `P'_Mod`, or `DERATING REQUIRED`

Unit toggle conversions: OD, wall, defect depth, and defect length by 25.4, SMYS by 145.038, operating pressure by 0.145038. Design factor F does not convert. Results pause when OD or WT is not greater than 0, depth or length is negative, or a Folias denominator is not greater than 0. B31G results are an engineering aid only, not a stamped integrity assessment.
