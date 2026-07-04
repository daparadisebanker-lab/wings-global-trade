# Wings Global Trade — Creative Intelligence Rebuild to 100/100
## Product Detail Page · Full Implementation Specification
**Status:** Ready for execution | **Baseline:** 27/100 | **Target:** 100/100
**Date authored:** 2026-06-19

---

## HOW TO USE THIS DOCUMENT

Each phase below is self-contained. To begin a phase, copy the activation prompt block verbatim and paste it into a Claude Code session. The prompt is written to be fully self-sufficient — Claude does not need prior context from this document.

Phases are ordered by dependency. Do not skip Phase 0. Phases 1–4 are independent of each other and can be parallelised. Phases 5–7 depend on Phase 0. Phase 8 is the final verification pass and should run last.

**Score targets per phase:**

| Phase | Work | Score Before | Score After |
|-------|------|:---:|:---:|
| 0 | Data infrastructure | 27 | 27 (foundation only) |
| 1 | Replace decorative components | 27 | 42 |
| 2 | SpecFingerprint intelligence | 42 | 56 |
| 3 | Logistics intelligence layer | 56 | 68 |
| 4 | Trade intelligence & FieldReport | 68 | 78 |
| 5 | Blueprint mode as data layer | 78 | 88 |
| 6 | Passport & authentication overhaul | 88 | 94 |
| 7 | Navigation & UX coherence | 94 | 100 |
| 8 | Verification pass | — | confirmed 100 |

---

---

# PHASE 0 — DATA INFRASTRUCTURE

## Goal
Create `src/lib/product-intelligence.ts` — a single utility module that exposes clean, typed helpers for all the data that the visual components need but currently cannot access. This file has no UI. It makes existing data assets (cif-calculator, duty-rates, spec-normalize) accessible to components without creating circular dependencies.

Also add the Supabase migration for `field_report_es`.

## Files Created
- `src/lib/product-intelligence.ts` (new)
- `supabase/migrations/20260620000001_add_field_report.sql` (new)

## Files Read Before Building
- `src/lib/cif-calculator.ts` (freight lookup data)
- `src/lib/duty-rates.ts` (HS chapters, duty rates)
- `src/lib/spec-normalize.ts` (RANGES, extractNum)

## Technical Specification

```typescript
// src/lib/product-intelligence.ts

// HS chapter by Wings category slug
export const HS_CHAPTER: Record<string, string> = {
  'maquinaria-agricola': '84',
  'camiones': '87',
  'buses': '87',
  'equipo-industrial': '84',
  'repuestos': '84',
}

// Named origin ports by source_market value
export const ORIGIN_PORTS: Record<string, { name: string; country: string }> = {
  'China':    { name: 'Yantian · Guangdong', country: 'CN' },
  'Japón':    { name: 'Yokohama', country: 'JP' },
  'Japan':    { name: 'Yokohama', country: 'JP' },
  'Tailandia':{ name: 'Laem Chabang', country: 'TH' },
  'Thailand': { name: 'Laem Chabang', country: 'TH' },
  'India':    { name: 'Nhava Sheva · Mumbai', country: 'IN' },
  'Dubai':    { name: 'Jebel Ali', country: 'AE' },
}

// Transit time estimates (days) by leg: origin → trans-Pacific → Peru port → ZOFRATACNA
export const TRANSIT_DAYS: Record<string, { originToPort: number; oceanTransit: number; portToZone: number }> = {
  'China':    { originToPort: 3, oceanTransit: 28, portToZone: 7 },
  'Japón':    { originToPort: 2, oceanTransit: 22, portToZone: 7 },
  'Japan':    { originToPort: 2, oceanTransit: 22, portToZone: 7 },
  'Tailandia':{ originToPort: 4, oceanTransit: 26, portToZone: 7 },
  'Thailand': { originToPort: 4, oceanTransit: 26, portToZone: 7 },
  'India':    { originToPort: 4, oceanTransit: 32, portToZone: 7 },
  'Dubai':    { originToPort: 3, oceanTransit: 35, portToZone: 7 },
}
const DEFAULT_TRANSIT = { originToPort: 3, oceanTransit: 30, portToZone: 7 }

// Container type from GVW / weight
export function inferContainerType(weightKg: number): '20ft FCL' | '40ft HQ FCL' {
  return weightKg > 8000 ? '40ft HQ FCL' : '20ft FCL'
}

// Freight cost range (min-max string) — uses FREIGHT_BASE from cif-calculator
export function freightRangeDisplay(sourceMarket: string): string {
  const BASE: Record<string, number> = {
    China: 3200, Tailandia: 3000, Thailand: 3000,
    'Japón': 3400, Japan: 3400, Dubai: 3600,
  }
  const base = BASE[sourceMarket] ?? 3300
  const low = base + 200         // +zone transfer per cif-calculator
  const high = Math.round(low * 1.22)
  return `USD ${low.toLocaleString('es-PE')}–${high.toLocaleString('es-PE')}`
}

// Duty rate display for a category slug + destination country
// Re-exports lookupDutyRate with category-to-HS mapping applied
export function categoryDutyRate(categorySlug: string, country = 'Perú'): { chapter: string; rate: number } {
  const chapter = HS_CHAPTER[categorySlug] ?? '84'
  // Use lookupDutyRate from duty-rates.ts
  return { chapter, rate: 0 } // actual impl imports lookupDutyRate
}

// Altitude HP correction — standard 3% per 300m above 2000m
export function altitudeHpCorrection(hp: number, altitudeM: number): number {
  if (altitudeM <= 2000) return hp
  const drops = Math.floor((altitudeM - 2000) / 300)
  return Math.round(hp * Math.pow(0.97, drops))
}

// Certification detection from specs object
export type Certification = 'CE' | 'Euro II' | 'Euro III' | 'Euro IV' | 'Euro V' | 'Euro VI' | 'Stage II' | 'Stage III' | 'Stage IV' | 'EPA Tier 4' | 'INDECOPI' | 'ISO 9001'
export function detectCertifications(specs: Record<string, unknown>): Certification[] {
  const text = JSON.stringify(specs).toLowerCase()
  const found: Certification[] = []
  if (/\bce\b/.test(text)) found.push('CE')
  if (/euro\s?vi/.test(text)) found.push('Euro VI')
  else if (/euro\s?v/.test(text)) found.push('Euro V')
  else if (/euro\s?iv/.test(text)) found.push('Euro IV')
  else if (/euro\s?iii/.test(text)) found.push('Euro III')
  else if (/euro\s?ii/.test(text)) found.push('Euro II')
  if (/stage\s?iv/.test(text)) found.push('Stage IV')
  else if (/stage\s?iii/.test(text)) found.push('Stage III')
  else if (/stage\s?ii/.test(text)) found.push('Stage II')
  if (/epa\s?tier\s?4/.test(text)) found.push('EPA Tier 4')
  if (/iso\s?9001/.test(text)) found.push('ISO 9001')
  return found
}

// Percentile in Wings catalog for a single normalized axis value (0–1)
// Returns e.g. "Top 23%" or "Bottom 15%"
export function catalogPercentile(normalized: number): string {
  const pct = Math.round(normalized * 100)
  if (pct >= 80) return `Top ${100 - pct}% catálogo`
  if (pct >= 50) return `Sobre la media`
  if (pct >= 20) return `Bajo la media`
  return `Rango base catálogo`
}

// Transit times helper
export function getTransitDays(sourceMarket: string) {
  return TRANSIT_DAYS[sourceMarket] ?? DEFAULT_TRANSIT
}
```

## SQL Migration
```sql
-- supabase/migrations/20260620000001_add_field_report.sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS field_report_es TEXT;
```

## Activation Prompt

```
You are Claude Code working on Wings Global Trade — a B2B import platform for Latin American machinery importers. Stack: Next.js 15, TypeScript, Tailwind, Supabase, pnpm.

TASK: Create two new files.

FILE 1 — src/lib/product-intelligence.ts

This is a pure utility module (no React, no side effects) exposing typed helpers for product page components. Build it exactly as specified:

1. HS_CHAPTER: Record<string, string> — maps category slugs to HS chapters:
   maquinaria-agricola→'84', camiones→'87', buses→'87', equipo-industrial→'84', repuestos→'84'

2. ORIGIN_PORTS: Record<string, {name: string; country: string}> — named port for each source_market:
   China→'Yantian · Guangdong/CN', Japan/Japón→'Yokohama/JP', Tailandia/Thailand→'Laem Chabang/TH', India→'Nhava Sheva · Mumbai/IN', Dubai→'Jebel Ali/AE'

3. TRANSIT_DAYS: Record<string, {originToPort:number; oceanTransit:number; portToZone:number}> — per source market:
   China: 3/28/7, Japan: 2/22/7, Thailand: 4/26/7, India: 4/32/7, Dubai: 3/35/7. Default 3/30/7.

4. inferContainerType(weightKg: number): '20ft FCL' | '40ft HQ FCL' — returns '40ft HQ FCL' if weightKg > 8000, else '20ft FCL'

5. freightRangeDisplay(sourceMarket: string): string — uses this base rate table {China:3200, Tailandia:3000, Thailand:3000, Japón:3400, Japan:3400, Dubai:3600, default:3300}. Add 200 for zone transfer. High = low * 1.22. Returns formatted string like "USD 3,400–4,148"

6. categoryDutyRate(categorySlug: string, country?: string): {chapter: string; rate: number} — import lookupDutyRate from '@/lib/duty-rates'. Map slug to chapter using HS_CHAPTER. Default country 'Perú'. Return {chapter, rate: lookupDutyRate(country, chapter + '00')}.

7. altitudeHpCorrection(hp: number, altitudeM: number): number — hp * 0.97^floor(max(0,altitudeM-2000)/300), rounded to integer

8. type Certification = 'CE'|'Euro II'|'Euro III'|'Euro IV'|'Euro V'|'Euro VI'|'Stage II'|'Stage III'|'Stage IV'|'EPA Tier 4'|'INDECOPI'|'ISO 9001'
   detectCertifications(specs: Record<string, unknown>): Certification[] — JSON.stringify(specs).toLowerCase() then regex test for each cert. Return array of found certs.

9. catalogPercentile(normalized: number): string — normalized is 0-1. Returns:
   ≥0.80 → `Top ${Math.round((1-normalized)*100)}% catálogo`
   ≥0.50 → 'Sobre la media'
   ≥0.20 → 'Bajo la media'
   else → 'Rango base catálogo'

10. getTransitDays(sourceMarket: string): {originToPort:number; oceanTransit:number; portToZone:number} — lookup from TRANSIT_DAYS, fallback to default

FILE 2 — supabase/migrations/20260620000001_add_field_report.sql
Content: ALTER TABLE products ADD COLUMN IF NOT EXISTS field_report_es TEXT;

SUCCESS CRITERIA:
- Both files created with no TypeScript errors
- product-intelligence.ts has zero React imports
- All 10 exports are present and typed correctly
- Run: npx tsc --noEmit — zero errors in new file
```

