# 04 — UI Integration: The Engine Room Deltas

Inherit everything from `mister-product-scope/` 02 (tokens), 03 (Constellation), 05 (motion). This file defines only what changes inside the tower. If a value isn't overridden here, the shared system rules.

## ⚠️ SCOPE BOUNDARY (constitutional — added after owner review)

**The Mister design language applies to Mister's surfaces ONLY. The Tower app has its own established identity and is never restyled.**

Mister-owned surfaces (his livery applies):
- The Mister side panel and everything rendered inside it
- The MisterAvatar and all its states, wherever it appears
- Cmd+K *results* attributed to Mister (the answer/action area — not the command bar chrome)
- Artifact renderers, previews, and exports (quotes, briefs, reports carry Mister's document frame)
- Mister loading/thinking/streaming states (condensation, dots, hairline sweep)
- Inline Mister markers inside host UI: the sky dot / glow underline / "Mister ▸" row — these are *pins*, 1px-scale signals that mark his presence without altering the host component's styling
- The Morning Brief screen (a Mister artifact, full-bleed his)

Tower-owned surfaces (existing Tower identity rules; Mister never touches):
- App shell, nav, headers, module chrome
- Tables, records, forms, pipelines, and every host component's colors/type/spacing
- The review queue *screen chrome* (the queue is Tower; the artifact previews inside it are Mister)

Transition law (scoped-experience): entering a Mister surface should feel like opening a door — fully his inside, zero bleed outside. When closed, the Tower is visually untouched except the small presence pins. The deep-water/paper "engine room" concepts below describe the interior of Mister's surfaces and his documents — **not** a directive for Tower modules.

## The room concept

Client Mister lives in open water (dark, atmospheric, spacious). **Inside the tower, Mister's own surfaces run denser and stiller: more paper, tighter rhythm.** Operators stare at this for 8 hours — atmosphere yields to legibility, and motion yields to focus.

## Deltas

### Surfaces
- **Paper-first data:** tables, records, artifacts render in the light room (`--paper` #E1E8F0 family, `--ink` Mirage) as the *default*; the deep-water world remains as the app frame (nav, rails, panel chrome, empty states). The threshold drama (dark frame / paper work) becomes the tower's visual identity.
- New derived tokens (extend, don't fork):
  `--paper-2: #EAF0F7` (row alt) · `--ink-secondary: rgba(15,24,42,0.64)` · `--ink-tertiary: rgba(15,24,42,0.40)` · `--line-ink: rgba(15,24,42,0.10)` · glow on paper: `rgba(59,130,246,0.18)`.

### Density (operator grid)
- App type scale drops one step: `body 14/20`, `small 12/16`, `mono-data 11/16`, `numeral 24/28`. Marketing scale is forbidden in the tower except the Brief's single display line.
- Spacing rhythm halves: rows 40px, card padding 16, section gaps 24/32. Still strictly 8-pt (4·8·12·16·24·32…).
- Tables are the primary organism: sticky `mono-data` headers, tabular numerals right-aligned, 1px `--line-ink` rows, row hover = paper-2 (no shadow, no lift).

### Motion (restraint tier 2 — stricter than the client app)
- Allowed: state-change fades (≤200ms), numeral rolls on changed cells only, the panel slide (280ms, `--ease-water`), rail dot fills, avatar states.
- Forbidden: scroll-driven anything, hover lifts on tables, staggered list entrances beyond first load, the Clear Signal CTA orbit (client-only flourish).
- The Constellation appears in exactly three places: panel-header avatar · Brief masthead (24-particle, near-still) · global loading/empty states. Nowhere else — stillness is what makes its movement meaningful (Law 3 applied to motion).

### Signature moments (internal edition — small, earned)
1. **Approve** (`⌘↵`): the artifact's metadata strip draws a single glow sweep and the avatar snaps to M — the "shipped" feeling, 600ms total.
2. **Watch catch:** when Mister catches an exception, the record's inline dot pulses once in `--caution` and docks a particle onto the Brief icon counter — risk visibly *collected*, not siren'd.
3. **Brief masthead:** the near-still 24-particle field forms today's date numerals for 1.2s on open, then rests as the M. The one daily moment of theater.

## Tower shell integration

```
┌──────┬──────────────────────────────┬─────────┐
│ Nav  │  MODULE (paper)              │ Mister  │
│ rail │  tables · records · queue    │ panel   │
│ 72px │                              │ 420px   │
└──────┴──────────────────────────────┴─────────┘
```
- Nav rail (dark frame): Torre (home/Brief) · Importaciones · Clientes · Cotizaciones · Documentos · **Cola de revisión** (badge = pending artifacts) · Ajustes.
- The Mister panel is a persistent third column ≥1440px; overlay below that; `M` toggles it. The review queue is a full-page module — reviewing is real work, give it the room.
- Global header: breadcrumb + Cmd+K affordance + avatar. Nothing else. No decorative header art in the tower.

## Screens checklist (v1)
1. **Torre / Morning Brief** (per-role) · 2. **Importaciones** table + record (journey rail reused from client app, paper variant) · 3. **Cotizaciones** pipeline + quote-run screen (03) · 4. **Cola de revisión** (artifact queue with J/K flow) · 5. **Clientes/Proveedores** records with history + Mister row · 6. **Documentos** (paper grid, shared component) · 7. **Ajustes** (margin rules, watch rules, connectors, permissions).

Every screen passes the shared states law (07-COMPONENTS of the sibling package) and keyboard-complete law (01).
