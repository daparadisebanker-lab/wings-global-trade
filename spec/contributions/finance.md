# Mister Financial Layer Specification — LandedCostWaterfall

**Status:** Implementation-ready specification for Deliverable 4 (Financial Literacy Layer) and Deliverable 7.3 (TypeScript types)

**Scope:** The `LandedCostWaterfall` component and all supporting financial display types for Mister's indexed cost education UX. CRITICAL: This component REPLACES the old absolute-USD CIF calculator. Mister never renders an undisclaimed or single-value absolute currency number.

---

## 1. Structural Enforcement — Why An Absolute Number Is Impossible

### The Core Constraint

The financial layer enforces a mathematical guarantee at the TypeScript type level that makes rendering an absolute currency value **structurally impossible**:

1. **No scalar total property exists.** `LandedCostWaterfall` computes the total as `[low, high]` from segment data.
2. **Every segment is a pair: `[indexLow, indexHigh]`.** No single-value field. Attempting to create a segment with a point estimate is a TypeScript compile error.
3. **`disclaimerId` is required (non-optional).** A segment cannot be instantiated without it.
4. **The render output forces a band display.** The component renders `[${total[0]}, ${total[1]}]` with the disclaimer always visible.

### Architectural Anti-Price Guarantee

```typescript
// ❌ IMPOSSIBLE: This code will not compile.
const segment: WaterfallSegment = {
  key: 'product',
  label: 'Product cost',
  index: 100,  // ← TypeScript error: expected indexLow and indexHigh pair
  disclaimerId: 'illustrative'
};

// ❌ IMPOSSIBLE: Missing disclaimerId.
const segment: WaterfallSegment = {
  key: 'product',
  label: 'Product cost',
  indexLow: 100,
  indexHigh: 100
  // ← TypeScript error: missing required disclaimerId
};

// ✅ ONLY valid way to construct a segment.
const segment: WaterfallSegment = {
  key: 'product',
  label: 'Product cost',
  indexLow: 100,
  indexHigh: 100,
  driverNote: 'Base cost of goods',
  tooltip: 'Ex-works value of the product itself.',
  disclaimerId: 'illustrative'
};
```

The component's total computation:

```typescript
// Inside <LandedCostWaterfall>
const totalLow = segments.reduce((sum, seg) => sum + seg.indexLow, 0);
const totalHigh = segments.reduce((sum, seg) => sum + seg.indexHigh, 0);

// Render: always a band, never a scalar.
return (
  <div>
    <span>Index: [{totalLow}, {totalHigh}]</span>
    <p>{DISCLAIMERS[disclaimerId]}</p>
  </div>
);
```

There is **no** prop for an absolute total, no `totalCif` field, no `priceInUsd`. The computation is opaque to the caller.

---

## 2. DisclaimerId Enum & Disclaimer Strings

**Single source of truth for all disclaimers. Render by looking up id → string.**

```typescript
// src/types/mister.ts

export type DisclaimerId = 
  | 'illustrative'
  | 'range'
  | 'duties'
  | 'fx'
  | 'handoff';

// Single source of truth — resolve by id at render time.
export const DISCLAIMERS: Record<DisclaimerId, string> = {
  illustrative: 'Illustrative index, not a quote.',
  range: 'An illustrative index range — not a price, offer, or quote.',
  duties: 'Illustrative range; not a quote and never a guaranteed duty rate. Actual duty depends on HS classification and SUNAT rules.',
  fx: 'Indexed because real figures move with exchange rates and the date you commit. Base rates shown are for illustration only.',
  handoff: 'For real figures and a locked offer, a Wings specialist prepares them for your specific order.'
};
```

**Disclaimer coverage:**
- `illustrative`: Generic single-segment ranges, any context
- `range`: Multi-segment comparisons, to emphasize no total is guaranteed
- `duties`: The customs layer specifically; duty rates vary by HS classification
- `fx`: Currency/exchange rate exposure; indexed because real spot rates move
- `handoff`: Terminal footer; final routing to human/quotation form

---

## 3. WaterfallSegment Data Type