---

---

# PHASE 1 — REPLACE DECORATIVE COMPONENTS

## Goal
Replace the two lowest-scoring components (CellularAutomaton: 2/100, WaveformOverlay: 8/100) with functional information displays. These are full replacements — the old components are deleted from the filesystem, imports updated in ProductDetail.

## Score Impact
- CellularAutomaton: 2 → 62
- WaveformOverlay: 8 → 82
- Phase net: +35 composite points

## Files Modified
- `src/components/features/catalog/WaveformOverlay.tsx` — full rewrite as `EnginePowerBand`
- `src/components/features/catalog/CellularAutomaton.tsx` — full rewrite as `SpecPositionBand`
- `src/components/features/catalog/ProductDetail.tsx` — update comments (imports unchanged, component names unchanged — same file, same export names, different behaviour)

## Component 1A: EnginePowerBand (replaces WaveformOverlay)

**What the buyer reads from it:**
- Where peak torque occurs in the RPM range
- The usable operating band (RPM zone where torque stays ≥80% of peak)
- HP curve vs. torque curve overlaid
- Actual labeled values: peak torque (Nm), peak HP, RPM at peak torque

**Props (identical interface so ProductDetail import unchanged):**
```typescript
interface WaveformOverlayProps {
  hp?: number
  torque?: number
  rpm?: number          // peak RPM / redline
  className?: string
}
```

**Visual specification:**
- Height: 64px SVG strip (up from 48px to fit labels)
- ViewBox: 0 0 1000 64, preserveAspectRatio="none"
- Background: rgba(0,30,80,0.03) subtle fill
- X-axis spans the RPM range. If `rpm` prop present, range = [Math.round(rpm * 0.2), rpm]. Fallback range for tractors: [800, 3200], trucks: [600, 2800], default: [800, 3600].
- Two curves (if torque known) or one curve (HP only):
  - **Torque curve** (warm white, strokeWidth 1): peaks at ~60% of max RPM, falls off sharply after. Model as a skewed bell: torque(r) = torque_max * sin(π * ((r - r_min)/(r_max - r_min))^0.65)
  - **HP curve** (gold, strokeWidth 1.5): rises until ~85% of max RPM, then drops. Model as: hp(r) = hp_max * ((r - r_min)/(r_max - r_min))^0.4 * (1 - 0.3*((r - r_min)/(r_max - r_min))^3)
- **Operating band shading**: horizontal band between y=20% and y=80% of strip, gold fill at opacity 0.06 — represents the efficient operating zone
- **Peak torque RPM tick**: a vertical gold line at the RPM of peak torque, with a small label above: "Max par · 1,600 RPM" in DM Mono 7px
- **Axis label strip at bottom**: left label "RPM min" + right label "RPM max" + center label "BANDA OPERATIVA" — DM Mono 7px, navy/40
- **aria-label**: "Curva de potencia: [hp] HP, par máximo [torque] Nm a [peak_torque_rpm] RPM"
- Remove `aria-hidden="true"` — this component now carries real information

**Fallback (no torque data):** Single HP curve, no torque label, operating band still shows.

---

## Component 1B: SpecPositionBand (replaces CellularAutomaton)

**What the buyer reads from it:**
- Where this product sits within the Wings catalog for each of 6 spec axes
- At a glance: is this a high-payload, low-HP machine? Low-speed, high-GVW?

**Props (identical interface):**
```typescript
interface CellularAutomatonProps {
  gvw?: number
  hp?: number
  className?: string
}
```

**Additional data needed:** The component needs normalized spec values for all 6 axes. Since it receives only gvw and hp, it must also accept an optional `specs` prop. Update the call in ProductDetail to pass `specs={effectiveSpecs}`.

**Revised props:**
```typescript
interface SpecPositionBandProps {
  gvw?: number
  hp?: number
  specs?: Record<string, unknown>
  className?: string
}
```

**Visual specification:**
- Height: 32px (same as CellularAutomaton so layout unchanged)
- SVG with viewBox="0 0 1000 32", width="100%", height={32}
- 6 horizontal range bars, one per axis from SPEC_AXES: hp, payload, gvw, wheelbase, speed, weight
- Each bar:
  - Y position: bars are 3px tall, spaced at 4px intervals (centre lines at y=3, 7, 11, 15, 19, 23, 27)
  - Track line: full width (0 to 1000), stroke rgba(0,30,80,0.12), strokeWidth 1
  - Position dot: circle at x = normalized_value * 1000, y = bar_centre, r=2.5, fill gold
  - Left axis label: 3-char DM Mono abbreviation, fontSize 6, navy/40 — "HP·" "CRG" "GVW" "BAT" "VEL" "PES"
  - If normalized value is 0 (missing spec): dot not rendered, track line at 20% opacity
- No animation — static render on every paint
- `aria-label` = "Posición en catálogo: HP [n]%, Carga [n]%, GVW [n]%..."
- `aria-hidden` = false (this carries information)

**ProductDetail.tsx change:** At the `<CellularAutomaton>` call site, add `specs={effectiveSpecs}` prop.

---

## Activation Prompt

```
You are Claude Code working on Wings Global Trade — a B2B machinery import platform (Next.js 15, TypeScript, Tailwind, pnpm). You are executing Phase 1 of the Creative Intelligence Rebuild.

READ THESE FILES FIRST:
- src/components/features/catalog/WaveformOverlay.tsx
- src/components/features/catalog/CellularAutomaton.tsx
- src/components/features/catalog/ProductDetail.tsx
- src/lib/spec-normalize.ts (for SPEC_AXES, RANGES, normalizeSpecs, extractNum)

TASK A — Rewrite WaveformOverlay.tsx as EnginePowerBand.

Keep the same filename and export name (WaveformOverlay) so ProductDetail import is unchanged. Props interface stays identical: { hp?: number, torque?: number, rpm?: number, className?: string }.

The new component is a 64px SVG power curve strip. Spec:
- ViewBox: "0 0 1000 64", preserveAspectRatio="none", height={64}, width="100%"
- Brand colors: NAVY='#001E50', GOLD='#C4933F', WARM='#F8F6F0'
- Compute RPM range: if rpm prop given, use [Math.round(rpm * 0.2), rpm]. Else default [800, 3200].
- rpmMin, rpmMax as above. POINTS=120 sample points across the range.
- HP curve (gold, strokeWidth 1.5): for each sample point i, x_i = (i/POINTS)*1000, relative_r = i/POINTS, hp_y = 54 - (hp/400) * 40 * (relative_r^0.4) * (1 - 0.3*relative_r^3). Clamp y to [8, 56].
- Torque curve (warm white, strokeWidth 1, opacity 0.7): only if torque prop > 0. torque_y = 54 - (torque/2000) * 38 * Math.sin(Math.PI * relative_r^0.65). Clamp y to [10, 56].
- Find peak torque RPM: index where torque_y is minimum (highest on screen). That index's RPM = rpmMin + (index/POINTS)*(rpmMax-rpmMin).
- Operating band: rect x=0 y=20 width=1000 height=24, fill gold, fillOpacity=0.05.
- Peak torque vertical tick: if torque present, line at x=peak_x, y1=8, y2=56, stroke gold, strokeWidth=0.75, opacity=0.5.
- Peak torque label: text at x=peak_x, y=7, "Par max · " + Math.round(peakRpm) + " RPM", fontSize=7, DM Mono, gold, opacity=0.7, textAnchor="middle".
- Bottom labels: left text x=4 y=62 "RPM min" fontSize=6.5 navy/40; right text x=996 y=62 textAnchor="end" "RPM max" fontSize=6.5 navy/40; center text x=500 y=62 textAnchor="middle" "BANDA OPERATIVA" fontSize=6 gold opacity=0.5.
- aria-label: describe the curve with actual values. Remove aria-hidden (this component now carries information).
- Respect prefers-reduced-motion — if reduced motion, render static (no CSS animation on paths).
- useMemo for all path/point computations. No canvas — pure SVG.

TASK B — Rewrite CellularAutomaton.tsx as SpecPositionBand.

Keep same filename and export name (CellularAutomaton). Update the props interface to add an optional specs prop:
  interface CellularAutomatonProps { gvw?: number; hp?: number; specs?: Record<string, unknown>; className?: string }

The new component is a 32px SVG showing this product's catalog position on 6 axes. Spec:
- Import normalizeSpecs, SPEC_AXES from '@/lib/spec-normalize'.
- If specs prop provided, compute normalized = normalizeSpecs(specs). Else build a partial: {hp: hp ? (hp-18)/(400-18) : 0, gvw: gvw ? (gvw-800)/(35000-800) : 0, payload:0, wheelbase:0, speed:0, weight:0}.
- SVG viewBox="0 0 1000 32", height={32}, width="100%", aria-hidden=false.
- AXIS_LABELS: {hp:'HP', payload:'CRG', gvw:'GVW', wheelbase:'BAT', speed:'VEL', weight:'PES'}
- For each of the 6 SPEC_AXES at index i:
  - barY = 2.5 + i * 5 (centres at 2.5, 7.5, 12.5, 17.5, 22.5, 27.5)
  - Label: text at x=0 y=barY+1 fontSize=4.5 fontFamily="DM Mono" fill=navy fillOpacity=0.4 → show AXIS_LABELS[axis]
  - Track: line x1=32 y1=barY x2=1000 y2=barY, stroke navy, strokeOpacity=0.10, strokeWidth=0.75
  - Dot: if normalized[axis] > 0.001, circle cx=32+(normalized[axis]*968) cy=barY r=2 fill=gold
  - If normalized[axis] === 0 (missing), track strokeOpacity=0.05, no dot
- aria-label: list each axis name and its percentile. E.g. "HP: sobre la media, GVW: top 20% catálogo"
- No animation, no intervals, no requestAnimationFrame. Pure static SVG.

TASK C — ProductDetail.tsx:
Find the <CellularAutomaton> call. It currently receives gvw and hp props. Add specs={effectiveSpecs} to it.

SUCCESS CRITERIA:
- npx tsc --noEmit passes with zero new errors
- WaveformOverlay renders an SVG power curve — not sine waves
- CellularAutomaton renders 6 static range bars — not a Conway grid
- Both components have aria-label describing actual data values
- No canvas usage in either file
```

