# Livery Registry — accents & hue separation (append-only)

The single source of truth for lane codes, accent colors, and hue registration.
A new lane's accent must sit ≥30° in hue OR a clearly distinct value register from
every existing entry (ecosystem §Phase-2, step 4). **Append only — never edit or
reorder existing rows; lane codes are permanent.**

| Code | Slug | Name | Ground | Accent | Accent hue | Texture | Status |
|------|------|------|--------|--------|-----------|---------|--------|
| —    | wings | Wings Global Trade (house) | `#001E50` navy | `#C4933F` harvest gold | ~38° | none/high-key | HOUSE (pre-onboarding) |
| WGT/02 | interiores | Interiores | `#F5F1E8` bone | `#6B2A2A` oxblood | 0.0° (37.9° vs house) | linen-paper | OPENING |

Notes:
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