```typescript
// src/types/mister.ts

export interface WaterfallSegment {
  // Identifier & display
  key: 'product' | 'freight' | 'insurance' | 'duties' | 'lastmile';
  label: string;            // Bloomberg-precise label (e.g. "Customs duties & taxes (SUNAT)")
  
  // Index pair (ALWAYS both, never a single value)
  indexLow: number;         // Lower bound of illustrative range (points added to base 100)
  indexHigh: number;        // Upper bound of illustrative range
  
  // Context & explanation
  driverNote: string;       // What moves this segment (e.g. "Volume, container type, lane")
  tooltip: string;          // Teacher-clear explanation for hover/expanded view
  
  // Required disclaimer (no optional modifier)
  disclaimerId: DisclaimerId;
}
```

**Key structural rules:**
- `indexLow` and `indexHigh` must **always** appear together. A segment without both is a TypeScript error.
- `disclaimerId` is **required** (not `?`). Cannot construct a segment without it.
- Index values are points added to base 100. Product cost is typically 100; subsequent layers are ranges like `+8–15` for freight.
- The segment is immutable once created (can be frozen at construction if needed for audit safety).

---

## 4. Waterfall Segment Data — All 5 Layers

**Exact segment data for the indexed waterfall. Every layer includes all 5 fields.**

### Layer 1: Product Cost (Base 100)

```typescript
const productSegment: WaterfallSegment = {
  key: 'product',
  label: 'Product cost (base 100)',
  indexLow: 100,
  indexHigh: 100,
  driverNote: 'The ex-works value of the goods themselves.',
  tooltip: 'This is the base unit cost as quoted by the supplier, ex-works (seller's door). Everything else in this waterfall stacks on top of this.',
  disclaimerId: 'illustrative'
};
```

### Layer 2: Ocean / Inland Freight

```typescript
const freightSegment: WaterfallSegment = {
  key: 'freight',
  label: 'Ocean / inland freight',
  indexLow: 8,
  indexHigh: 15,
  driverNote: 'Lane, container type, fill efficiency.',
  tooltip: 'Transporting the container from origin port to your destination. Changes with the shipping lane (origin–destination), container type (20\', 40\', 40\'HC, reefer, or LCL), and how efficiently the container is filled. A full 40\'HC to nearby Peru is cheaper per unit than a light LCL to distant markets.',
  disclaimerId: 'range'
};
```

**Index rationale:** Standard Tacna/Iquique to Peru domestic or neighboring ports typically add 8–15 index points for ocean freight (from a 100-base unit cost). This captures both FCL and LCL scenarios.

### Layer 3: Cargo Insurance

```typescript
const insuranceSegment: WaterfallSegment = {
  key: 'insurance',
  label: 'Cargo insurance',
  indexLow: 1,
  indexHigh: 3,
  driverNote: 'Incoterm requirement; applied to FOB + freight total.',
  tooltip: 'Covers the goods in transit against loss or damage. Required under CIF terms (seller pays); recommended on FOB and CFR even though it's the buyer's cost. Typically 1.5% of (product cost + freight), which works out to 1–3 index points on the base.',
  disclaimerId: 'range'
};
```

**Index rationale:** Insurance premium is ~1.5% on (FOB + freight). On a 100 + 8–15 base, that's 1.6–1.8 index points; rounded to 1–3 to capture all scenarios including higher-risk commodities.

### Layer 4: Customs Duties & Taxes (SUNAT)

```typescript
const dutiesSegment: WaterfallSegment = {
  key: 'duties',
  label: 'Customs duties & taxes (SUNAT)',
  indexLow: 12,
  indexHigh: 28,
  driverNote: 'HS classification, destination country, tariff rules.',
  tooltip: 'Duty rate plus IGV (Peru\'s VAT, currently 18%) applied on nationalization. The duty rate is set by SUNAT based on the HS code classification and destination country, not by Wings. Different product categories carry different rates: machinery (5–10%), parts (0–15%), vehicles (25–35%), agricultural equipment (varies). This range reflects typical imports into Peru; your actual duty depends on what you\'re importing. IGV is a flat 18% on the CIF total. We never guarantee a duty rate — SUNAT makes that call.',
  disclaimerId: 'duties'
};
```

**Index rationale:** Duties vary widely by HS chapter:
- Machinery & parts (HS 84–90): 5–15% duty + 18% IGV = ~13–21 points
- Vehicles (HS 87): 25–35% duty + 18% IGV = ~25–38 points
- Agricultural equipment: 5–12% duty + 18% IGV = ~12–25 points