---

---

# PHASE 2 — SPECFINGERPRINT INTELLIGENCE UPGRADE

## Goal
The SpecFingerprint radar polygon already has the right architecture. This phase adds four additive layers on top of the existing component — no structural rewrite, only additions:
1. Vertex value tooltip on hover (the actual number + unit)
2. Ring labels ("33%" / "66%" / "MAX")
3. Percentile annotation per axis (uses catalogPercentile from Phase 0)
4. Comparison ghost polygon when `comparisonSpecs` prop is provided

## Score Impact
- SpecFingerprint: 42 → 90

## Files Modified
- `src/components/features/catalog/SpecFingerprint.tsx` — additive upgrades
- `src/components/features/catalog/ProductDetail.tsx` — pass comparison data
- `src/hooks/useComparison.ts` — read to understand data shape

## Technical Specification

### New props added to SpecFingerprint
```typescript
interface SpecFingerprintProps {
  specs: Record<string, unknown>
  seed?: string
  size?: number
  className?: string
  animate?: boolean
  showLabels?: boolean
  showValues?: boolean      // NEW — show raw value on vertex hover
  showPercentiles?: boolean // NEW — show "Top X%" text per axis
  comparisonSpecs?: Record<string, unknown> | null  // NEW — ghost polygon
}
```

### Vertex value tooltip
- State: `hoveredAxis: SpecAxis | null`
- On vertex `<circle>` mouseEnter: set hoveredAxis = axis
- On SVG mouseLeave: clear hoveredAxis
- When hoveredAxis === axis: render a `<g>` tooltip anchored to the vertex position
  - Background rect: fill warm white (#F8F6F0), rx=1, padding ~4px, shadow via filter drop-shadow
  - Two text lines: line 1 = AXIS_LABEL[axis] in DM Mono 6px navy/50; line 2 = raw value + unit in DM Mono 9px navy bold
  - Raw value: import `rawSpecValues` from spec-normalize.ts. Compute once in useMemo. Format with appropriate unit: hp→"HP", payload→"kg", gvw→"kg", wheelbase→"mm", speed→"km/h", weight→"kg"
  - Tooltip offset: 14px from vertex in the outward direction from center

### Ring labels
- Three rings at 0.33, 0.66, 1.0 already computed in gridRings
- At the rightmost ring intercept (axis 0, pointing up → axis that points right at ~30° offset):
  - Actually: place label at the top of the chart. At angle -π/2 (straight up), ring intercepts at (cx, cy - radius*frac)
  - For each ring fraction: text at x=cx+3, y=cy - radius*frac, fontSize=5.5, DM Mono, navy/25, "33%" / "66%" / "MAX"
  - Only rendered when `showLabels=true` (existing prop)

### Percentile annotations
- Only rendered when `showPercentiles=true`
- Import catalogPercentile from '@/lib/product-intelligence' (Phase 0)
- For each axis, below the axis label: text in DM Mono 5px, navy/40, italic
- Position: lr+16 from center on each axis ray

### Comparison ghost polygon
- If `comparisonSpecs` prop is not null/undefined:
  - Compute comparisonNormalized = normalizeSpecs(comparisonSpecs)
  - Build path using getSpecPath(comparisonNormalized, radius, cx, cy) — no deviation for comparison
  - Render before the main polygon (behind it):
    - fill: rgba(248,246,240,0.08) — very faint warm white
    - stroke: rgba(248,246,240,0.45) — warm white ghost line
    - strokeWidth: 1, strokeDasharray="3 4"
    - No animation
  - Purpose: visually compare two products on the same chart without needing to navigate

### ProductDetail.tsx change
- Import `useComparison` hook (already imported in ProductPassport)
- In ProductDetailInner: read comparison items. Pass first compared product's specs (other than current product) as `comparisonSpecs` prop to any SpecFingerprint usage.
- If SpecFingerprint is rendered inside ProductPassport — pass through. If standalone, wire directly.

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). You are executing Phase 2 of the Creative Intelligence Rebuild: SpecFingerprint Intelligence Upgrade.

READ THESE FILES FIRST:
- src/components/features/catalog/SpecFingerprint.tsx
- src/lib/spec-normalize.ts (rawSpecValues, normalizeSpecs, SPEC_AXES, getSpecPath)
- src/lib/product-intelligence.ts (catalogPercentile — created in Phase 0)
- src/hooks/useComparison.ts

TASK: Upgrade SpecFingerprint.tsx with four additive features. Do not restructure the existing component — add to it.

ADDITION 1 — Vertex hover tooltip (showValues prop)
- Add prop: showValues?: boolean (default false)
- Add state: const [hoveredAxis, setHoveredAxis] = useState<SpecAxis | null>(null)
- Import rawSpecValues from '@/lib/spec-normalize'. Compute rawVals = useMemo(() => rawSpecValues(specs), [specs])
- Unit map for display: {hp:'HP', payload:'kg', gvw:'kg', wheelbase:'mm', speed:'km/h', weight:'kg'}
- On each vertex <circle>: add onMouseEnter={() => showValues && setHoveredAxis(axis)} onMouseLeave={() => setHoveredAxis(null)}
- When hoveredAxis === axis AND rawVals[axis] !== null: render a <g> tooltip.
  - Compute vertex position: same angle formula as the circles. Use radius + 16 for outward offset.
  - Tooltip: <rect> filled #F8F6F0 opacity=0.95, x=vx-18 y=vy-14 width=36 height=18 rx=1
  - Line 1: <text> x=vx y=vy-6 fontSize=5.5 DM Mono navy/50 textAnchor="middle"> AXIS_LABEL[axis]
  - Line 2: <text> x=vx y=vy+5 fontSize=8 DM Mono navy fontWeight="500" textAnchor="middle"> rawVals[axis] + ' ' + unit
  - Render this g after the vertex circles group so it appears on top.

ADDITION 2 — Ring labels (extend existing showLabels logic)
- When showLabels=true, additionally render ring fraction labels.
- At angle -Math.PI/2 (straight up), each ring at fraction f intersects at (cx, cy - radius*f).
- Add <text> at x=cx+3, y=(cy - radius*f - 2), fontSize=5, DM Mono, fill=NAVY, fillOpacity=0.25, for fractions [0.33, 0.66, 1.0] with text ['33%', '66%', 'MAX'].

ADDITION 3 — Percentile annotations (showPercentiles prop)
- Add prop: showPercentiles?: boolean (default false)
- Import catalogPercentile from '@/lib/product-intelligence'.
- Import normalizeSpecs from '@/lib/spec-normalize'. Compute normalized in useMemo.
- When showPercentiles=true: for each axis at index i, compute angle as usual. At radius+22:
  - px = cx + Math.cos(angle) * (radius + 22)
  - py = cy + Math.sin(angle) * (radius + 22)
  - <text x=px y=py fontSize=5 DM Mono fill=NAVY fillOpacity=0.38 textAnchor="middle">
      {catalogPercentile(normalized[axis])}
    </text>

ADDITION 4 — Comparison ghost polygon (comparisonSpecs prop)
- Add prop: comparisonSpecs?: Record<string, unknown> | null
- In useMemo (or a separate useMemo): if comparisonSpecs provided, compute comparisonPath = getSpecPath(normalizeSpecs(comparisonSpecs), radius, cx, cy) — no deviation argument.
- Render this path BEFORE the main polygon (so it sits behind):
  <path d={comparisonPath} fill="rgba(248,246,240,0.06)" stroke="rgba(248,246,240,0.4)" strokeWidth={1} strokeDasharray="3 4" />
- Only render if comparisonSpecs is not null/undefined.

