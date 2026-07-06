# @wings/trade-ui

The frozen skeleton organs (ecosystem §2). Brand-agnostic React components styled
**only** through tokens — Tier-1 `tokens/skeleton.css` + a lane's Tier-2 livery.
No raw hex, no raw px outside the primitive scale. **This package never imports
from `apps/*`** (enforced by the `no-app-imports` ESLint rule).

## Extracted organs (live)

| Export | Extracted from | Notes |
|--------|----------------|-------|
| `SpecSheet` | `apps/site` mister/surfaces/SpecSheet | scoped blueprint / printed spec page — fully token-driven (`var(--mister-*)`) |
| `TrustFooter` | `apps/site` navigation/Footer | lane-agnostic footer; Wings content injected as props; Server Component |

## Deferred within M3 (deliberate — see MIGRATION_DECISIONS D-09)

- **`RFQFlow`** (inquiry/quotation) — extractable like TrustFooter, but couples to
  the lead-submit endpoints + toast; queued as focused follow-up.
- **`MisterDock`** (launcher/window shell = `MisterSiteWidget`) and
  **`packages/mister`** (client surface) — the live shell pulls the entire Mister
  provider/streaming/context stack, adjacent to the guardrail/hold-back code paths
  that are a hard danger zone ("never touch"). Deep extraction is done as its own
  wave with the full Mister flow re-verified after; not rushed here.

## Token-purity note

`SpecSheet` renders from tokens alone. `TrustFooter` was moved **verbatim** (zero
visual change) and therefore still carries app-inherited styling: Tailwind color
utilities (`text-gold`, `bg-navy`) that resolve via the app's Tailwind theme (still
literal hex, not the livery vars) and one raw `#000C1F`. `pnpm swap-test` itemizes
this debt. Burning it down (point Tailwind theme at the livery CSS vars) is a
post-migration task — it would change computed values and is out of scope for a
zero-change migration.

## Documented gaps — organs the specs name that DO NOT exist yet

Per M3.2, these are **not invented** during the migration; they are listed here so
later programs build them:

- **`ManifestTable`** — the group lane index / commodity table hero. No implementation
  in the current app.
- **`LaneStamp`** — the per-lane stamp (`OPENING`/`ACTIVE`). No implementation yet.
- **`FillMeter`** — the container-fill visualizer. Arrives with the shared-container
  program (`programs/shared-container/`), not this migration.

## Consumption

The app declares `"@wings/trade-ui": "workspace:*"`, adds it to Next
`transpilePackages`, and extends its Tailwind `content` glob to
`../../packages/ui/src/**/*.{ts,tsx}` so utility classes used here are generated.
Shared low-level primitives (`useReducedMotion`, `surfaceCardVariants`) are
byte-identical copies of the app utilities — the package cannot reach into the app,
and the values must stay identical to preserve behavior.