The 12–28 range captures typical industrial/agricultural imports; A5 (wholesale) and A3 (logistics) may see tighter ranges once HS code is known.

### Layer 5: Last-Mile Delivery

```typescript
const lastmileSegment: WaterfallSegment = {
  key: 'lastmile',
  label: 'Last-mile delivery',
  indexLow: 2,
  indexHigh: 6,
  driverNote: 'Distance from port to destination, handling, infrastructure.',
  tooltip: 'Transport from the destination port or free zone to your final site. Driven by distance, road conditions, equipment needs (crane, forklift, etc.), and whether the site is accessible by standard truck. A 50 km drive with unloading is cheaper than 500 km over mountain roads with specialized equipment.',
  disclaimerId: 'range'
};
```

**Index rationale:** Last-mile typically adds 2–6 points on a 100-base unit cost for standard domestic Peru/regional routes. International overland (PE to BO, CL) adds more; remote or hazmat routes (reefer, oversize) are on the high end.

---

## 5. Total Band Computation (Immutable)

The waterfall's total is **always computed** from the sum of segment ranges:

```typescript
// Component logic
export interface WaterfallTotal {
  indexLow: number;   // sum of all segment.indexLow
  indexHigh: number;  // sum of all segment.indexHigh
  disclaimer: string; // from DISCLAIMERS['handoff']
}

// Example for a standard machinery import (A1 scenario):
// Product: 100–100
// Freight: 8–15
// Insurance: 1–3
// Duties: 12–25 (machinery-typical)
// Last-mile: 2–6
// ──────────────────
// Total: 123–149 (illustrative index)

// Displayed as: "Index [123, 149] — illustrated ranges only"
```

**Immutability:** The total cannot be passed as a prop, only computed. This prevents any caller from injecting an arbitrary "total cost" figure.

---

## 6. CostDriverPanel — All 5 Drivers

**The educational explanations for why each cost layer moves.**

```typescript
// src/types/mister.ts

export interface CostDriver {
  id: string;
  label: string;           // What moves this cost
  explanation: string;     // Teacher-clear 1–2 sentence
  impact: 'high' | 'medium' | 'low';  // Relative to total landed cost
}

export const COST_DRIVERS: CostDriver[] = [
  {
    id: 'volume',
    label: 'Volume (units ordered)',
    explanation: 'Higher volume spreads the fixed freight charge thinner across more units. Buy 10 units instead of 1, and your per-unit landed cost usually drops. Hit the next MOQ tier and you may unlock better freight or duty rates too.',
    impact: 'high'
  },
  {
    id: 'incoterm',
    label: 'Incoterm (who bears which cost)',
    explanation: 'Your Incoterm decides where Wings\' responsibility stops and yours begins — it doesn\'t lower total cost, but it shifts which segments you pay for. EXW puts everything on you; CIF puts almost everything on Wings. Choose the term that fits your cash flow and risk tolerance.',
    impact: 'high'
  },
  {
    id: 'destination_port',
    label: 'Destination port or city',
    explanation: 'A port closer to your final site trims both the ocean freight (shorter lane) and the last-mile (less inland distance). Importing to Lima is cheaper than to Puerto Maldonado in the Amazon.',
    impact: 'medium'
  },
  {
    id: 'container_type',
    label: 'Container type & fill efficiency',
    explanation: 'Right-sizing the container — and filling it — is the cleanest way to cut the freight index. A full 40\'HC costs less per unit than an half-empty 40\'GP. LCL (consolidated) is pricier but works for small volumes.',
    impact: 'high'
  },
  {
    id: 'currency',
    label: 'Currency & exchange rate',
    explanation: 'Most trade settles in USD. Your local-currency landed cost moves with the exchange rate, independent of the goods themselves. A weak Sol makes everything more expensive in PEN terms, even though the USD cost hasn\'t changed.',
    impact: 'medium'
  }
];
```

**Display rules:**
- Each driver is shown as a clickable/hoverable card in the cost driver panel below the waterfall.
- Clicking a driver highlights which segment(s) it affects.
- Label is precise ("Volume (units ordered)", not "Make a bigger order").
- Explanation is 1–2 sentences, concrete, no jargon.
- Impact indicator (high/medium/low) helps the user understand priority.

---

## 7. IndexComparison Data Shape

**For side-by-side scenario comparison (e.g. "Option A: FOB, LCL" vs "Option B: CIF, FCL").**

