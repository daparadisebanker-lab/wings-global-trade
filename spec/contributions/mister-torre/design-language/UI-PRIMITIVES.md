# UI Primitives — Binding Rules (companion to `mister-ui-primitives.html`)

Machine-readable distillation of the living reference sheet. The HTML is the visual truth; this file is the buildable contract. Applies to **Mister surfaces only** — in the Tower, the host app keeps its own identity (see scope boundary in the tower package's 04).

## 1. Color distribution (per-view budget)
Mirage environment ~58% · surface steps ~22% · Silver text ~12% · **Blue ≤5% (interaction only — "you can act" / "Mister is working")** · Horizon ~2% (data, estimates, sources — informs, never a button) · Sky ≤1% (glow, focus, presence). A view exceeding the blue budget has lost its meaning.

## 2. Materiality (four materials, four assets)
- **Water** (backgrounds_01/02): app frame, marketing, empty states — CSS gradient `radial Horizon→Mirage` + grain 4–6%. Never ship the source PNGs to the browser.
- **Surface**: elevation = surface step (`depth-2 → depth-3`) + 1px hairline. **No shadows** except overlays (`0 24px 64px rgba(10,16,29,.5)`).
- **Paper** (Silver ground, Mirage ink): where numbers and documents live. No grain on paper.
- **Light**: `--glow` (Sky 35%) reserved for exactly three uses — Mister presence, active journey stage, keyboard focus.
Radii (frozen, repo Tier-1): control 8 · card 12 · panel 16 · dock 20 · pill/dot 999. No other radius exists.

## 3. Hierarchy
One loud element per view (display type OR hero numeral); everything else whispers in mono-data (11px caps, +0.07em). Mid-sized type is the enemy. All money/data numerals: tabular, with currency + incoterm + date. Typed confidence is visual law: verified = Silver; estimated = Horizon + dotted underline + source tooltip; requiere_verificación = explicit blocker chip.

## 4. Buttons & CTAs
- **Primary**: gradient `135° Sky→Blue→Horizon` (exclusive to primary), white 500 text, h-48 marketing / h-40 app, radius 8. Hover: scale 1.02 + glow (the only button with a halo). **One primary per view, maximum.**
- **Loading state**: 3 brand dots pulsing (1.2s cadence) — spinners are banned product-wide.
- **Secondary**: hairline border, Silver text; hover → Sky border/text. **Ghost**: text + underline drawing left→right 180ms. **Destructive**: coral hairline only — never a red fill. **Disabled**: 40% opacity, no interaction.
- **Chips** (Mister suggestions): pill, max 3, hover Sky, press scale .97; active = blue 16% fill + Sky text.
- Focus: 2px Sky outline, offset 2, always visible.

## 5. Loading language (from the tramado asset: waiting = matter forming)
- **Condensation** (page/panel/artifact): grain condenses into the M — parameters in `CONSTELLATION-SPEC.md` §4 LOADING.
- **Three dots** (inline/button): the isotipo's 3 dot sizes, 1.2s, calm.
- **Hairline sweep** (indeterminate progress): 1–2px Sky light crossing a hairline; no thick bars.
- **Skeleton** (data rows in cards): opacity pulse 4–7%; **shimmer prohibited**.
- **Streaming text**: token fade-in 120ms; no typewriter caret — cadence lives in the avatar (SPEAKING state).

## 6. Iconography
24px box, 1.5px stroke, round caps/joins; scale 16/20/24. Signature rule: **one Sky dot terminal marking the "intelligent end" of the gesture.** Status is expressed by recoloring the dot (positive/caution/critical) — the stroke never changes. No filled icon families.

## 7. Quick laws
Gradient: 3 uses only (primary CTA, avatar/isotipo, hero quote figure). Glow: 3 uses only (presence, active stage, focus). Horizon informs, Blue acts. Grain on water, never on paper. Hairlines soft 8% default / strong 16% emphasis; 2px only for focus. Radii per §2.
