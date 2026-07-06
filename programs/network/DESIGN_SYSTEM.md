# Wings Network — Design System Spec

## Governing Rule
Wings Network does not get its own visual language. **It inherits the live Wings Global Trade design system** — a supplier must feel they are entering the exact world buyers trust, because that feeling is the product. This file defines (a) the token architecture the build must consume, (b) the marketplace-specific extensions, and (c) the surface-mode rules.

## Step 1 — Token Extraction (first build task, before any UI)
Extract from the existing repo into `src/styles/tokens.css` (CSS custom properties) + Tailwind theme mapping:
```
--wings-bg / --wings-surface / --wings-border
--wings-text-primary / --wings-text-secondary
--wings-accent (brand) / --wings-accent-contrast
Font families: display / ui / mono (match existing site exactly)
Type scale, spacing scale, radius, shadow — as used, not as imagined
```
If any token is missing on the existing site, PAUSE and derive from the most-used computed value on production pages — never invent parallel values.

## Marketplace Extensions (new tokens, harmonized with the above)
```
--net-verified:    trust-mark color — derived from accent family, reserved
                   exclusively for VerifiedBadge + verification states
--net-fill:        fill-meter progress — the single most-seen marketplace color;
                   must read on both dark hero and light portal surfaces
--net-cutoff:      urgency accent (cutoff countdowns, SLA timers) — warm signal,
                   used ONLY for time pressure, never decoration
--net-direct:      flagship weight cue for Wings Direct cards (subtle — weight is
                   conveyed by hierarchy and order, color only assists)
--net-state-*:     success / warn / danger mapped to existing site conventions
```

## Surface Modes (scoped-experience doctrine)
| Surface | Mode | Type | Motion |
|---|---|---|---|
| Vende landing | Brand-forward | Display-led, generous scale | GSAP scroll narrative + Lenis; fill-meter as living proof object |
| Buyer /red catalog | Brand-forward, catalog density | UI font, spec-sheet mono for data | Hover/entrance restraint; fill-meter realtime pulse |
| Supplier portal | Data-forward | UI + mono for numbers; tighter scale | Functional only: state transitions, SLA pulse, optimistic updates |
| Ops admin | Utility | Dense tables | None beyond feedback |

The portal is denser and quieter — but same fonts, same tokens, same radius. One world, two rooms.

## The FillMeter (component-level spec — the hero earns precision)
- Anatomy: lane label · capacity bar (GSAP-tweened width, 600ms ease-out on delta) · fill % (mono, tabular numerals) · cutoff countdown (–net-cutoff when < 7 days) · CTA slot (variant-driven)
- Realtime: Supabase channel; on update, tween from previous value — never jump-cut (the animation IS the "trae tu grupo" story)
- Reduced motion: instant set + subtle opacity confirmation
- Empty/loading: skeleton bar shimmer, never a spinner
- Print/social: static render mode for campaign asset generation (Recraft/Figma Weave pipeline consumes this)

## Typography & Numbers
- Display: existing Wings display face. UI: existing UI face. Data/money/spec values: mono with tabular numerals, always.
- Money format: `US$ 1,234.56` (es-PE grouping per locale), currency code explicit on statements. Negative = parentheses on financial tables.
- Spanish-first microcopy; the voice is the corridor's — direct, commercially warm, zero SaaS-speak. "Reserva tu slot", not "Get started".

## Accessibility Floor (non-negotiable)
WCAG 2.1 AA: contrast on all token pairs verified in CI (fail build on regression) · full keyboard paths through application form, slot picker, lead inbox · focus visible everywhere · touch targets ≥ 44px on portal tables (corridor reality: phones) · `prefers-reduced-motion` honored globally.
