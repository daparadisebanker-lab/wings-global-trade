# MANIFEST rows — geometry agent (2026-07-08)

Draft rows for the files this agent created. Team lead composes the real MANIFEST.
All geometry is VERBATIM from `mister-lockup-solid.svg`; only viewBox, width/height,
and CSS `fill` were set. Unit **b = 271.389** master user units (see `logo/geometry.json`).

| File | Derivation | Method | Date |
|---|---|---|---|
| `logo/mister-mark-solid.svg` | Cut from `mister-lockup-solid.svg`: deleted wordmark (polygon + 5 glyph paths) and the `fil2` bounding rect; kept the metaball-M path + all 12 satellite circles verbatim. `fil1` fill set to `#1D83F2`. | viewBox = `mark_bbox` [1789.96, 3054.47, 2186.27, 2164.40] + 1b on all sides = `1518.57 2783.08 2729.05 2707.18`. mark_bbox is exact (satellite circle extents analytic; M path interior). | 2026-07-08 |
| `logo/mister-m-solid.svg` | Cut from master: kept only the metaball-M `fil1` path; deleted wordmark, all satellites, and `fil2` rect. `fil1` fill set to `#1D83F2`. | viewBox = `m_bbox` [2413.94, 3750.83, 938.03, 732.76] + 1b = `2142.55 3479.44 1480.81 1275.54`. m_bbox from alpha-bbox render (@resvg 9000px, ~1.3u precision). | 2026-07-08 |
| `logo/mister-wordmark-solid.svg` | Cut from master: kept the wordmark polygon + 5 glyph paths (`fil0`) verbatim; deleted the mark group (M + satellites) and `fil2` rect. `fil0` fill set to `#1D83F2` (fill-rule:nonzero preserved). | viewBox = `wordmark_bbox` [4512.16, 3488.38, 5391.73, 1317.40] + 1b = `4240.77 3216.99 5934.51 1860.18`. | 2026-07-08 |
| `logo/geometry.json` | Programmatic derivation of unit b + all element bboxes on the master canvas. | b via satellite method (Method 1 M-bbox/3 = 312.68 vs Method 2 largest-satellite-diameter = 271.39 disagree 13.2% > 10% → satellite). Bboxes: M-path & wordmark by @resvg alpha-bbox; satellites analytic from transform matrices. | 2026-07-08 |
| `review/variant-contact-sheet.png` | Verification composite: all 3 shipped variants × {16,32,64,128,512}px, white ground, labeled. | Each raster rendered at true px via @resvg, shown pixelated. | 2026-07-08 |
| `review/favicon-gate.md` (+ `GATE-m-*.png`) | Favicon legibility gate for `mister-m-solid.svg` at 16/32px. | Verdict PASS (ship m-solid; 4th variant not cut). See file for reasoning + evidence rasters (true-size, 20× AA blow-up, hard 1-bit footprint). | 2026-07-08 |

**Not created (deliberate):** `review/mister-m-favicon.proposed.svg`. Favicon gate passed at the recognizability bar; deepening metaball notches cannot be done non-destructively on the flattened master path. See `favicon-gate.md`.
