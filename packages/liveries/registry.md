# Livery Registry — accents & hue separation (append-only)

The single source of truth for lane codes, accent colors, and hue registration.
A new lane's accent must sit ≥30° in hue OR a clearly distinct value register from
every existing entry (ecosystem §Phase-2, step 4). **Append only — never edit or
reorder existing rows; lane codes are permanent.**

| Code | Slug | Name | Ground | Accent | Accent hue | Texture | Status |
|------|------|------|--------|--------|-----------|---------|--------|
| —    | wings | Wings Global Trade (house) | `#001E50` navy | `#C4933F` harvest gold | ~38° | none/high-key | HOUSE (pre-onboarding) |
| WGT/02 | interiores | Interiores | `#F5F1E8` bone | `#6B2A2A` oxblood | 0.0° (37.9° vs house) | linen-paper | OPENING |
| WGT/07 | automoviles | Automóviles | *pending Phase 2* | *pending Phase 2* | *pending Phase 2* | *pending Phase 2* | OPENING (Phase 1 only) |

Notes:
- **WGT/07's code jumps from 02 to 07 on purpose, not a gap to fill.** §3's
  archetype table pre-names WGT/01 Machinery, /03 Provisions, /04 Living,
  /05 Representation, /06 Export as the ecosystem's planned six; automóviles
  isn't one of them; it earned a new code specifically because the decision
  tree's default answer (fold into WGT/01 Machinery, same EQUIPMENT archetype
  and unit math) was overridden — see `packages/liveries/automoviles/
  lane.config.ts` header for the recorded rationale. Codes 01, 03–06 stay
  reserved for their named lanes; nothing should ever claim them for
  something else.
- **Livery columns intentionally blank.** Phase 1 (lane registration) closed
  2026-08-23; Phase 2 (livery derivation — ground/ink/accent/texture per the
  §Phase-2 rules, contrast + hue-separation audit against this table) has not
  run. The lane renders on the shared house chrome (navy/gold) until it does.
  Do not backfill this row with a color that hasn't been derived and audited.
- `wings` is the ecosystem **host**, not yet a registered WGT/NN lane. It holds the
  first accent hue (~38°, harvest gold on navy). Future lane accents register their
  ≥30° separation against this row.
- When Wings is formally onboarded (or split into lanes WGT/01–06), each lane's
  accent registers here at that time.

### WGT/02 accent derivation (Phase-2 step 3–4, measured 2026-07-28)

The umbrella program doc offered two candidates, "brass — or oxblood". The rules
picked, not taste. Measured against the house row and against the lane's own bone
ground:

| Candidate | Hue | Δ vs house 37.9° (need ≥30°) | Contrast on bone (need 4.5:1 for text) | Verdict |
|-----------|-----|------------------------------|----------------------------------------|---------|
| Brass `#9A6B3F` | 29.0° | 8.9° ❌ | 4.10:1 ❌ | rejected — fails both gates |
| Terracotta `#A0472B` | 14.4° | 23.5° ❌ | 5.43:1 ✓ | rejected — hue too close to house gold |
| **Oxblood `#6B2A2A`** | **0.0°** | **37.9° ✓** | **9.36:1 ✓** | **registered** |

Brass is the intuitive interiors signal and it is exactly what the hue rule exists
to stop: at 8.9° from harvest gold it would read as a warmer Wings, not as a lane.
Oxblood is a fired-clay signal, which the first catalogue (ceramic tile) earns
directly. Ink `#2A2118` walnut sits at 14.02:1 on bone.

**Exception on record — `azulejos` renders achromatic.** The tile catalogue inside
this lane suppresses the oxblood accent and takes a colour-neutral ground, because
the product *is* colour: a lane accent would vanish on some tiles and falsify
others, and a warm ground shifts perceived hue on a purchase buyers reject over
colour variance. Scoped to that route subtree only; lane chrome is unaffected. Same
argument and same scoping the `(brands)` route group already carries (root
`CLAUDE.md` §5-bis).

## Represented brands (RB/xx — append-only, same law as lane codes)

RB accents render only inside the `(brands)` white canvas via the `--rb-*` token
contract — they never touch lane chrome. Registered here for the one-ledger rule
and hue-adjacency eyeballing against lane accents.

| Code | Slug | Name | Accent | Accent hue | Ink pair | Status |
|------|------|------|--------|-----------|----------|--------|
| RB/01 | aladin | Áladín (bamboo hygiene paper) | `#5E8A16` green | ~83° (45° vs house) | `#4C7012` (5,78:1) | ONBOARDING |


## WGT/02 — visual thesis and accent constitution (2026-07-29)

**The thesis.** *Interiores dresses as the document it is bought against — a
finish schedule on bone paper, set in walnut ink, sealed once in fired-clay
oxblood — and at the product's door it surrenders even the seal.*

The buyer does not buy interiors; they buy against a specification someone else
wrote. The most trusted object in their world is a well-set finish schedule
whose numbers are correct, so the lane impersonates that document rather than
decorating the trade. The final clause is the achromatic exception below,
promoted from a footnote to the identity's proudest act.

**Where oxblood may appear — exhaustive.** An accent without a usage law becomes
wallpaper within three sprints.

1. The lane stamp (border `--accent-border`, code `--accent-ink`).
2. The one primary action per page.
3. The active-discipline card border.
4. **At most one column of a data table** — the number the buyer came for.
5. The declared-list hairline, and inline links in lane chrome.

**Where it may NOT appear.** Anywhere under `[data-app="pasillo"]`. In headings
or body copy — ink is walnut; the accent is a seal, not a voice. As a section
ground or any fill larger than the primary action: **no oxblood floods.** As a
status colour. On, beside, or behind any tile-face reproduction anywhere on the
site — the colour-falsification argument follows the pixels of the product, not
the route boundary.

**Ink ladder.** Exactly TWO text steps. `--ink-primary` 14.02:1 and
`--ink-secondary` 5.18:1. There is no third: no alpha reads below secondary and
still clears 4.5:1 on bone (0.42 lands at 2.48:1), so `--ink-decoration` is
hairlines and disabled marks only and is barred from text by name.

**El umbral.** Crossing into the catalogue, the lane drains to
`--accent-drained` `#3F3F3F` — oxblood's achromatic twin at equal luminance
(ΔL 0.0002), so nothing dims and only chroma leaves — and the ground cools to
the record's `#F0EFEE`. The stamp drains last. It never blocks navigation.

## Lane URL policy (ratified 2026-07-29, applies to every lane)

- A catalogue mounts **flat** at `/{lane}/{catalogue-slug}`.
- A discipline earns `/{lane}/{discipline-slug}` only at **≥2 catalogues** or
  **≥2 ACTIVE disciplines**. Before that it is a corridor with one door.
- Catalogue slugs are checked against discipline slugs at registration.
- Lane and catalogue slugs remain append-only and permanent. `/interiores/azulejos`
  is flat and stays flat; breaking a live URL to satisfy a template diagram is
  not a trade worth making.
