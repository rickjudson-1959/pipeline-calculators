# Pipeline Calculators

Pipe-Up field and office calculators for Canadian pipeline work. The first live tool is a hydrostatic test calculator for fill volume and elevation pressure checks in a CSA Z662 context.

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

Default-input math is checked against the encoded formulas:

```bash
npm test
npm run verify
```

`verify` prints ID, CUBES, barrels, bleach, yield pressure, high/low pressures, and the two gates.

With the shipped defaults (508 mm OD, 6.6 mm WT, 483 MPa SMYS, 5000 m, 9930 kPa MOP, 12413 kPa target, elevations 350 / 310 / 300 m) the high-point gate does not meet 1.25 x MOP and the low-point gate meets 100% SMYS. That is expected from the formulas, not a page error.

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

- High-point pressure at or above 1.25 x licensed MOP
- Low-point pressure at or below 100% SMYS using Barlow yield (`2 x SMYS x WT / OD`, SMYS converted from MPa to kPa)

Head is 9.81 kPa per metre between the test point and each elevation. Fill bleach is 1 L per cubic metre. Do not treat the page as a full CSA Z662 review.