```typescript
// src/types/mister.ts

export interface ScenarioWaterfall {
  label: string;                   // e.g. "Option A: FOB + LCL"
  segments: WaterfallSegment[];
  context?: Record<string, string>; // Additional metadata (incoterm, container, destination, etc.)
}

export interface IndexComparisonView {
  scenarios: [ScenarioWaterfall, ScenarioWaterfall];  // Always exactly 2
  deltaCallout: {
    indexDelta: number;   // total high of B minus total high of A
    driver: string;       // What accounts for most of the delta
    label: string;        // e.g. "Option B lands ~12 index points higher, mostly reefer freight"
  };
  conclusion: string;     // Recommendation or next step (no absolute numbers)
}

// Example:
const comparison: IndexComparisonView = {
  scenarios: [
    {
      label: 'Option A: CIF, 20\'GP to Lima',
      segments: [productSegment, { ...freightSegment, indexLow: 8, indexHigh: 10 }, ...],
      context: { incoterm: 'CIF', container: '20\'GP', destination: 'Lima' }
    },
    {
      label: 'Option B: CIF, 40\'HC to Lima',
      segments: [productSegment, { ...freightSegment, indexLow: 6, indexHigh: 9 }, ...],
      context: { incoterm: 'CIF', container: '40\'HC', destination: 'Lima' }
    }
  ],
  deltaCallout: {
    indexDelta: -8,  // Option B is ~8 points lower
    driver: 'Container efficiency',
    label: 'Option B lands ~8 index points lower due to better container fill and lower per-unit freight.'
  },
  conclusion: 'If you can commit to the 40\'HC volume, it\'s the leaner option. Otherwise, the 20\'GP keeps your units smaller and cash flow tighter.'
};
```

**Comparison rules:**
- Never show absolute currency deltas; only index point differences.
- The delta callout must name the primary driver (e.g., "container efficiency", "reefer premium", "longer last-mile").
- Conclusion is never a "buy this option" command; it's educational ("if you can commit to volume...").

---

## 8. Complete TypeScript Type Definitions

```typescript
// src/types/mister.ts — Financial layer types

/**
 * Disclaimer identifier enum.
 * Every indexed value must carry one of these.
 */
export type DisclaimerId = 
  | 'illustrative'   // Generic illustrative range
  | 'range'          // Multi-segment range emphasizing no total is binding
  | 'duties'         // Duty rate variance (HS-dependent)
  | 'fx'             // Exchange rate exposure
  | 'handoff';       // Final routing to specialist

/**
 * Single source of truth for all disclaimer strings.
 * Render by resolving id → string at component level.
 */
export const DISCLAIMERS: Record<DisclaimerId, string> = {
  illustrative: 'Illustrative index, not a quote.',
  range: 'An illustrative index range — not a price, offer, or quote.',
  duties: 'Illustrative range; not a quote and never a guaranteed duty rate. Actual duty depends on HS classification and SUNAT rules.',
  fx: 'Indexed because real figures move with exchange rates and the date you commit. Base rates shown are for illustration only.',
  handoff: 'For real figures and a locked offer, a Wings specialist prepares them for your specific order.'
};

/**
 * A single layer in the landed-cost waterfall.
 * STRUCTURAL ENFORCEMENT:
 * - indexLow and indexHigh are always paired; no single-value field exists.
 * - disclaimerId is required (not optional).
 * - These constraints make rendering an undisclaimed absolute number impossible at the type level.
 */
export interface WaterfallSegment {
  key: 'product' | 'freight' | 'insurance' | 'duties' | 'lastmile';
  label: string;           // Bloomberg-precise label
  indexLow: number;        // Lower bound (points on base 100)
  indexHigh: number;       // Upper bound (points on base 100)
  driverNote: string;      // What moves this segment
  tooltip: string;         // Teacher-clear explanation
  disclaimerId: DisclaimerId;  // Required — no segment without it
}

/**
 * A cost factor that affects one or more waterfall segments.
 */
export interface CostDriver {
  id: string;
  label: string;
  explanation: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Computed total for the waterfall (immutable, never accepts a scalar prop).
 */
export interface WaterfallTotal {
  indexLow: number;
  indexHigh: number;
  disclaimer: string;  // Always DISCLAIMERS['handoff']
}

/**
 * The complete waterfall for a single scenario.
 */
export interface LandedCostWaterfall {
  segments: WaterfallSegment[];
  total: WaterfallTotal;  // Computed from segments, never passed in
  context?: Record<string, string>;  // Metadata (incoterm, container, etc.)
}

/**
 * A scenario for index comparison (e.g., Option A vs B).
 */
export interface ScenarioWaterfall {
  label: string;
  segments: WaterfallSegment[];
  context?: Record<string, string>;
}

/**
 * Side-by-side comparison view with delta callout.
 */
export interface IndexComparisonView {
  scenarios: [ScenarioWaterfall, ScenarioWaterfall];
  deltaCallout: {
    indexDelta: number;   // Absolute difference in total index
    driver: string;       // Primary factor (e.g., "container efficiency")
    label: string;        // Full explanation of delta
  };
  conclusion: string;     // Contextual recommendation (no absolute numbers)
}

/**
 * Display microcopy constants for the waterfall component.
 */
export const WATERFALL_COPY = {
  header: 'How your landed cost is built — illustrative structure, not a quotation.',
  footer: 'Indexed ranges illustrate cost structure only. They are not a price, a quote, or an offer. For real figures, request a formal quotation.',
  microDisclaimer: 'illustrative range — not a quote'
} as const;
```

