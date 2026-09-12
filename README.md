# Pipeline Calculators

Pipe-Up field and office calculators for pipeline work in Canada and the United States. The first live tool is a hydrostatic test calculator for fill volume and elevation pressure checks under CSA Z662 and ASME B31.4 / B31.8 (49 CFR).

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

Open [http://localhost:3000](http://localhost:3000). The hydrostatic calculator is at `/calculators/hydrostatic-test`.

## Test and verify

Default metric math, a US Customary path, unit conversion, and a non-1.25 code factor are checked against the encoded formulas:

```bash
npm test
npm run verify
```

`verify` prints ID, fill volume, bleach, yield pressure, high/low pressures, and the two gates for the default metric CSA case, a converted US B31.4 case, and metric Class 4.

With the shipped metric defaults (508 mm OD, 6.6 mm WT, 483 MPa SMYS, 5000 m, 9930 kPa MOP, 12413 kPa target, elevations 350 / 310 / 300 m) the CSA / 1.25 high-point gate does not meet and the low-point gate meets 100% SMYS. That is expected from the formulas, not a page error. Switching the same inputs to ASME B31.8 Class 1 (1.10) meets the high-point gate.

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

The calculator applies only these checks:

- High-point pressure at or above the selected-code factor times MOP / MAOP
- Low-point pressure at or below 100% SMYS using Barlow yield (`2 x SMYS x WT / OD`)

High-point factors: CSA Z662 and ASME B31.4 / 49 CFR 195 use 1.25. ASME B31.8 / 49 CFR 192 uses 1.10 (Class 1), 1.25 (Class 2), 1.40 (Class 3), and 1.50 (Class 4).

Metric head is 9.81 kPa per metre. US head is 0.433 PSI per foot. Metric bleach is 1 L per cubic metre. Do not treat the page as a full CSA Z662, ASME, or 49 CFR review.