SUCCESS CRITERIA:
- npx tsc --noEmit zero errors
- Hovering a vertex when showValues=true shows actual spec value with unit
- Ring labels appear at 33%/66%/MAX when showLabels=true
- comparisonSpecs ghost polygon renders behind primary polygon with dashed warm-white stroke
- All new props default to false/undefined — existing usages of SpecFingerprint are unchanged
```

---

---

# PHASE 3 — LOGISTICS INTELLIGENCE LAYER

## Goal
Wire real logistics data into TradeRouteAnimation and ProvenanceRibbon. Both components currently animate without labeling their data. After this phase, a buyer can read: origin port name, transit time per leg, container type, estimated freight range.

## Score Impact
- ProvenanceRibbon: 35 → 80
- TradeRouteAnimation: 12 → 72

## Files Modified
- `src/components/features/catalog/ProvenanceRibbon.tsx` — add named ports, transit days, ZOFRATACNA status
- `src/components/features/catalog/TradeRouteAnimation.tsx` — add canvas text labels, container type, freight cost strip
- `src/components/features/catalog/ProductDetail.tsx` — pass sourceMarket and weight/category data to both

## ProvenanceRibbon Specification

New props:
```typescript
interface ProvenanceRibbonProps {
  sourceMarket: string
  destination?: string
  freeZone?: string
  weightKg?: number    // NEW — for container type inference
  categorySlug?: string // NEW — for freight range display
}
```

Changes to SVG content:
1. Node 1 label: Replace `Origen · ${sourceMarket}` with `${ORIGIN_PORTS[sourceMarket]?.name ?? sourceMarket}` using the lookup from product-intelligence.ts
2. Transit day labels between nodes: render small text centered between each pair of nodes, y=36 (below the manifest line at y=18):
   - Leg 1 (origin→port): `${transit.originToPort}d` in DM Mono 7px, warm white/50
   - Leg 2 (port→zone): `${transit.oceanTransit}d ·` in DM Mono 7px, warm white/60 — this is the ocean leg, slightly brighter
   - Leg 3 (zone→destination): `${transit.portToZone}d` in DM Mono 7px, warm white/40
   - Position each at x = midpoint between node x-coordinates
3. Container type badge: small rect below node 2 (ZOFRATACNA) showing inferContainerType(weightKg ?? 5000). DM Mono 6.5px, warm white text on navy stroke rect.
4. ZOFRATACNA node: add a small checkmark glyph (✓ or a 4px circle with gold fill) next to the node to indicate admissibility.
5. Total transit time annotation: rightmost, below destination node: text "~${total}d total" DM Mono 7px gold/70 where total = sum of three legs.

## TradeRouteAnimation Specification

New props:
```typescript
interface TradeRouteAnimationProps {
  weight?: number
  sourceMarket?: string    // NEW
  categorySlug?: string    // NEW — for freight range
  className?: string
}
```

Canvas additions (inside the drawRoute function):
1. **Node labels**: after drawing waypoints, render ctx.fillText() for each of the three waypoints:
   - ORIGIN: `ctx.fillText(originPortName, ORIGIN.x, ORIGIN.y - 8)` — DM Mono equivalent via canvas font. Use: `ctx.font = '9px monospace'`, `ctx.fillStyle = rgba(${WARM}, 0.55)`, textAlign = 'center'.
   - PACIFIC midpoint: no label (open water)
   - DEST: `ctx.fillText('ZOFRATACNA', DEST.x, DEST.y - 8)` same style but fillStyle warm white/70
2. **Container type label**: small rect in bottom-left of canvas (x=10, y=VH-14):
   - Background: `ctx.fillStyle = rgba(0,30,80,0.5)`, fillRect(8, VH-20, 70, 14, rounded)
   - Text: inferContainerType(weight ?? 3000) result — `ctx.fillStyle = rgba(${GOLD}, 0.9)`, font='7px monospace', fillText at (12, VH-9)
3. **Freight range strip**: bottom-right of canvas (x=VW-80, y=VH-14):
   - Text: freightRangeDisplay(sourceMarket ?? 'China') — `ctx.fillStyle = rgba(${WARM}, 0.5)`, font='7px monospace', textAlign='right', fillText at (VW-8, VH-9)
4. Import the helpers from product-intelligence.ts but only at module level — no dynamic imports. This file is already 'use client' and client-only.

ProductDetail.tsx changes:
- At `<ProvenanceRibbon>` call: add `weightKg={gvw ?? weight}` and `categorySlug={category}`
- At `<TradeRouteAnimation>` call: add `sourceMarket={product.source_markets?.[0] ?? 'China'}` and `categorySlug={category}`

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). Phase 3: Logistics Intelligence Layer.

READ FIRST:
- src/components/features/catalog/ProvenanceRibbon.tsx
- src/components/features/catalog/TradeRouteAnimation.tsx
- src/components/features/catalog/ProductDetail.tsx
- src/lib/product-intelligence.ts (ORIGIN_PORTS, TRANSIT_DAYS, getTransitDays, inferContainerType, freightRangeDisplay — from Phase 0)

TASK A — Upgrade ProvenanceRibbon.tsx

Add props: weightKg?: number, categorySlug?: string (both optional, existing props unchanged).

At the top of the component function:
  import { ORIGIN_PORTS, getTransitDays, inferContainerType } from '@/lib/product-intelligence'
  const portInfo = ORIGIN_PORTS[sourceMarket] ?? { name: sourceMarket, country: '' }
  const transit = getTransitDays(sourceMarket)
  const totalDays = transit.originToPort + transit.oceanTransit + transit.portToZone
  const containerType = inferContainerType(weightKg ?? 5000)

Update node labels array: node 1 label = `${portInfo.name}` (remove the "Origen · " prefix — it's redundant, the position communicates origin).

Add transit day text elements between each node pair:
- Between nodes[0] and nodes[1]: x = (nodes[0].x + nodes[1].x)/2, y=38, text="${transit.originToPort}d", fill=#F8F6F0, fillOpacity=0.45, fontSize=7, DM Mono, textAnchor="middle"
- Between nodes[1] and nodes[2]: x = (nodes[1].x + nodes[2].x)/2, y=38, text="${transit.oceanTransit}d", fill=#F8F6F0, fillOpacity=0.65, fontSize=7.5, DM Mono (ocean leg gets more weight — it's the dominant time), textAnchor="middle"
- Between nodes[2] and nodes[3]: x = (nodes[2].x + nodes[3].x)/2, y=38, text="${transit.portToZone}d", fill=#F8F6F0, fillOpacity=0.45, fontSize=7, DM Mono, textAnchor="middle"

Add container type badge near node 2 (ZOFRATACNA, x=510):
- <rect x=490 y=26 width=40 height=10 fill="none" stroke="#C4933F" strokeWidth=0.5 opacity=0.5 />
- <text x=510 y=34 textAnchor="middle" fill="#C4933F" fillOpacity=0.8 fontSize=6 fontFamily="DM Mono">{containerType}</text>

Add total days annotation:
- <text x=710 y=12 textAnchor="middle" fill="#C4933F" fillOpacity=0.7 fontSize=6.5 fontFamily="DM Mono">~{totalDays}d total</text>

Extend SVG viewBox height from 52 to 58 to accommodate the transit labels at y=38. Update height prop to 58.

TASK B — Upgrade TradeRouteAnimation.tsx

Add props: sourceMarket?: string, categorySlug?: string (keep existing weight and className).

At the top of the component function (before useEffect):
  Import at the top of the file: import { ORIGIN_PORTS, inferContainerType, freightRangeDisplay } from '@/lib/product-intelligence'

Inside the useEffect, after the existing drawRoute function definition, add canvas text rendering to drawRoute:
1. After drawing waypoint nodes, add:
   ctx.save()
   ctx.font = '8px monospace'
   ctx.textAlign = 'center'
   ctx.fillStyle = `rgba(${WARM}, 0.55)`
   const originName = ORIGIN_PORTS[sourceMarket ?? 'China']?.name?.split('·')[0]?.trim() ?? (sourceMarket ?? 'China')
   ctx.fillText(originName, ORIGIN.x, ORIGIN.y - 10)
   ctx.fillStyle = `rgba(${WARM}, 0.7)`
   ctx.fillText('ZOFRATACNA', DEST.x, DEST.y - 10)
   ctx.restore()

2. Bottom-left container type label:
   ctx.save()
   ctx.font = '7px monospace'
   ctx.textAlign = 'left'
   ctx.fillStyle = `rgba(${GOLD}, 0.8)`
   ctx.fillText(inferContainerType(weight ?? 3000), 8, VH - 6)
   ctx.restore()

3. Bottom-right freight range:
   ctx.save()
   ctx.font = '7px monospace'
   ctx.textAlign = 'right'
   ctx.fillStyle = `rgba(${WARM}, 0.45)`
   ctx.fillText(freightRangeDisplay(sourceMarket ?? 'China'), VW - 8, VH - 6)
   ctx.restore()

TASK C — ProductDetail.tsx
- At <ProvenanceRibbon> call: add weightKg={gvw ?? weight} categorySlug={category}
- At <TradeRouteAnimation> call: add sourceMarket={product.source_markets?.[0] ?? 'China'} categorySlug={category}

SUCCESS CRITERIA:
- npx tsc --noEmit zero errors
- ProvenanceRibbon shows port names, transit days per leg, container type badge, total days
- TradeRouteAnimation canvas labels show origin port name (abbreviated), ZOFRATACNA, container type, freight range
- Existing animation behavior unchanged
```

---

---

# PHASE 4 — TRADE INTELLIGENCE & FIELD REPORT

## Goal
TradeIntelligenceLine becomes a typed, timestamped, expandable intelligence card. FieldReport becomes product-specific, AI-generated, and annotated with operational tags. Both convert from static content to live intelligence.

## Score Impact
- TradeIntelligenceLine: 62 → 90
- FieldReport: 38 → 92

## Files Modified
- `src/components/features/catalog/TradeIntelligenceLine.tsx` — add type tag, timestamp, expand
- `src/components/features/catalog/FieldReport.tsx` — wire to new API, show product-specific content
- `src/app/api/products/[slug]/field-report/route.ts` — new API route
- `src/app/api/products/[slug]/intelligence/route.ts` — update prompt to embed type tag + period
- `src/hooks/useFieldReport.ts` — new hook (same pattern as useTradeIntelligence)

## TradeIntelligenceLine Specification

### Updated intelligence API (system prompt change)
In `/api/products/[slug]/intelligence/route.ts`, update INTELLIGENCE_SYSTEM_PROMPT to instruct Claude to prefix the output with a type tag:

```
Required format: "[TAG] Content here · Q[1-4] [YYYY]"
TAG must be exactly one of: TENDENCIA | DEMANDA | REGULACIÓN | RUTA | ZONA FRANCA
The tag goes at the very start, followed by a space, then the intelligence, then a period · then the quarter-year.
Max 140 characters including the tag and period.
Example: "DEMANDA Alta rotación mini camiones 4x4 ZOFRATACNA, licitaciones municipales. · Q4 2025"
```

Update the validation gate: text.length > 160 → reject. Also validate that text starts with one of the known tags.

### Updated component
Extract tag from text: const match = text.match(/^(TENDENCIA|DEMANDA|REGULACIÓN|RUTA|ZONA FRANCA)\s+(.+?)(?:\s·\s(Q\d\s\d{4}))?$/)

Display:
```
[TAG-CHIP] [INTELLIGENCE TEXT] [· PERIOD]
```
- Tag chip: inline-block, DM Mono 7px uppercase, gold/80, bordered (border: 1px solid rgba(196,147,63,0.35)), px=4 py=1, mr=6
- Intelligence text: existing style (DM Mono 11px navy/60)
- Period: DM Mono 9px navy/30 at end

**Expand on click:**
- State: `expanded: boolean`
- When expanded: slide down an expand card (AnimatePresence + motion.div, same pattern as InquiryForm)
- Expand card content: "Cargando análisis..." skeleton → fetches `/api/products/${slug}/intelligence?expanded=true`
- New API param `expanded=true`: Claude generates 3 bullet points instead of 1 line. Max 500 tokens. Format: bullet symbol "·" + space + content, newline separated.
- Render bullets as a list. Gold left border 2px. DM Mono 10px navy/70. Each bullet on its own line.
- Click anywhere outside to collapse.

## FieldReport Specification

### New API route: `/api/products/[slug]/field-report/route.ts`
Same pattern as intelligence route. System prompt:

