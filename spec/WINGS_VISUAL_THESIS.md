# Wings Global Trade — Visual Thesis
**Authority document. Every design decision is tested against this.**

---

## THE THESIS

> **"Import intelligence should read like a certified document, not a marketplace listing."**

---

## WHAT THIS MEANS

A certified document — a Lloyd's certificate, a customs declaration, a ZOFRATACNA admission form — has specific visual properties:

- **Typography is functional, not decorative.** Data values appear in monospace. Headers are authoritative. Nothing is italic for style.
- **Color signals status, not emotion.** Navy = authority. Gold = annotation/precision. Warm white = paper.
- **Layout is hierarchical and dense.** Information is organized by importance. Whitespace separates sections, not decorates them.
- **Every element earns its place.** If a mark, line, or visual element carries no information, it is removed. Decoration is the enemy of authority.
- **The document knows things the buyer doesn't.** It reveals intelligence — duty rates, altitude corrections, transit times, certifications — that the buyer could not easily find elsewhere.

A marketplace listing — Alibaba, Mercado Libre, a generic B2B catalog — has different properties: promotional color, lifestyle photography, rounded corners, exclamation marks, generic copy, "quality products" language, stock imagery.

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
| Photography | Operational, Andean terrain, real work | White background, stock imagery, AI renders |
| Copy | Specific: "79 HP efectivos a 3.200 msnm" | Generic: "alta potencia para toda aplicación" |
| Buttons | 2px border-radius, direct label | Pill shape, "¡Ver más!" |
| Animation | Ease only, 0.3–0.6s, no bounce | Bouncy, playful, attention-seeking |
| Color use | Semantic: gold = precision annotation | Decorative: gold = "premium feel" |
| Whitespace | Separates sections structurally | Fills space aesthetically |
| Logo | Geometrically constructed, SVG clean | Organic, illustrative |
| Empty states | "Sin datos disponibles" | Friendly illustrations |
| Error states | Specific: "Error al calcular CIF — verifique peso" | Generic: "Algo salió mal" |

---

## WHAT WINGS REFUSES

These are categorical rejections. Not "use sparingly" — never.

- Gradient backgrounds of any kind
- Stock photography (handshakes, generic ports, people at laptops, suits)
- AI-upscaled or composite product imagery as the primary product image
- Rounded pill-shaped buttons
- Exclamation marks in any UI copy
- "Productos de calidad" or any generic quality claim
- Decorative animation that carries no data (particles for ambiance, not information)
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

This is not a stylistic choice — it is a semantic system. Every typeface has a job. No font crosses into another's territory.

---

## WHO THIS BRAND IS FOR

The ideal reader is a Peruvian or Chilean operations director who:
- Has been burned by underpowered machinery at altitude
- Knows what an HS code is
- Has spent weeks trying to get a clear CIF estimate from a broker
- Trusts data and distrusts marketing
- Reads spec tables before product descriptions
- Would share a link to a page that told them something their broker didn't

Wings is built for this person. Every decision is filtered through their judgment.

---

*Document authority: supersedes any conflicting visual decision elsewhere in the spec.*
*Maintained in: `spec/WINGS_VISUAL_THESIS.md`*
*Created: June 2026*
