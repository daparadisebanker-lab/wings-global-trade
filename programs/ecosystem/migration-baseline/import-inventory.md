# Wave M0 · Import inventory for Wave M3 extraction targets

Captured 2026-07-06 on `chore/monorepo-migration` at tag `pre-monorepo`.
For each organ M3 will extract: the source file(s) and every current importer.

## 1 · SpecSheet → `@wings/trade-ui` SpecSheet

| Source | Importers |
|--------|-----------|
| `src/components/features/mister/surfaces/SpecSheet.tsx` | `src/components/features/mister/surfaces/SurfaceRenderer.tsx` (relative `./SpecSheet`) — sole importer |

## 2 · Site footer → `@wings/trade-ui` TrustFooter

| Source | Importers |
|--------|-----------|
| `src/components/features/navigation/Footer.tsx` | `src/app/layout.tsx` (`@/components/features/navigation/Footer`) — sole importer. Receives `categories` prop fetched in the root layout. |

## 3 · Mister launcher/window shell → `@wings/trade-ui` MisterDock

**Judgment call (logged in MIGRATION_DECISIONS.md):** the prompt names "the Mister
launcher/window shell". `MisterLauncher.tsx` and `MisterWindow.tsx` exist but have
**zero importers** (dead code from an earlier design pass). The live shell is:

| Source | Importers |
|--------|-----------|
| `src/components/features/mister/MisterSiteWidget.tsx` (composition root: Provider + FloatingButton + FullscreenOverlay) | `src/app/layout.tsx` — sole importer |
| `src/components/features/mister/MisterFloatingButton.tsx` | `MisterSiteWidget.tsx` |
| `src/components/features/mister/MisterFullscreenOverlay.tsx` | `MisterSiteWidget.tsx` |
| `src/components/features/mister/MisterLauncher.tsx` | **none** — unused |
| `src/components/features/mister/MisterWindow.tsx` | **none** — unused |

## 4 · Inquiry/quotation flow → `@wings/trade-ui` RFQFlow

| Source | Importers |
|--------|-----------|
| `src/components/features/catalog/InquiryForm.tsx` | `src/components/features/catalog/ProductDetail.tsx` — sole importer |
| `src/hooks/useInquiryForm.ts` | `InquiryForm.tsx` — sole importer |
| `src/components/features/quotation/QuotationForm.tsx` | `src/app/cotizar/page.tsx` — sole importer |
| `src/components/features/mister/surfaces/QuotationFormCTA.tsx` | `surfaces/SurfaceRenderer.tsx` (relative) — sole importer. Also consumes `useMister` from `MisterProvider` and `MisterLeadSubmitRequest` from `@/types/mister`. |

## 5 · Mister client surface → `packages/mister` (hooks, types, control-block schema ONLY)

Server routes, guardrails, system prompt stay in `apps/site` untouched.

| Source | Importers (client side) | Importers (server side — STAY in apps/site) |
|--------|--------------------------|---------------------------------------------|
| `src/types/mister.ts` | `hooks/useMisterStream.ts`, `hooks/useMisterChat.ts`, `hooks/useCifEstimate.ts`, `types/api.ts`, `MisterBrandHeader`, `MisterProgressPanel`, `MisterProvider`, `MisterQuickActions`, all `surfaces/*` (ContactCard, ComparisonView, IndexComparison, MoqTable, ProductCard, LandedCostWaterfall, DocumentLink, SurfaceRenderer, QuotationFormCTA) | `app/api/mister/route.ts`, `app/api/mister/session/route.ts`, `lib/claude.ts`, `lib/tpr.ts`, `lib/cif-calculator.ts`, `lib/mister/{buildContext,archetype,fallback-actions,stage,waterfall-segments,tools}.ts` |
| `src/hooks/useMisterStream.ts` | `MisterProvider.tsx` — sole importer |
| `src/hooks/useMister.ts` (re-export shim) | consumers import `useMister` mostly from `MisterProvider` directly (ContactCard, ProgressPanel, QuotationFormCTA, SessionBrief, MessageList, FullscreenOverlay, BrandHeader, Launcher, Header, Composer, FloatingButton) |

**Risk note:** `types/mister.ts` is imported by 10+ server files. Extracting it
wholesale would drag server surface into the package. M3 must either split
client-only types or (per the prompt's wrap-and-re-export rule) keep
`@/types/mister` as a re-export of the package types so server imports are
untouched.

## 6 · Organs named in specs that DO NOT exist (documented gaps, not to be invented)

- `ManifestTable` — no match in `src/`
- `LaneStamp` — no match in `src/`
- `FillMeter` — arrives with the shared-container program