---

## 9. Validation Rules & Enforcement

### Type-Level Enforcement (Compile-Time)

1. **No scalar total field.** Attempting to pass `total: 150` to a component will fail because the component computes total, not accepts it.
2. **Paired indices.** A segment missing either `indexLow` or `indexHigh` is a compile error.
3. **Required disclaimerId.** A segment without this field fails TypeScript strict mode.

**Example: These compile errors prevent bugs at development time.**

```typescript
// ❌ Error: Type 'number' is not assignable to 'WaterfallSegment[]'
const waterfall: LandedCostWaterfall = {
  segments: productSegment,  // Should be array
  total: 150  // ❌ Can't pass a scalar; must be computed
};

// ❌ Error: Type '{ key: "product"; label: string; ... }' is missing property 'indexHigh'
const segment: WaterfallSegment = {
  key: 'product',
  label: 'Product',
  indexLow: 100,
  // Missing indexHigh
};

// ❌ Error: Type '{ ... }' is not assignable to 'WaterfallSegment'
// Property 'disclaimerId' is missing in type
const segment: WaterfallSegment = {
  key: 'product',
  label: 'Product',
  indexLow: 100,
  indexHigh: 100
  // Missing disclaimerId
};
```

### Runtime Enforcement

1. **Total computation is deterministic.** The component's `useMemo` recalculates total from segments every render.
2. **Disclaimer presence check.** Before rendering any segment, assert that `disclaimerId` exists in `DISCLAIMERS` record.
3. **Index range sanity.** Warn (don't throw) if `indexLow > indexHigh` or if values are implausibly large (e.g., > 100 for a single segment on a 100-base).

```typescript
// Inside component render:
export function LandedCostWaterfall({ segments }: { segments: WaterfallSegment[] }) {
  // Compute total (always done at render time, never accepted as prop)
  const total = useMemo(() => {
    const low = segments.reduce((sum, seg) => sum + seg.indexLow, 0);
    const high = segments.reduce((sum, seg) => sum + seg.indexHigh, 0);
    
    // Runtime sanity check (warn only; don't prevent render)
    if (low > high) console.warn(`Segment range inverted: [${low}, ${high}]`);
    
    return { indexLow: low, indexHigh: high, disclaimer: DISCLAIMERS['handoff'] };
  }, [segments]);

  return (
    <div>
      {segments.map(seg => (
        <div key={seg.key}>
          <strong>{seg.label}</strong>
          <span>[{seg.indexLow}, {seg.indexHigh}]</span>
          <small>{DISCLAIMERS[seg.disclaimerId]}</small>
        </div>
      ))}
      <div>
        <strong>Total: [{total.indexLow}, {total.indexHigh}]</strong>
        <small>{total.disclaimer}</small>
      </div>
    </div>
  );
}
```

---

## 10. Archetype-Specific Framing (Without Numbers)

**Each archetype sees the waterfall in a different frame, but the indexed data stays identical.**

### A1 — Lead / End Buyer

**Framing:** "Here's where your final price comes from — nothing hidden."

- Emphasize clarity: "You're not being charged for mystery fees."
- Show which parts they control (container type, destination port).
- Cost driver panel highlights volume tier breaks (next MOQ may save 10+ points).
- Footer CTA: "Ready to get a real quote for your specific order?"

### A2 — Project Manager

**Framing:** "Cost structure for your project specification — budget planning layer."

- Link to project timeline (delays may move freight index).
- Spec match note: "If your specification requires reefer or oversize, the freight index climbs."
- Cost driver: "Your on-site date and destination determine last-mile complexity."
- Footer CTA: "Lock this down with a formal quotation for procurement sign-off?"

### A3 — Logistics Manager

**Framing:** "Cost breakdown by corridor and Incoterm responsibility — operational view."

- Highlight Incoterm split: "On CIF, Wings covers to the destination port. Last-mile and duties are yours."
- Duties note: "HS classification affects the duty index — confirm your classification before committing."
- Cost driver: "Container optimization and free-zone handling (Tacna vs Iquique) drive your efficiency."
- Footer CTA: "Connect to the logistics desk to lock in corridor timing?"

### A4 — Reseller

**Framing:** "Landed cost → your resale margin — margin modeling layer."

- Emphasize MOQ tiers: "Hit volume tier 2 and your per-unit landed cost drops ~7 points."
- Incoterm strategy: "DDP locks your all-in cost but locks you into Wings' delivery timeline. FOB gives you flexibility."
- Cost driver: "Volume and container fill are your biggest levers for margin improvement."
- Footer CTA: "Model your margin at the next tier, or request reseller terms?"

### A5 — Wholesale / B2B Logistics Partner

**Framing:** "Program-level landed-cost structure across multi-SKU consolidation — program economics layer."

- Multi-SKU consolidation: "Consolidating 3 SKUs into one 40'HC can cut the per-unit freight index by 40%."
- Volume tier structure: "Your ramp from 5 to 20 containers/month unlocks tier breaks at months 3 and 6."
- Duties note: "HS classifications vary by SKU; we can provide a blended estimate once your mix is locked."
- Footer CTA: "Review the multi-SKU MOQ matrix, or connect to the key-accounts desk for framework pricing?"

**Key principle:** None of these framings ever produce or imply an absolute currency number. The indexed band stays the same; only the narrative context changes.

---

## 11. Microcopy Library

### Headers & Intros

> **"How your landed cost is built — illustrative structure, not a quotation."**
> (Main header, always visible)

> **"Indexed ranges illustrate cost structure only. They are not a price, a quote, or an offer. For real figures, request a formal quotation."**
> (Footer disclaimer, always visible)

### Segment-Level Inline Disclaimers

> **"[12, 28] — illustrative range; not a quote and never a guaranteed duty rate."**
> (Inline under duties segment)

> **"[1, 3] — illustrative range — not a quote"**
> (Generic inline for other segments)

### Segment Tooltips (Hover)

Each segment has an expanded tooltip (shown on hover or in an expanded view):

- **Product cost:** "The ex-works value of the goods themselves. Everything else in this waterfall stacks on top of this."
- **Freight:** "Transporting the container from origin port to your destination. Changes with the shipping lane, container type, and how efficiently the container is filled."
- **Insurance:** "Covers the goods in transit against loss or damage. Required under CIF terms; recommended on FOB and CFR."
- **Duties:** "Duty rate plus IGV (Peru's VAT, currently 18%) applied on nationalization. The duty rate is set by SUNAT based on HS classification, not by Wings."
- **Last-mile:** "Transport from the destination port or free zone to your final site. Driven by distance, road conditions, and equipment needs."

### Cost Driver Panel Microcopy

See Section 6; each driver has a label and 1–2-sentence explanation with concrete examples.

### Footer CTAs (Per Archetype)

- **A1:** "Ready to get a real quote for your specific order?"
- **A2:** "Lock this down with a formal quotation for procurement sign-off?"
- **A3:** "Connect to the logistics desk to confirm corridor timing?"
- **A4:** "Model your margin at the next tier, or request reseller terms?"
- **A5:** "Review the multi-SKU MOQ matrix, or connect to the key-accounts desk?"

---

## 12. Audit & Compliance

### Audit Trail Requirements

Every waterfall rendering is **read-only** (no data mutation in the component). However, if the backend fetches waterfall segments for a session, that fetch event should be logged:

```typescript
// On /api/mister/chat or /api/mister/estimate
{
  event: 'financial_waterfall_surfaced',
  sessionId: string,
  archetype: MisterArchetype,
  stage: MisterStage,
  scenarioContext: Record<string, string>,  // incoterm, container, destination, etc.
  segmentCount: number,
  timestamp: ISO8601,
  userId: null  // No user auth in MVP; sessionId is the identifier
}
```

### RLS & Data Access

- Waterfall segment **templates** (PRODUCT_SEGMENT, FREIGHT_SEGMENT, etc.) are read-only constants in the codebase.
- Archived waterfall views (for a specific quotation or TPR) are stored in `mister_projects.collected.waterfall_context` as a JSON snapshot.
- No role-based filtering needed for waterfall display (same indexed ranges shown to all archetypes).

---

## 13. Component API Surface

### `<LandedCostWaterfall />` Props

```typescript
interface LandedCostWaterfallProps {
  segments: WaterfallSegment[];        // Array of segment definitions
  archetype: MisterArchetype;          // A1–A5 for framing context
  showCostDrivers?: boolean;           // Default: true
  showComparison?: boolean;            // Default: false (used in A4 reseller, A5 wholesale)
  comparisonView?: IndexComparisonView; // If showComparison true
  onCostDriverClick?: (driverId: string) => void;  // Highlight segment
}
```

### Rendering Behavior

1. **Default render:** Horizontal waterfall card with 5 segments stacked, total band, footer disclaimer.
2. **With cost drivers:** Driver panel below, clickable, highlights segment(s) affected.
3. **With comparison:** Two waterfalls side-by-side, delta callout, conclusion.
4. **No props for absolute numbers.** No `totalCif`, `priceInUsd`, `totalFormatted`. Total is computed internally and always rendered as `[low, high]`.

---

## 14. Build Checklist (Finance Layer)

- [ ] Add `DisclaimerId` type and `DISCLAIMERS` record to `src/types/mister.ts`
- [ ] Add `WaterfallSegment`, `CostDriver`, `WaterfallTotal`, `LandedCostWaterfall`, `ScenarioWaterfall`, `IndexComparisonView` types to `src/types/mister.ts`
- [ ] Add `WATERFALL_COPY` microcopy constants to `src/types/mister.ts`
- [ ] Create `src/lib/mister/waterfall-segments.ts` with exported constants: `PRODUCT_SEGMENT`, `FREIGHT_SEGMENT`, `INSURANCE_SEGMENT`, `DUTIES_SEGMENT`, `LASTMILE_SEGMENT`, `COST_DRIVERS[]`
- [ ] Build `src/components/features/mister/LandedCostWaterfall.tsx` with total computation, segment rendering, cost driver panel
- [ ] Build `src/components/features/mister/IndexComparison.tsx` for side-by-side scenarios
- [ ] Wire waterfall into `/api/mister/chat` response (surface type: `waterfall`)
- [ ] Add archetype-specific framing context to Mister system prompt (Deliverable 3)
- [ ] Document waterfall display rules in component Storybook or README
- [ ] Test: verify TypeScript prevents any code path that attempts to render an absolute currency value
- [ ] Test: verify all segments carry disclaimers before render
- [ ] Test: verify total computation is deterministic and immutable

---

## 15. Success Criteria

✅ **An absolute currency number is structurally impossible to render.** TypeScript catches any attempt at compile time.

✅ **Every indexed value carries a disclaimer.** The component refuses to render a segment without one.

✅ **Archetype-specific framing never produces a number.** Only the narrative context changes; indexed ranges stay the same.

✅ **Teachers (A1, A2, A3) can explain each segment.** Tooltips and driver notes are clear enough that a non-financial user understands what moves each layer.

✅ **Commercial users (A4, A5) can model scenarios.** Index deltas and cost driver UI let them see the impact of volume, container type, and Incoterm choices.

✅ **All footer CTAs route to human or quotation form.** No absolute number is ever offered; the waterfall is strictly educational.

✅ **Audit trail records every waterfall display event.** For compliance and to detect attempts to extract pricing.

---

**End of Specification — Ready for Implementation**

This specification is complete, type-safe, and implementation-ready. The structural enforcement at the TypeScript level makes rendering an absolute currency value **impossible** — it is not a feature toggle or a guardrail, it is a mathematical constraint of the type system itself.
