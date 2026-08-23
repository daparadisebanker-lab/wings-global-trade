# Livery Registry — accents & hue separation (append-only)

The single source of truth for lane codes, accent colors, and hue registration.
A new lane's accent must sit ≥30° in hue OR a clearly distinct value register from
every existing entry (ecosystem §Phase-2, step 4). **Append only — never edit or
reorder existing rows; lane codes are permanent.**

| Code | Slug | Name | Ground | Accent | Accent hue | Texture | Status |
|------|------|------|--------|--------|-----------|---------|--------|
| —    | wings | Wings Global Trade (house) | `#001E50` navy | `#C4933F` harvest gold | ~38° | none/high-key | HOUSE (pre-onboarding) |
| WGT/02 | interiores | Interiores | `#F5F1E8` bone | `#6B2A2A` oxblood | 0.0° (37.9° vs house) | linen-paper | OPENING |
| WGT/07 | automoviles | Automóviles | `#15161B` asphalt | `#5590FF` ion blue | 219.2° (178.8° vs house) | blueprint-grid | OPENING |

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
- **WGT/07 Phase 2 closed 2026-08-23** (same day as Phase 1) — see the
  derivation below. The route itself still renders on shared house chrome
  until Phase 3 (route migration off `/catalogo/automoviles`) ships; the
  livery exists in `packages/liveries/automoviles/livery.css` but nothing
  stamps `[data-lane="automoviles"]` on a page yet.
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

### WGT/07 accent derivation (Phase-2 steps 1–4, measured 2026-08-23)

**Ground, step 1.** EQUIPMENT "may go dark" (§2). Cars are photographed and sold on
asphalt, tarmac and showroom concrete, not paper — a literal environment-of-the-
cargo read, same method Interiores used for bone/plaster. `#15161B` asphalt
charcoal, distinct from house navy (`#001E50`, a saturated blue) rather than
reusing it, so the lane doesn't just read as "Wings but darker."

**Ink, step 2.** Asphalt is a cool/neutral ground, not warm — `#EEF0F3` cool white
follows that temperature rather than the house's warm-white `#F8F6F0`. 15.82:1 on
the ground; also checked against the two surfaces the lane actually uses (raised
card `#1D1F26`: 14.41:1; inset well `#0E0F13`: 16.78:1) — same "measure both
grounds" discipline WGT/02's ink-secondary note establishes, since an ink that
clears the base ground can still fail a step-lighter card.

**Accent, steps 3–4.** The cargo's most premium material signal, for a car, isn't
a paint colour — every brand in the catalogue converges on one thing: the
white-blue glow of LED daytime running lights / xenon HID, the one visual signal
every trim shares regardless of brand. Three candidates, measured against the
house row, both existing lane accents, and — new for this lane, since it opens on
a dark ground rather than a light one — **both grounds the lane actually renders
text on** (base ground and the raised card one step lighter, where a color that
clears the darker ground alone can still fall short):

| Candidate | Hue | Δ vs house 38° | Δ vs interiores 0° | Contrast on ground | Contrast on raised card | Verdict |
|-----------|-----|-----------------|---------------------|---------------------|--------------------------|---------|
| Amber/hazard `#FF9500` | 35.1° | 2.9° ❌ | — | 8.22:1 ✓ | — | rejected — nearly identical to house gold; turn-signal amber is the intuitive automotive signal and exactly what the hue rule exists to stop |
| Racing red `#D0021B` | 352.7° | 45.3° ✓ | 7.3° ❌ | 3.19:1 ❌ | — | rejected — fails both gates against Interiores; reads as a hotter oxblood, not a new lane |
| Ion blue `#3D7FFF` (first pass) | 219.6° | 178.4° ✓ | 140.4° ✓ | 4.88:1 ✓ | 4.45:1 ❌ | rejected as-is — clears the base ground but falls short on the raised card by 0.05; not shipped on a technicality |
| **Ion blue `#5590FF` (registered)** | **219.2°** | **178.8° ✓** | **140.8° ✓** | **5.87:1 ✓** | **5.34:1 ✓** | **registered — same hue family, lightened for margin on both grounds** |

Ion blue also clears RB/01's green (136.2° away) by a wide margin — the full
three-way separation is recorded in the top table. `accent-ink` points at the
same value (no separate pairing needed, same as oxblood). The CTA fill inverts
the relationship rather than filling solid ion-blue: white text directly on
`#5590FF` measures only 2.7:1, so the filled state uses the ink/ground pair
(`#EEF0F3` fill, `#15161B` text — 15.82:1) the same way Interiores' CTA is
bone-on-walnut, not oxblood-on-walnut (1.50:1, unusable). Full token set in
`packages/liveries/automoviles/livery.css`.

**Texture, step 5.** `blueprint-grid` — faint ion-blue grid lines on the asphalt
ground, the one texture in the library that is literally an engineering-drawing
motif, apt for a catalogue whose whole pitch is a configured, specified unit.

**Type posture, step 6.** `compressed-caps` — EQUIPMENT's fixed posture (§2 step
6), not a choice. Same variable family as every lane; no new typeface.

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
