# Pipeline Calculators

Pipe-Up field and office calculators for pipeline work in Canada and the United States. Live tools are a hydrostatic test calculator for fill volume and elevation pressure checks, and a wall thickness calculator for design-factor minimum wall and MAOP under CSA Z662 and ASME B31.4 / B31.8.

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

## Test and verify

Default metric math, a US Customary path, unit conversion, and extra code factors are checked against the encoded formulas:

```bash
npm test
npm run verify
```

`verify` prints hydrostatic defaults (metric CSA, converted US B31.4, metric Class 4) and wall-thickness defaults (metric B31.4, converted US B31.4, metric B31.8 Class 4).

Hydrostatic metric defaults (508 mm OD, 6.6 mm WT, 483 MPa SMYS, 5000 m, 9930 kPa MOP, 12413 kPa target, elevations 350 / 310 / 300 m): the CSA / 1.25 high-point gate does not meet and the low-point gate meets 100% SMYS. That is expected from the formulas, not a page error. Switching the same inputs to ASME B31.8 Class 1 (1.10) meets the high-point gate.

Wall-thickness metric defaults (508 mm OD, 483 MPa SMYS, 9930 kPa design pressure, 1.6 mm corrosion, 9.5 mm selected WT, ASME B31.4 F=0.72): t_min is 8.85 mm and MAOP is 10,816.2 kPa, so the thickness gate is COMPLIANT. Switching the same inputs to ASME B31.8 Class 4 (F=0.40) makes the selected wall UNDERSIZED.

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

- Minimum required wall `t_min` = Barlow pressure design thickness + corrosion allowance
- MAOP of the selected nominal wall after corrosion, using the same design factor
- COMPLIANT when MAOP is at or above design pressure, otherwise UNDERSIZED

Design factors F: ASME B31.4 liquid and ASME B31.8 Class 1 Div 2 use 0.72. ASME B31.8 Class 1 Div 1 and CSA Z662 Class 1 use 0.80. ASME B31.8 Class 2 uses 0.60, Class 3 uses 0.50, and Class 4 uses 0.40.

Metric SMYS is entered in MPa and converted to kPa. US SMYS is already in PSI. Joint factor E, temperature derating T, and a D/t grid are not applied. Do not treat either page as a full CSA Z662, ASME, or 49 CFR review.
