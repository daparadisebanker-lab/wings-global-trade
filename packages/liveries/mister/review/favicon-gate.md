# Favicon gate — `mister-m-solid.svg` at 16px / 32px

**Verdict: PASS. Ship `mister-m-solid.svg` as the favicon/app-icon asset (spec's 16–48px jurisdiction). Fourth variant NOT cut.** Evidence rasters are in this folder.

## Method
Rendered `mister-m-solid.svg` (viewBox `2142.55 3479.44 1480.81 1275.54`, includes 1b clearspace) with `@resvg/resvg-js` at 16px and 32px, then examined three ways:
- `GATE-m-16.png` / `GATE-m-32.png` — true-size rasters.
- `GATE-m-16-x20.png` / `GATE-m-32-x20.png` — anti-aliased render blown up 20× (pixelated) to inspect what the browser actually rasterizes.
- `GATE-m-16-1bit50.png` / `GATE-m-32-1bit50.png` — worst-case hard 1-bit footprint (alpha thresholded at 50% coverage) = what survives on a non-AA / low-DPI tab.

## Findings
- **32px — clean.** Two legs, central raised lobe, and both counters read as an M unmistakably. Passes in every rendering mode including hard 1-bit.
- **16px — recognizable but soft.** Under standard anti-aliased rendering (how favicons render on modern/retina displays) the distinctive Mister blob-cluster silhouette survives: two side masses, central lobe, faint counters. It does **not** collapse into a featureless blob. Under the pathological hard 1-bit / low-DPI footprint, the two **upper** junction counters close and the mark tends toward a solid mass; the lower counters survive.

## Why no fourth variant
Two reasons, both deliberate:
1. **Not clearly warranted.** A favicon's job is mark *recognition*, not letterform legibility. At 16px under normal AA rendering the Mister mark stays recognizable, so the "unreadable lump" trigger is not met. The clearest legibility loss only appears in a worst-case 1-bit downsample.
2. **The deviation can't be done non-destructively here.** "Deepen the junction notches ONLY, blob centers and outer contours untouched" is a geometry edit of the metaball-M cubic-bezier path. The registered master is a *flattened* single path — the individual blob primitives and their neck curves are not separable from it. Editing those beziers blind would risk moving a contour, which is exactly the redraw/approximation the standard forbids. Cutting an unnecessary geometry deviation is itself a refusal per the standard.

## Recommendation if crisp 16px low-DPI counters are later required
Have the deepen-notches edit done by a designer in the **vector source** (where blob primitives are still separable), then submit it here as `mister-m-favicon.proposed.svg` with before/after 16px renders. The exception remains open; it should just not be executed by path-surgery on the flattened master.
