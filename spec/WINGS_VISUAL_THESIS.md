# Wings Global Trade — Visual Thesis
**v2.0 · Authority document. Every design decision is tested against this.**

---

## THE THESIS

> **"Import intelligence should read like a certified document, not a marketplace listing."**

---

## WHAT THIS MEANS

A certified document — a Lloyd's certificate, a customs declaration, a
ZOFRATACNA admission form — has specific visual properties:

- **Typography is functional, not decorative.** Data values appear in
  monospace. Headers are authoritative. Nothing is italic for style.
- **Color signals status, not emotion.** Navy = authority. Gold =
  annotation/precision. Warm white = paper.
- **Layout is hierarchical and dense.** Information is organized by
  importance. Whitespace separates sections, not decorates them.
- **Every element earns its place.** If a mark, line, or visual element
  carries no information, it is removed. Decoration is the enemy of
  authority.
- **The document knows things the buyer doesn't.** It reveals intelligence
  — duty rates, altitude corrections, transit times, certifications — that
  the buyer could not easily find elsewhere.
- **The document is legible before it is beautiful.** A certified document
  that cannot be read is a decorative object (see LEGIBILITY LAW).

A marketplace listing — Alibaba, Mercado Libre, a generic B2B catalog — has
different properties: promotional color, lifestyle photography, rounded
corners, exclamation marks, generic copy, "quality products" language,
stock imagery.

**Wings is the first kind. Wings refuses the second.**

---

## THE TEST

Before any visual decision is finalized, ask:

> Does this look like a certified document or a marketplace listing?

If marketplace listing: redesign or remove.

---

## WHAT THIS THESIS CONTROLS

| Decision | Certified Document | Marketplace Listing |
|----------|-------------------|---------------------|
| Data values | DM Mono always | Any readable font |
| Photography | Working Daylight standard: bright mineral daylight, real work, one saturated livery mass — governed by `WINGS_IMAGE_GENERATION_THESIS.md` v2.0 | Dusk mood shots, white-background stock, lifestyle scenes, AI renders posing as evidence |
| Copy | Specific: "79 HP efectivos a 3.200 msnm" | Generic: "alta potencia para toda aplicación" |
| Buttons | 2px border-radius, direct label | Pill shape, "¡Ver más!" |
| Animation | Ease only, 0.3–0.6s, no bounce | Bouncy, playful, attention-seeking |
| Color use | Semantic: gold = precision annotation | Decorative: gold = "premium feel" |
| Whitespace | Separates sections structurally | Fills space aesthetically |
| Logo | Geometrically constructed, SVG clean | Organic, illustrative |
| Empty states | "Sin datos disponibles" | Friendly illustrations |
| Error states | Specific: "Error al calcular CIF — verifique peso" | Generic: "Algo salió mal" |

---

## LEGIBILITY LAW *(new, 2026-07-08)*

A certified document is, of all genres, the one that must be read. Contrast
and size are law, not preference:

- **Body and data text:** minimum WCAG AA contrast (4.5:1) against its
  ground; data values target 7:1. Navy `#001E50` on warm white `#F8F6F0`
  passes everywhere and is the default text pairing.
- **Gold `#C4933F` is never body-text on warm white** — it fails contrast.
  Gold type is permitted only ≥18px bold on warm white, or at any size on
  navy grounds. Gold's primary role remains non-textual annotation: rules,
  ticks, seals, precision marks.
- **DM Mono data values:** never below 12px rendered; tabular numerals;
  no letter-spacing tricks that break scanning.
- **Density has a floor:** hierarchical and dense, but line-height never
  below 1.4 for running text; a dense document is still a readable one.

Any surface failing this law fails THE TEST automatically — an illegible
document is a marketplace decoration wearing a suit.

---

## WHAT WINGS REFUSES

These are categorical rejections. Not "use sparingly" — never.

- Gradient backgrounds of any kind
- **Stock or unsanctioned photography** (handshakes, people at laptops,
  suits, purchased generic imagery). Campaign photorealism is not stock —
  it is commissioned art direction governed by
  `WINGS_IMAGE_GENERATION_THESIS.md` v2.0, and only imagery passing that
  document's gates may ship.
- Generatively reinvented product imagery (faithful crisp-upscale
  restoration of genuine supplier photography IS permitted, incl. as
  primary product image — rules in the image thesis, Register C)
- Low-key, dusk-default, or mood-first imagery on any Wings surface
  (Exposure Law, image thesis)
- Rounded pill-shaped buttons
- Exclamation marks in any UI copy
- "Productos de calidad" or any generic quality claim
- Decorative animation that carries no data
- Pure white (#FFFFFF) as a page background — always warm white (#F8F6F0)
- Four or more typefaces in a single interface
- Any visual element that could appear on any supplier's website unchanged

---

## THE THREE FONTS ARE THE THREE WORDS

The tagline is "Precisión. Proximidad. Confianza."
The three typefaces map directly:

```
IBM Plex Serif  =  Precisión
Flexo           =  Proximidad
DM Mono         =  Confianza
```

This is not a stylistic choice — it is a semantic system. Every typeface
has a job. No font crosses into another's territory.

---

## WHO THIS BRAND IS FOR

The ideal reader is a Peruvian or Chilean operations director who:
- Has been burned by underpowered machinery at altitude
- Knows what an HS code is
- Has spent weeks trying to get a clear CIF estimate from a broker
- Trusts data and distrusts marketing
- Reads spec tables before product descriptions
- Would share a link to a page that told them something their broker didn't

Wings is built for this person. Every decision is filtered through their
judgment. The imagery this person trusts looks like a working day, not a
movie poster — which is why the campaign register is named Working
Daylight.

---

## THE CANON

Visual law is enforced against exemplars, not adjectives. UI and document
surfaces keep their own specimen set alongside the imagery canon
(`assets/image-generation/CANON/`): accepted screens, spec sheets, and
plates that define what passing THE TEST looks like. A judged decision
cites a specimen or it is an opinion.

---

## AMENDMENT PROTOCOL

Only the founder amends this document. Agents propose amendments via
`DEFERRED.md` with rationale; inline edits by agents are void. Every
amendment lands as a changelog row and a version bump. This document
supersedes any conflicting visual decision elsewhere in the spec.

## CHANGELOG

| Date | Ver | Clause | Change | Reason |
|---|---|---|---|---|
| 2026-06 | 1.0 | — | Created | Founding |
| 2026-07 | 1.1 | Refusals | Faithful restoration of supplier photography permitted (Register C) | Supplier photo quality |
| 2026-07-08 | 2.0 | Photography row | Points to Working Daylight standard (image thesis v2.0) | Founding canon ingested; register named |
| 2026-07-08 | 2.0 | Refusals | "Stock photography" clarified to stock/unsanctioned; campaign photorealism explicitly governed by child doc; mood-first imagery refused | Removed the contradiction a literal rule-following agent would trip on |
| 2026-07-08 | 2.0 | Legibility Law | Added: contrast minimums, gold-text restriction, mono size floor | Gold on warm white fails contrast; certified documents must be legible |
| 2026-07-08 | 2.0 | Canon + Amendment Protocol | Added | Drift resistance; change control |

---

*Maintained in: `spec/WINGS_VISUAL_THESIS.md` · v2.0, 2026-07-08.*
*Child authority: `spec/WINGS_IMAGE_GENERATION_THESIS.md` v2.0.*
