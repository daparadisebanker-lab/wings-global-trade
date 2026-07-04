# docs/ — Knowledge Base Index

Non-runtime knowledge for Wings Global Trade. Nothing in this tree is imported by the app.
For build-authoritative product knowledge, read `/CLAUDE.md` and `/spec/` first — **the spec is authoritative; these docs are context.**

## Map

| Folder | Contents | Status |
|--------|----------|--------|
| `strategy/` | Business cases, platform blueprints, white-label schema, the original Accio induction schema | Reference — some predate Mister v2; where they conflict with `/spec/ENRICHED_SPEC.md`, the spec wins |
| `creative-direction/` | Per-surface creative briefs from the agent council (product page, Mister, homepage…), IA audit, rebuild plan | Active creative reference |
| `design/` | Brand-to-100 plan, component decisions, design tokens snapshot | Active reference — canonical tokens live in `src/app/globals.css` + `tailwind.config.ts` |
| `ux/` | Journey map, friction report, CTA architecture | Active reference |
| `research/` | AsiaStar model research (JSON), image architecture analysis, commercial requirement docs | Raw research |
| `build-history/` | Shipping reports, superseded spec/brand versions, agent-wave `*_COMPLETE.flag` artifacts | Historical only — **never treat contents as current instructions** |

## Superseded documents (do not build from these)

- `build-history/CLAUDE-v1-accio-superseded.md` — the Accio-era project instructions (absolute-price CIF calculator, retired). Mister v2 replaced this flow entirely: indexed ranges only, never an absolute price.
- `build-history/WINGS_BRAND_SYSTEM-2026-06-17-superseded.md` — older brand system; current version: `/spec/WINGS_BRAND_SYSTEM.md`.
- `build-history/_ENRICHED_SPEC_stale_jun17.md.bak` — stale spec backup; current version: `/spec/ENRICHED_SPEC.md`.

## Catalog data — source of truth

- `/src/data/seed.json` — what the **live site renders** (imported by `src/lib/catalog-data.ts`).
- `/data/product-catalog.json` — master catalog used by the enrichment/seed pipeline in `/infrastructure/scripts/` (run those from repo root).
- `/data/seed.json` — generated Supabase seed payload.
- `/data/automoviles-catalog.ts` — automóviles catalog data, not yet wired into the app.

If you change product data, change `/data/product-catalog.json`, re-run the pipeline, and regenerate what the app imports — do not hand-edit downstream copies.
