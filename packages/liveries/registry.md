# Livery Registry — accents & hue separation (append-only)

The single source of truth for lane codes, accent colors, and hue registration.
A new lane's accent must sit ≥30° in hue OR a clearly distinct value register from
every existing entry (ecosystem §Phase-2, step 4). **Append only — never edit or
reorder existing rows; lane codes are permanent.**

| Code | Slug | Name | Ground | Accent | Accent hue | Texture | Status |
|------|------|------|--------|--------|-----------|---------|--------|
| —    | wings | Wings Global Trade (house) | `#001E50` navy | `#C4933F` harvest gold | ~38° | none/high-key | HOUSE (pre-onboarding) |

Notes:
- `wings` is the ecosystem **host**, not yet a registered WGT/NN lane. It holds the
  first accent hue (~38°, harvest gold on navy). Future lane accents register their
  ≥30° separation against this row.
- When Wings is formally onboarded (or split into lanes WGT/01–06), each lane's
  accent registers here at that time.

## Represented brands (RB/xx — append-only, same law as lane codes)

RB accents render only inside the `(brands)` white canvas via the `--rb-*` token
contract — they never touch lane chrome. Registered here for the one-ledger rule
and hue-adjacency eyeballing against lane accents.

| Code | Slug | Name | Accent | Accent hue | Ink pair | Status |
|------|------|------|--------|-----------|----------|--------|
| RB/01 | aladin | Áladín (bamboo hygiene paper) | `#5E8A16` green | ~83° (45° vs house) | `#4C7012` (5,78:1) | ONBOARDING |