```
Eres un técnico especialista en importación de maquinaria para mercados andinos (Perú, Bolivia, Chile). Tu tarea: escribir el INFORME DE CAMPO para un producto específico de maquinaria importada.

Formato OBLIGATORIO — responde con exactamente 3 líneas, cada una comenzando con una etiqueta entre corchetes:
[ALTITUD] nota sobre rendimiento en altitud usando el valor real de HP
[REGULACIÓN] norma específica aplicable (MTC, SUTRAN, INDECOPI, ZOFRATACNA) con número si es conocido
[COMPATIBILIDAD] nota sobre compatibilidad operativa, mantenimiento, o repuestos

Reglas:
- Usa los valores reales de las especificaciones (HP, GVW, peso, velocidad máx)
- Para altitud: HP_efectivo ≈ HP * 0.97^floor((altitud_msnm - 2000) / 300). Calcúlalo para 3.200 msnm (sierra peruana media).
- Sin signos de exclamación. Tono técnico-operativo de inspector.
- Cada línea máximo 140 caracteres.
- No inventes números de resolución. Si no la sabes exactamente, nombra el organismo sin el número.
```

User prompt: `Producto: ${product.name_es}. HP: ${hp}. GVW: ${gvw_kg} kg. Peso: ${weight} kg. Velocidad máx: ${speed} km/h. Categoría: ${categorySlug}. Origen: ${sourceMarket}.`

Cache to `products.field_report_es`. Return JSON: `{ report: string }` — the raw 3-line string.

### New hook: `src/hooks/useFieldReport.ts`
Same pattern as useTradeIntelligence but hits `/api/products/${slug}/field-report`.

### Updated FieldReport component
Props: add `productSlug?: string`, `productSpecs?: Record<string, unknown>`

If productSlug provided:
- Use useFieldReport(productSlug) hook
- While loading: show skeleton (2 lines, shimmer animation matching TradeIntelligenceLine skeleton pattern)
- On loaded: parse the 3-line report and render each with its tag styled:
  - Parse lines matching /^\[(.+?)\]\s+(.+)$/
  - Tag: inline DM Mono 8px uppercase, borderLeft 2px gold, pl=2, mr=6, color variants:
    - ALTITUD → gold
    - REGULACIÓN → navy
    - COMPATIBILIDAD → navy/60
  - Content: body font 13px, navy, leading-relaxed
- Fall back to existing category-level REPORTS if hook returns null

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). Phase 4: Trade Intelligence & FieldReport upgrade.

READ FIRST:
- src/components/features/catalog/TradeIntelligenceLine.tsx
- src/components/features/catalog/FieldReport.tsx
- src/app/api/products/[slug]/intelligence/route.ts
- src/hooks/useTradeIntelligence.ts (to copy the hook pattern)
- src/components/features/catalog/ProductDetail.tsx

TASK A — Update intelligence API system prompt
In src/app/api/products/[slug]/intelligence/route.ts:
1. Update INTELLIGENCE_SYSTEM_PROMPT. Add to the end of the rules:
   "FORMATO REQUERIDO: '[TAG] texto · Q[N] [YYYY]'. TAG debe ser exactamente uno de: TENDENCIA | DEMANDA | REGULACIÓN | RUTA | ZONA FRANCA. El trimestre es el trimestre real actual o más reciente relevante. Máximo 140 chars totales incluyendo tag y fecha."
2. Update the validation gate: reject if length > 160 OR if it does not match /^(TENDENCIA|DEMANDA|REGULACIÓN|RUTA|ZONA FRANCA)\s/.

TASK B — Upgrade TradeIntelligenceLine.tsx
1. Parse the intelligence text into parts:
   const match = resolvedText.match(/^(TENDENCIA|DEMANDA|REGULACIÓN|RUTA|ZONA FRANCA)\s+(.*?)(?:\s·\s(Q\d\s\d{4}))?$/)
   const tag = match?.[1] ?? null
   const body = match?.[2] ?? resolvedText
   const period = match?.[3] ?? null

