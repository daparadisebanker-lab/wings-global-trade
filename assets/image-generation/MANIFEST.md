# Generated-asset manifest (append-only)

Every accepted asset gets a row before it ships. Custom V3 style ids are
registered in the second table. Never edit or delete rows — supersede with a
new row and mark the old destination `RETIRED`.

## Assets

| File (library/…) | Class | Lane | Model | Seed | Prompt (verbatim) | style_id | Date | Destination |
|---|---|---|---|---|---|---|---|---|

## Custom styles (V3 `create_style`)

| style_id | Class | Lane | Source assets | Date |
|---|---|---|---|---|

## Registered mark derivations (Mister) — appended 2026-07-08

Not generated assets: cut/rendered from the registered masters per
`spec/MISTER_LOGO_APPLICATION_STANDARD.md` ("any new render gets a MANIFEST
row"). Geometry verbatim in all cuts; unit **b = 271.389** master units
(satellite method — see `packages/liveries/mister/logo/geometry.json`).

| File (packages/liveries/mister/…) | Derivation | Method | Date |
|---|---|---|---|
| `logo/mister-mark-solid.svg` | Cut from `mister-lockup-solid.svg`: deleted wordmark (polygon + 5 glyphs) + `fil2` rect; M path + 12 satellites verbatim; fill `#1D83F2` | viewBox = mark_bbox + 1b = `1518.57 2783.08 2729.05 2707.18` (satellite extents analytic) | 2026-07-08 |
| `logo/mister-m-solid.svg` | Cut from master: metaball-M path only, verbatim; fill `#1D83F2` | viewBox = m_bbox + 1b = `2142.55 3479.44 1480.81 1275.54` (alpha-bbox @resvg 9000px) | 2026-07-08 |
| `logo/mister-wordmark-solid.svg` | Cut from master: wordmark polygon + 5 glyph paths verbatim; fill `#1D83F2` | viewBox = wordmark_bbox + 1b = `4240.77 3216.99 5934.51 1860.18` (alpha-bbox) | 2026-07-08 |
| `logo/geometry.json` | Programmatic derivation record: unit b + element bboxes | b: M-bbox/3 = 312.68 vs largest-satellite Ø = 271.39, 13.2% disagreement → satellite method per standard | 2026-07-08 |
| `review/variant-contact-sheet.png` | Verification render: 3 variants × 16/32/64/128/512 px | @resvg true-px renders, labeled composite | 2026-07-08 |
| `review/GATE-m-{16,32}{,-x20,-1bit50}.png` + `favicon-gate.md` | Favicon legibility gate evidence | Verdict PASS — m-solid ships for favicon use; no 4th variant (see `spec/DEFERRED.md` D-4) | 2026-07-08 |
| `review/ramp-calibration-sheet.png` | Founder calibration render: shipped OKLCH ramp vs OKLab comparison vs scarcity/failure/gold context | culori + @resvg from `ramp.ts` stops; supports `spec/DEFERRED.md` D-1/D-2 | 2026-07-08 |
| `review/ramp-calibration-sheet.png` (v2, supersedes 2026-07-08 v1) | Re-render after D-1/D-2 ratification: shipped OKLab ramp (v1.1, hot frozen `#B93400`) + semantic-reds row presenting the D-3 `--error` proposal with AA/ΔE annotations | culori + @resvg from `ramp.ts` v1.1 stops | 2026-07-08 |
| `review/variant-contact-sheet.png` (v2, supersedes 2026-07-08 v1) | Re-render for shipped-state parity (geometry unchanged); true-px crisp renders instead of upscaled cells | @resvg true-px, dynamic layout | 2026-07-08 |
