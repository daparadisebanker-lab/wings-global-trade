# @wings/trade-ui

The frozen skeleton organs (ecosystem §2). Brand-agnostic React components styled
**only** through tokens — Tier-1 `tokens/skeleton.css` + a lane's Tier-2 livery.
No raw hex, no raw px outside the primitive scale. **This package never imports
from `apps/*`** (enforced by the `no-app-imports` ESLint rule).

## Extracted organs (live)

| Export | Extracted from | Notes |
|--------|----------------|-------|
| `SpecSheet` | `apps/site` mister/surfaces/SpecSheet | scoped blueprint / printed spec page |

_(TrustFooter, MisterDock, RFQFlow land in the same M3 wave — see the migration
prompt. This table is updated as each is extracted.)_

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