2. Render the tag as a chip (only if tag !== null):
   <span style={{display:'inline-block', fontFamily:'DM Mono', fontSize:'7px', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(196,147,63,0.85)', border:'1px solid rgba(196,147,63,0.3)', padding:'1px 4px', marginRight:'6px', verticalAlign:'middle'}}>{tag}</span>

3. Render body in existing style, then period in DM Mono 9px navy/30 at end if present.

4. Add expand state (useState<boolean>) and an expand button (small "↓ ver análisis" DM Mono 9px gold link-style button, appearing after the period on the same line).
5. When expanded, show a motion.div (AnimatePresence pattern, height: 0→auto, 220ms ease) containing:
   - Loading state: two shimmer skeleton lines (copy skeleton from existing component)
   - Loaded state: paragraph of DM Mono 10px navy/70, borderLeft 2px gold, pl=3 py=2 mt=2
   - The expanded content is just the full resolvedText split into sentences (split on '. ') and each rendered as a separate line with a "·" bullet. This avoids a new API call for the expanded view — the full content was already fetched.

TASK C — Create src/hooks/useFieldReport.ts
Exact same pattern as useTradeIntelligence.ts but:
- URL: /api/products/${slug}/field-report
- State: { report: string | null, isLoading: boolean }
- Only fetches if slug is non-empty

TASK D — Create src/app/api/products/[slug]/field-report/route.ts
Copy the structure of the intelligence route exactly. Changes:
- Column read/written: 'field_report_es' instead of 'trade_intelligence'
- Model: 'claude-haiku-4-5'
- System prompt (exact string):
  "Eres un técnico especialista en importación de maquinaria para mercados andinos. Escribe el INFORME DE CAMPO con exactamente 3 líneas en este formato:\n[ALTITUD] nota de rendimiento en altitud con HP efectivo calculado para 3.200 msnm\n[REGULACIÓN] norma específica aplicable (MTC/SUTRAN/INDECOPI/ZOFRATACNA) sin inventar números\n[COMPATIBILIDAD] nota sobre mantenimiento u operación\nUsa los valores reales de las especificaciones. Tono técnico-operativo. Sin exclamaciones. Cada línea máx 140 chars."
- User prompt builder: "Producto: ${product.name_es}. Specs: ${JSON.stringify(Object.fromEntries(Object.entries(product.specs ?? {}).slice(0, 8)))}. Categoría: ${categorySlug}. Origen: ${product.source_markets?.[0] ?? 'China'}."
- Validation: response must contain "[ALTITUD]" AND "[REGULACIÓN]" AND "[COMPATIBILIDAD]". If not, return fallback.
- Return JSON: { report: string }

TASK E — Upgrade FieldReport.tsx
Add props: productSlug?: string, productSpecs?: Record<string, unknown>
Import useFieldReport from '@/hooks/useFieldReport'.
At top of component: const { report, isLoading } = useFieldReport(productSlug ?? '')

Render logic inside the AnimatePresence div:
- If productSlug && isLoading: show 3 shimmer skeleton lines (same class as TradeIntelligenceLine skeleton)
- If productSlug && report: parse the report string. Split by newline. For each line, match /^\[(.+?)\]\s+(.+)/. Render:
  <div className="py-1.5 flex items-start gap-2">
    <span DM Mono 7.5px uppercase tracking gold/75 border-l-2 border-gold pl-2 shrink-0 w-24>{tag}</span>
    <p body 13px navy/80 leading-snug>{content}</p>
  </div>
- Else: show existing static REPORTS[categorySlug] ?? FALLBACK text as before.

TASK F — ProductDetail.tsx
At <FieldReport> call: add productSlug={product.slug} productSpecs={effectiveSpecs as Record<string, unknown>}

SUCCESS CRITERIA:
- npx tsc --noEmit zero errors
- intelligence API system prompt now requires [TAG] format
- TradeIntelligenceLine renders tag chip + body + period from parsed text
- FieldReport fetches product-specific content from new API route
- useFieldReport hook exists and follows same pattern as useTradeIntelligence
- New API route handles cache hit, Claude generation, write-back, and fallback
- FieldReport renders 3 tagged lines when API data available
```

---

---

# PHASE 5 — BLUEPRINT MODE AS DATA LAYER

## Goal
Blueprint Mode currently toggles a visual theme. After this phase, activating Blueprint Mode reveals a complete technical instrument layer: full spec table, HS code, ZOFRATACNA duty rate, compliance table, dimensional data. The toggle becomes the most functionally differentiated feature on the page.

## Score Impact
- BlueprintModeToggle: 15 → 92

## Architecture
Blueprint mode already sets/removes `blueprint-mode` class on `<html>`. This phase adds a **data layer** that renders conditionally based on that class, mounted in ProductDetail, watching the class via MutationObserver.

New component: `src/components/features/catalog/BlueprintDataLayer.tsx`

This component:
1. Watches `document.documentElement.classList` for `blueprint-mode` via MutationObserver
2. When `blueprint-mode` is active: renders a fixed-position panel (or an inline panel in the right column) showing the full technical data layer
3. When inactive: renders nothing (null)

## Files Created/Modified
- `src/components/features/catalog/BlueprintDataLayer.tsx` (new)
- `src/components/features/catalog/ProductDetail.tsx` — mount BlueprintDataLayer in right column, pass product data
- `src/styles/blueprint.css` — add `.blueprint-mode` overrides for new data layer elements

## BlueprintDataLayer Specification

Props:
```typescript
interface BlueprintDataLayerProps {
  product: Product
  categorySlug: string
  effectiveSpecs: Record<string, unknown>
}
```

**Sections rendered when blueprint mode active:**

**Section 1 — Technical Identity**
DM Mono all-caps. Navy background (#001E50), warm-white text.
- "FICHA TÉCNICA COMPLETA" heading
- HS Chapter: "HS CAPÍTULO · [chapter]xx · [description]" e.g. "HS CAPÍTULO · 8701 · Tractores"
- ZOFRATACNA duty rate: "ARANCEL ZOFRATACNA · [rate]%" using categoryDutyRate from product-intelligence.ts
- Zone routing: "ZONA FRANCA → ZOFRATACNA / ZOFRI"
- Country of origin: from source_markets[0]
- All text DM Mono 9px. Labels 30% opacity, values 80% opacity.

**Section 2 — Full Specification Table**
All spec entries from effectiveSpecs without the priority-filter or expand-gate. Two columns. Alternating row tint. DM Mono 10px. Gold values for HP/GVW rows.

**Section 3 — Compliance Table**
detectCertifications(effectiveSpecs) from product-intelligence.ts.
A 2-column table: left = certification name, right = status indicator (green dot + "DETECTADO" or gray dot + "NO DECLARADO").
12 standard rows (the full Certification type list). Detected ones rendered full opacity, undetected at 30%.

**Section 4 — Dimensional Reference**
SpecFingerprint rendered at size=160 with showLabels=true, showValues=true, showPercentiles=true. Blueprint mode variant: white polygon on navy background (override CSS).

**Section 5 — Import Cost Reference**
Two data rows:
- "FLETE ESTIMADO · [freightRangeDisplay(sourceMarket)]"
- "CONTENEDOR · [inferContainerType(gvw ?? 5000)]"
- "ARANCEL CIF · [rate]% sobre valor CIF"
All DM Mono 9px. Read-only reference. Not a calculator — just the intelligence layer.

**Section 6 — Export Trigger**
A button "DESCARGAR FICHA TÉCNICA ↓" in DM Mono 9px gold, full-width, which triggers `window.print()` with a print-specific CSS rule that shows only the BlueprintDataLayer. This uses existing browser print API — no PDF generation needed for MVP.

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). Phase 5: Blueprint Mode as Data Layer.

READ FIRST:
- src/components/features/catalog/BlueprintModeToggle.tsx (how blueprint-mode class works)
- src/styles/blueprint.css (existing blueprint mode CSS)
- src/components/features/catalog/ProductDetail.tsx (where to mount the new component)
- src/lib/product-intelligence.ts (categoryDutyRate, detectCertifications, inferContainerType, freightRangeDisplay, HS_CHAPTER)
- src/lib/spec-normalize.ts (normalizeSpecs, SPEC_AXES, RANGES)
- src/components/features/catalog/SpecFingerprint.tsx (for props reference)

TASK A — Create src/components/features/catalog/BlueprintDataLayer.tsx

'use client' component. Props: { product: Product, categorySlug: string, effectiveSpecs: Record<string, unknown> }

1. State: const [active, setActive] = useState(false)
2. useEffect: create a MutationObserver on document.documentElement that watches classList. On each mutation, setActive(document.documentElement.classList.contains('blueprint-mode')). Also set initial value. Disconnect on cleanup.
3. If !active: return null.
4. If active: render a div with className="blueprint-data-layer" as an overlay/panel:

Layout: position fixed, top=0, right=0, bottom=0, width=min(420px, 40vw), z-index=50, overflow-y=auto, backgroundColor='#001E50', borderLeft='1px solid rgba(196,147,63,0.3)', padding='24px 20px'.

Inside:

HEADER:
- "FICHA TÉCNICA" in DM Mono 9px gold uppercase tracking-[0.2em]
- Below: product.name_es in DM Mono 11px warm-white
- Below: a horizontal gold line (h-px w-full bg-gold/30 my-3)

SECTION 1 — Import Identity (after the gold line):
- Title: "IDENTIDAD DE IMPORTACIÓN" DM Mono 7px gold/50 uppercase tracking-[0.2em] mb-2
- Compute: const hsInfo = categoryDutyRate(categorySlug, 'Perú')
- Rows using a DataRow component (label: DM Mono 8px warm-white/35 uppercase, value: DM Mono 9px warm-white/80):
  - "HS CAPÍTULO" → hsInfo.chapter + '00 (referencia)'
  - "ARANCEL PERÚ" → hsInfo.rate + '%'
  - "ZONA FRANCA" → 'ZOFRATACNA · ZOFRI'
  - "ORIGEN" → product.source_markets.join(' · ')

SECTION 2 — Full Spec Table:
- Title: "ESPECIFICACIONES COMPLETAS" same style as section title above
- Map ALL entries of effectiveSpecs:
  For each [key, val]: a row with key (DM Mono 8px warm-white/30) and val (DM Mono 9px warm-white/80).
  If /hp|potencia|cv/i.test(key): value in gold instead of warm-white.
  Horizontal separator 0.5px rgba(248,246,240,0.06) between rows.

SECTION 3 — Compliance:
- Title: "CUMPLIMIENTO Y CERTIFICACIONES"
- Import detectCertifications. Compute: const certs = detectCertifications(effectiveSpecs)
- ALL_CERTS: ['CE','Euro II','Euro III','Euro IV','Euro V','Euro VI','Stage II','Stage III','Stage IV','EPA Tier 4','INDECOPI','ISO 9001']
- For each cert in ALL_CERTS:
  - found = certs.includes(cert)
  - Row: dot (3px circle, fill gold if found, fill warm-white/20 if not), cert name DM Mono 8px (warm-white/80 if found, warm-white/20 if not), status text 7px (gold "DETECTADO" if found, warm-white/15 "—" if not)

SECTION 4 — Catalog Position (SpecFingerprint):
- Title: "POSICIÓN EN CATÁLOGO"
- Render <SpecFingerprint specs={effectiveSpecs} seed={product.slug} size={160} showLabels={true} showValues={true} showPercentiles={false} className="mx-auto" />
- Wrap in a div bg-[rgba(248,246,240,0.04)] rounded p-3

SECTION 5 — Logistics Reference:
- Title: "REFERENCIA LOGÍSTICA"
- Import inferContainerType, freightRangeDisplay from product-intelligence
- const sourceMarket = product.source_markets?.[0] ?? 'China'
- const gvwVal = typeof effectiveSpecs.gvw_kg === 'number' ? effectiveSpecs.gvw_kg : 5000
- Rows:
  - "CONTENEDOR" → inferContainerType(gvwVal)
  - "FLETE ESTIMADO" → freightRangeDisplay(sourceMarket)

SECTION 6 — Export button:
- <button onClick={() => window.print()} className="w-full mt-6 font-mono text-[9px] uppercase tracking-[0.18em] text-gold border border-gold/30 py-3 hover:border-gold/60 hover:text-gold/90 transition-colors">
    DESCARGAR FICHA TÉCNICA ↓
  </button>

TASK B — Add print CSS to src/styles/blueprint.css
At the end of the file:
@media print {
  body > *:not(.blueprint-data-layer) { display: none !important; }
  .blueprint-data-layer { position: static !important; width: 100% !important; border: none !important; }
}

TASK C — Mount in ProductDetail.tsx
Import BlueprintDataLayer. Inside the right column div (after all existing right-column children), add:
<BlueprintDataLayer product={product} categorySlug={category} effectiveSpecs={effectiveSpecs} />

SUCCESS CRITERIA:
- npx tsc --noEmit zero errors
- Toggling blueprint mode shows/hides the data layer panel
- Panel shows HS chapter, duty rate, full spec table, compliance grid, SpecFingerprint, logistics reference
- Print button triggers window.print() with panel-only output
- MutationObserver disconnects on component unmount
- No inline styles in the component — Tailwind classes only (with arbitrary values where needed)
```

---

---

# PHASE 6 — PASSPORT & AUTHENTICATION OVERHAUL

## Goal
ProductPassport gains HS code + duty rate display (the most-requested piece of import intelligence). AuthenticationMark encodes real certifications from specs. TechnicalSilhouette gains engineering dimension callouts from actual spec values.

## Score Impact
- ProductPassport (as a whole): +12 composite
- AuthenticationMark: 22 → 72
- TechnicalSilhouette: 40 → 80

## Files Modified
- `src/components/features/catalog/ProductPassport.tsx` — add HS + duty rate DataRow
- `src/components/features/catalog/AuthenticationMark.tsx` — replace geometry with certification ticks
- `src/components/features/catalog/TechnicalSilhouette.tsx` — add dimension callouts

## ProductPassport: HS Code + Duty Rate

In the `<dl>` section after the existing DataRows, add:
```
const { chapter, rate } = categoryDutyRate(categorySlug ?? 'maquinaria-agricola', 'Perú')
<DataRow label="HS capítulo" value={`${chapter}xx · ${rate}% ad valorem`} />
```
Import categoryDutyRate from '@/lib/product-intelligence'.

Also: if `detectCertifications(specs as Record<string, unknown>).length > 0`, add:
```
<DataRow label="Certificaciones" value={certs.slice(0, 2).join(' · ')} />
```

## AuthenticationMark: Certification Ticks

The 12 registration ticks remain. Each tick group (every 30°) now maps to one of the 12 standard certifications. Detected certs = illuminated (gold, full opacity). Undetected = faint (gold, 0.15 opacity).

New logic:
```typescript
const ALL_CERTS = ['CE','Euro II','Euro III','Euro IV','Euro V','Euro VI',
  'Stage II','Stage III','Stage IV','EPA Tier 4','INDECOPI','ISO 9001'] as const
const detectedCerts = detectCertifications(specs as Record<string, unknown>)
// ticks[i] corresponds to ALL_CERTS[i]
// opacity: detectedCerts.includes(ALL_CERTS[i]) ? 0.85 : 0.15
```

Remove the `hp` and `payload` geometry (rotation and inner radius) — these were aesthetic and now the mark carries real data. Replace inner hexagon with: the count of detected certifications as a number in the center of the seal, DM Mono 11px gold. Beneath it: "CERTS" in DM Mono 5px gold/50.

Add tooltip (title attribute on SVG): list all detected certifications separated by " · ". If none detected: "Sin certificaciones declaradas."

## TechnicalSilhouette: Dimension Callouts

New prop: `specs?: Record<string, unknown>` — pass from ProductPassport.

For each category, define which dimension to show and from which spec key:
- Tractor: wheelbase from `batalla/wheelbase`. Arrow across the bottom between front and rear wheel axles.
- Truck: overall length estimate (wheelbase * 1.4). Arrow along the full chassis.
- Bus: overall length (wheelbase * 1.35). Arrow.
- Forklift: lift height from `capacidad_de_levante` or payload. Arrow from ground to top of mast.

Dimension callout rendering:
```
// Leader line: thin horizontal arrow between two points
// Arrow heads: 4px perpendicular ticks at each end
// Value label: centered between endpoints, DM Mono 7px, warm-white/70
// Unit: smaller text suffix
// Example: "2,430 mm" for wheelbase
```
If spec value not available: render the arrow without a value (empty label slot shown as "— mm").

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). Phase 6: Passport & Authentication Overhaul.

READ FIRST:
- src/components/features/catalog/ProductPassport.tsx
- src/components/features/catalog/AuthenticationMark.tsx
- src/components/features/catalog/TechnicalSilhouette.tsx
- src/lib/product-intelligence.ts (categoryDutyRate, detectCertifications)

TASK A — ProductPassport.tsx
1. Import categoryDutyRate and detectCertifications from '@/lib/product-intelligence'.
2. Inside the component function, compute:
   const { chapter, rate } = categoryDutyRate(categorySlug ?? 'maquinaria-agricola', 'Perú')
   const certs = detectCertifications(specs as Record<string, unknown>)
3. Add DataRow after the existing spec rows: label="HS Capítulo", value={chapter + 'xx · ' + rate + '% ad valorem'}
4. If certs.length > 0, add DataRow: label="Certificaciones", value={certs.slice(0, 3).join(' · ')}
5. Pass specs to TechnicalSilhouette: change the existing <TechnicalSilhouette> call to add specs={specs as Record<string, unknown>}

TASK B — AuthenticationMark.tsx
Redesign for certification encoding. Props stay the same but add: specs?: Record<string, unknown>

1. Import detectCertifications from '@/lib/product-intelligence'.
2. const ALL_CERTS = ['CE','Euro II','Euro III','Euro IV','Euro V','Euro VI','Stage II','Stage III','Stage IV','EPA Tier 4','INDECOPI','ISO 9001']
3. const detectedCerts = specs ? detectCertifications(specs) : []
4. For ticks (12 total, one every 30°): tick i corresponds to ALL_CERTS[i].
   tickOpacity(i) = detectedCerts.includes(ALL_CERTS[i]) ? 0.85 : 0.15
   tickColor(i) = detectedCerts.includes(ALL_CERTS[i]) ? '#C4933F' : '#C4933F' (same color, different opacity)
   Update the ticks rendering to use per-tick opacity.
5. Remove the hexagonPoints rendering (inner hexagon was spec-derived geometry, now replaced).
6. In center of seal: render detected cert count.
   <text x="40" y="43" textAnchor="middle" fill="#C4933F" fontFamily="DM Mono" fontSize="14" fontWeight="500">{detectedCerts.length}</text>
   <text x="40" y="52" textAnchor="middle" fill="#C4933F" fillOpacity="0.5" fontFamily="DM Mono" fontSize="5" letterSpacing="0.2em">CERTS</text>
7. Add title element: <title>{detectedCerts.length > 0 ? detectedCerts.join(' · ') : 'Sin certificaciones declaradas'}</title>

TASK C — TechnicalSilhouette.tsx
Add prop: specs?: Record<string, unknown>

1. Import extractNum from '@/lib/spec-normalize'.
2. Inside component, compute dimension value:
   const wheelbase = specs ? extractNum(specs, 'batalla', 'wheelbase', 'distancia entre ejes') : null
   const liftHeight = specs ? extractNum(specs, 'capacidad de levante', 'altura de levante', 'lift height') : null

3. After the silhouette div (but still inside the navy container), render a dimension callout SVG overlaid via absolute positioning:
   Position: absolute, bottom=18px (above the baseline rule), left='5%', right='5%', height='16px'.
   
   For tractor/truck/bus (uses wheelbase):
   - displayVal = wheelbase ? wheelbase.toLocaleString('es-PE') + ' mm' : '— mm'
   - label = 'BATALLA'
   - SVG: horizontal line from left (x=0) to right (x=100%), y=8. Arrow ticks: vertical lines 0→16 at x=0% and x=100%. Center text: displayVal in DM Mono 7px warm-white/65 textAnchor="middle".
   - Below value: label text in DM Mono 5px warm-white/35 textAnchor="middle".
   
   For forklift (uses liftHeight):
   - displayVal = liftHeight ? liftHeight.toLocaleString('es-PE') + ' mm' : '— mm'
   - label = 'ALTURA LEVANTE'
   - Same SVG pattern.

4. The dimension callout SVG gets position:absolute, bottom=0, left='5%', right='5%', height=16.
   The container div should be position:relative (it already is via style object — confirm).

SUCCESS CRITERIA:
- npx tsc --noEmit zero errors
- ProductPassport shows HS chapter + duty rate DataRow
- AuthenticationMark ticks vary in opacity by whether cert is detected; center shows count
- TechnicalSilhouette shows dimension callout with value from specs (or "— mm" if absent)
- AuthenticationMark title attribute lists detected certifications
```

---

---

# PHASE 7 — NAVIGATION & UX COHERENCE

## Goal
ImportReadinessMeter becomes a labeled procurement map. JumpNavigation shows section data density. NoiseField is reduced to ambient (near-invisible) and gets an operational envelope badge layered above it. Visual hierarchy is established: primary data (large, persistent), secondary data (labeled on interaction), ambient signal (small, never labeled).

## Score Impact
- ImportReadinessMeter: 48 → 88
- NoiseField: 3 → 22 (ambient reclassified — not trying to be data)
- JumpNavigation: +8 composite
- Overall visual hierarchy coherence: +6

## Files Modified
- `src/components/features/catalog/ImportReadinessMeter.tsx`
- `src/components/features/catalog/NoiseField.tsx` (opacity reduction + new wrapper pattern)
- `src/components/features/catalog/JumpNavigation.tsx`
- `src/components/features/catalog/ProductDetail.tsx` (pass spec counts, variant count)
- New: `src/components/features/catalog/OperationalEnvelopeBadge.tsx`

## ImportReadinessMeter Specification

Step labels (below each segment):
```
const STEP_LABELS = ['PRODUCTO', 'EXPLORADO', 'VARIANTE', 'CONSULTA', 'ENVIADO'] as const
```

Action prompts per step (shown at the current incomplete step):
```
const STEP_ACTIONS: Record<number, string> = {
  1: '→ Revisa variantes',
  2: '→ Selecciona un modelo',
  3: '→ Abre el formulario',
  4: '→ Envía tu consulta',
  5: '',
}
```

Layout change:
- Below the existing 5 segments bar: add a label strip
- Each label: DM Mono 7px uppercase tracking-[0.08em]
- Active (current step) or completed: navy/70
- Future steps: navy/18
- Current incomplete step has small right-arrow prefix in gold
- Width matches the corresponding segment (flex-1)

Below the label strip, at the right edge:
- If step < 5 and STEP_ACTIONS[step] non-empty: small DM Mono 9px text in gold, textAlign right, animation: gentle opacity 0→1 on step change.

Step 5 completion: the full meter gets a subtle gold glow (boxShadow on the container: 0 0 0 1px rgba(196,147,63,0.2)) with a 400ms ease-in transition.

## OperationalEnvelopeBadge

Small overlay component for the ProductGallery area. Props: `categorySlug: string, specs?: Record<string, unknown>`.

Category envelope data:
```typescript
const ENVELOPE: Record<string, { altitude: string; climate: string; terrain: string }> = {
  'maquinaria-agricola': { altitude: 'Hasta 4.200 msnm', climate: 'Seco · Frío · Andino', terrain: 'Ladera · Valle · Llano' },
  'camiones':            { altitude: 'Hasta 4.500 msnm', climate: 'Costa · Sierra · Selva', terrain: 'Vía nacional · Urbano' },
  'buses':               { altitude: 'Hasta 4.200 msnm', climate: 'Costa · Sierra', terrain: 'Interprovincial · Urbano' },
  'equipo-industrial':   { altitude: 'Hasta 4.000 msnm', climate: 'Indoor · Exterior', terrain: 'Zona franca · Almacén' },
}
```

Visual: small badge in bottom-left of gallery image. Three lines in DM Mono 7px. Dark background (navy 85% opacity). Gold "ENVOLVENTE OPERATIVA" label above.

NoiseField: update opacity in personality() to 0.015–0.025 (from 0.04–0.08). This makes it nearly invisible — texture rather than presence. No other changes.

## JumpNavigation with Data Density

New props from ProductDetail:
```typescript
interface JumpNavigationProps {
  sections?: NavSection[]
  variantCount?: number
  specCount?: number
}
```

Labels updated with count badges:
```typescript
const sectionLabels: Record<string, (props: {variantCount?: number; specCount?: number}) => string> = {
  'variantes':        ({variantCount}) => variantCount ? `Variantes (${variantCount})` : 'Variantes',
  'especificaciones': ({specCount})    => specCount    ? `Specs (${specCount})`         : 'Especificaciones',
  'usos':             ()               => 'Usos',
  'consultar':        ()               => 'Consultar',
}
```

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). Phase 7: Navigation & UX Coherence.

READ FIRST:
- src/components/features/catalog/ImportReadinessMeter.tsx
- src/components/features/catalog/JumpNavigation.tsx
- src/components/features/catalog/NoiseField.tsx
- src/components/features/catalog/ProductDetail.tsx

TASK A — ImportReadinessMeter.tsx

1. Add STEP_LABELS constant above the component:
   const STEP_LABELS = ['PRODUCTO','EXPLORADO','VARIANTE','CONSULTA','ENVIADO']
   const STEP_ACTIONS: Record<number, string> = { 1:'→ Revisa variantes', 2:'→ Selecciona un modelo', 3:'→ Abre el formulario', 4:'→ Envía tu consulta', 5:'' }

2. Below the existing progress bar div, add a label strip div:
   <div className="flex gap-[2px] w-full max-w-[200px] mt-1">
     {STEP_LABELS.map((label, i) => {
       const segN = i + 1
       const isActive = segN === displayedStep
       const isPast = segN < displayedStep
       return (
         <div key={i} className="flex-1 text-center" style={{minWidth:0}}>
           <span style={{
             display:'block', fontFamily:'DM Mono', fontSize:'6px', textTransform:'uppercase',
             letterSpacing:'0.06em', color: (isActive || isPast) ? 'rgba(0,30,80,0.65)' : 'rgba(0,30,80,0.18)',
             whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
           }}>{label}</span>
         </div>
       )
     })}
   </div>

3. Below the label strip, if step < 5 and STEP_ACTIONS[displayedStep]:
   <p style={{fontFamily:'DM Mono', fontSize:'9px', color:'#C4933F', textAlign:'right', width:'100%', maxWidth:'200px', marginTop:'4px', opacity: displayedStep > 0 ? 1 : 0, transition:'opacity 300ms ease'}}>
     {STEP_ACTIONS[displayedStep]}
   </p>

4. When displayedStep === 5: wrap the entire meter container in a div with boxShadow transition:
   style={{boxShadow: displayedStep === 5 ? '0 0 0 1px rgba(196,147,63,0.22)' : 'none', transition:'box-shadow 400ms ease', padding:'8px', margin:'-8px'}}

TASK B — NoiseField.tsx
In the personality() function, change:
  opacity: 0.04 + t * 0.04  →  opacity: 0.015 + t * 0.015
This halves the visual weight, making the field ambient texture rather than atmospheric presence.

TASK C — Create src/components/features/catalog/OperationalEnvelopeBadge.tsx
'use client' component. Props: { categorySlug: string; className?: string }

const ENVELOPE: Record<string,{altitude:string;climate:string;terrain:string}> = {
  'maquinaria-agricola':{altitude:'Hasta 4.200 msnm',climate:'Andino · Seco · Frío',terrain:'Ladera · Valle · Llano'},
  'camiones':{altitude:'Hasta 4.500 msnm',climate:'Costa · Sierra · Selva',terrain:'Vía nacional · Urbano'},
  'buses':{altitude:'Hasta 4.200 msnm',climate:'Costa · Sierra',terrain:'Interprovincial · Urbano'},
  'equipo-industrial':{altitude:'Hasta 4.000 msnm',climate:'Indoor · Exterior',terrain:'Zona franca · Almacén'},
}
const env = ENVELOPE[categorySlug]
if (!env) return null

Render: a div with position absolute (caller positions it), background rgba(0,30,80,0.82), padding '5px 8px', borderLeft '1.5px solid rgba(196,147,63,0.5)'.
Header: "ENVOLVENTE" DM Mono 6px gold uppercase tracking-[0.15em] mb-1
Three rows: "ALT" + env.altitude, "CLIMA" + env.climate, "TERRENO" + env.terrain
Each: label DM Mono 6px warm-white/35 w-12 inline-block + value DM Mono 7px warm-white/80

Export this component and mount it in ProductGallery — ask the user or check ProductGallery.tsx for the gallery's structure. Position it: bottom-left of the gallery image, z-10, rounded-none.

TASK D — JumpNavigation.tsx
1. Add props: variantCount?: number, specCount?: number
2. Build a labeler:
   function labelFor(id: string, vc?: number, sc?: number): string {
     if (id === 'variantes' && vc) return `Variantes (${vc})`
     if (id === 'especificaciones' && sc) return `Specs (${sc})`
     const section = sections.find(s => s.id === id)
     return section?.label ?? id
   }
3. In the button render, replace `{label}` with `{labelFor(id, variantCount, specCount)}`

TASK E — ProductDetail.tsx
- At <JumpNavigation>: add variantCount={product.variants?.length ?? 0} specCount={Object.keys(effectiveSpecs).length}
- Mount <OperationalEnvelopeBadge categorySlug={category} /> — find where ProductGallery is called and read ProductGallery.tsx to determine if it accepts children or a badge prop. If not, wrap the gallery in a relative-positioned div and add the badge as an absolutely-positioned sibling.

SUCCESS CRITERIA:
- npx tsc --noEmit zero errors
- ImportReadinessMeter shows step labels below segments, action prompt updates with each step
- JumpNavigation shows "(4)" and "(18)" style counts after Variantes and Specs section labels
- NoiseField opacity reduced by half (values 0.015–0.030)
- OperationalEnvelopeBadge renders in ProductGallery area for all 4 categories
```

---

---

# PHASE 8 — VERIFICATION PASS

## Goal
Score each component against its target. Fix any gaps. Run accessibility audit. Run type check. Confirm the composite score reaches 100/100.

## Activation Prompt

```
You are Claude Code working on Wings Global Trade (Next.js 15, TypeScript, Tailwind, pnpm). Phase 8: Verification Pass — score audit and gap fix.

TASK: Run through each component below. For each, read the current file and confirm whether it meets its target description. If it does not, make the smallest possible fix to reach it. Then run npx tsc --noEmit at the end.

COMPONENT CHECKLIST:

1. WaveformOverlay.tsx — target: SVG power curve with labeled peak torque RPM, operating band, two curves.
   VERIFY: Is there an SVG (not canvas)? Is there a peak torque label text element? Is aria-label present with real values (not aria-hidden)?

2. CellularAutomaton.tsx — target: 6 horizontal range bars showing catalog position per axis.
   VERIFY: Are there 6 SVG line elements (tracks) and 6 circle elements (position dots)? Is aria-hidden=false?

3. SpecFingerprint.tsx — target: vertex tooltips on hover (showValues), ring labels when showLabels, comparison ghost polygon.
   VERIFY: Is there a hoveredAxis state? Is comparisonSpecs prop in the interface? Does it render a second path when comparisonSpecs is provided?

4. ProvenanceRibbon.tsx — target: named origin port, transit day labels between nodes, container type, total transit days.
   VERIFY: Are there transit day text elements between node pairs? Is the origin node label using the port name lookup?

5. TradeRouteAnimation.tsx — target: canvas text labels for origin + ZOFRATACNA, container type bottom-left, freight range bottom-right.
   VERIFY: Is ctx.fillText called for origin and ZOFRATACNA labels? Is inferContainerType called? Is freightRangeDisplay called?

6. TradeIntelligenceLine.tsx — target: type tag chip, period text, expand button.
   VERIFY: Is there a regex parse for the [TAG] format? Is there a tag chip rendered? Is there an expand state and expand button?

7. FieldReport.tsx — target: useFieldReport hook, 3 tagged lines rendered, product-specific.
   VERIFY: Is useFieldReport imported and called? Is there conditional rendering for hook data vs static fallback?

8. BlueprintDataLayer.tsx — target: MutationObserver watches blueprint-mode class, panel shows HS code + duty rate + full specs + compliance + SpecFingerprint + logistics + export button.
   VERIFY: Is there a MutationObserver setup in useEffect? Are all 6 sections rendered? Is window.print() wired to the export button?

9. ProductPassport.tsx — target: HS chapter DataRow, duty rate DataRow, certifications DataRow.
   VERIFY: Is categoryDutyRate called? Is a DataRow with label "HS Capítulo" present?

10. AuthenticationMark.tsx — target: per-tick opacity based on detected certifications, count in center, title attribute.
    VERIFY: Is detectCertifications called? Does each tick have a per-tick opacity? Is there a center count text?

11. TechnicalSilhouette.tsx — target: dimension callout with wheelbase/lift height value from specs.
    VERIFY: Is extractNum called? Is there a dimension callout SVG inside the container?

12. ImportReadinessMeter.tsx — target: STEP_LABELS below segments, action prompt text.
    VERIFY: Is STEP_LABELS rendered as text below each segment? Is STEP_ACTIONS[displayedStep] rendered?

13. JumpNavigation.tsx — target: variantCount and specCount passed through to labels.
    VERIFY: Does the label for 'variantes' show the count when variantCount > 0?

14. NoiseField.tsx — target: opacity halved (0.015–0.030 range).
    VERIFY: In personality(), does opacity range from 0.015 to 0.030?

After all checks: run npx tsc --noEmit. Fix all errors. Report final component scores.

FINAL SCORE REPORT FORMAT:
List each component with: current implementation summary (1 line) + score /100 + any gap noted.
```

---

---

# APPENDIX A — COMPONENT SCORE TARGETS SUMMARY

| Component | Phase | Baseline | Target | Key Transformation |
|---|---|:---:|:---:|---|
| WaveformOverlay | 1 | 8 | 82 | Sine waves → torque/power curve with RPM labels |
| CellularAutomaton | 1 | 2 | 62 | Conway grid → 6-axis catalog position band |
| SpecFingerprint | 2 | 42 | 90 | Vertex values + comparison overlay + percentiles |
| ProvenanceRibbon | 3 | 35 | 80 | Named ports + transit days + container type |
| TradeRouteAnimation | 3 | 12 | 72 | Canvas labels + freight cost + container type |
| TradeIntelligenceLine | 4 | 62 | 90 | Type tag + timestamp + expand card |
| FieldReport | 4 | 38 | 92 | Product-specific AI via new API route |
| BlueprintModeToggle | 5 | 15 | 92 | Reveals full technical instrument panel |
| ProductPassport | 6 | — | +12 | HS code + duty rate + certifications |
| AuthenticationMark | 6 | 22 | 72 | Real certification ticks from specs |
| TechnicalSilhouette | 6 | 40 | 80 | Engineering dimension callouts |
| ImportReadinessMeter | 7 | 48 | 88 | Labeled procurement map + action prompts |
| NoiseField | 7 | 3 | 22 | Ambient texture at correct opacity weight |
| JumpNavigation | 7 | — | +8 | Data density counts per section |

---

# APPENDIX B — DEPENDENCY MAP

```
Phase 0  ──────────────────────────────────────────────┐
         (product-intelligence.ts, DB migration)        │
                                                         │
Phase 1  ─── independent ─────────────────────────────  │
Phase 2  ─── independent ─────────────────────────────  │
Phase 3  ─── needs Phase 0 ────────────────────────── ◄─┘
Phase 4  ─── needs Phase 0 ─────────────────────────────
Phase 5  ─── needs Phase 0 + Phase 2 (SpecFingerprint) ─
Phase 6  ─── needs Phase 0 ─────────────────────────────
Phase 7  ─── needs Phase 1 (NoiseField done) ───────────
Phase 8  ─── needs all phases complete ─────────────────
```

**Parallel execution plan:**
- Run Phase 0 first (30 min).
- Then run Phases 1, 2, 3, 4, 6 in parallel (different files, no conflicts).
- Run Phase 5 after Phase 0 + Phase 2 are both done.
- Run Phase 7 after Phase 1 is done.
- Run Phase 8 last.

---

# APPENDIX C — NEW FILES CREATED IN FULL REBUILD

```
src/lib/product-intelligence.ts
src/components/features/catalog/BlueprintDataLayer.tsx
src/components/features/catalog/OperationalEnvelopeBadge.tsx
src/hooks/useFieldReport.ts
src/app/api/products/[slug]/field-report/route.ts
supabase/migrations/20260620000001_add_field_report.sql
```

**Modified files (significant changes):**
```
src/components/features/catalog/WaveformOverlay.tsx       (full rewrite)
src/components/features/catalog/CellularAutomaton.tsx     (full rewrite)
src/components/features/catalog/SpecFingerprint.tsx       (4 additions)
src/components/features/catalog/ProvenanceRibbon.tsx      (data additions)
src/components/features/catalog/TradeRouteAnimation.tsx   (canvas labels)
src/components/features/catalog/TradeIntelligenceLine.tsx (tag + expand)
src/components/features/catalog/FieldReport.tsx           (API-backed)
src/components/features/catalog/ProductPassport.tsx       (HS + duty row)
src/components/features/catalog/AuthenticationMark.tsx    (cert ticks)
src/components/features/catalog/TechnicalSilhouette.tsx   (dimensions)
src/components/features/catalog/ImportReadinessMeter.tsx  (labels)
src/components/features/catalog/JumpNavigation.tsx        (counts)
src/components/features/catalog/NoiseField.tsx            (opacity)
src/components/features/catalog/ProductDetail.tsx         (prop wiring)
src/app/api/products/[slug]/intelligence/route.ts         (prompt update)
src/styles/blueprint.css                                  (print CSS)
```

---
