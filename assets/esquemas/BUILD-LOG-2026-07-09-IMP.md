# Build log — Domain IMP generation wave, 2026-07-09

All calls: `recraftv3` · `style: vector_illustration` · **no substyle** · n=3.
Raw output in `assets/image-generation/raw/<uuid>.svg`. No seed available on the MCP
server — the executed prompt below IS the provenance (thesis provenance rule).
Credits: 51 images, balance 7,934 before wave.

## Calibration rounds (ESQ-IMP-002 used as probe)

| Round | Change | Outcome |
|---|---|---|
| 1 | substyle `editorial`, tier+base blocks verbatim | REJECTED — substyle's trained palette (teal/orange/pink, clouds) overrides in-prompt hexes. Files: `225e4630`, `89758156`, `cf8e3a6e` |
| 2 | substyle dropped, palette moved to front | Register correct (navy on paper); gold dropped; composition drifted to port scenery. Files: `371cd230`, `f7e03f24`, `1825e952` |
| 3 | literal layout language, gold as named filled shape | Diagrammatic; gold still unreliable → enforce in cleanup (as the standard already mandates). Files: `c776a4a5`, `3141bf15`, `6c2a38a5` |

## Calibrated prompt pattern (v2 — the wave standard)

```
Flat vector technical schematic, deep navy blue #001E50 line art and flat
fills on warm off-white paper #F8F6F0, exactly one element highlighted in
solid mustard gold #C4933F. [COMPOSITION — literal, left-to-right, concrete
nouns, ORO named as "highlighted solid mustard gold"]. Faint thin ghosted
outlines with no fill: [FANTASMA]. Hard edges, flat fills, no gradients, no
texture, no shading, two line weights, heavy structural and light detail,
precise mechanical proportions, engineering drawing sensibility, generous
paper margins. No clouds, no decoration, no people, no faces, no airplanes,
no flags, no text, no letters, no numbers.
```

## Per-ID raw files

| ID | Files (`raw/<uuid>.svg`) | Verdict |
|---|---|---|
| ESQ-IMP-001 | `5f918071` `6d8410d5` `5f647e1e` | Weak: invented airplanes (all 3), garbled text, one drawn face. `6d8410d5` most usable. Regenerate with v2 negatives (this call predated them) |
| ESQ-IMP-002 | round-3 files above | `3141bf15` base for cleanup |
| ESQ-IMP-003 | `bbcae4d3` `0c993a6e` `3d5de960` | `3d5de960` STRONG. `0c993a6e` rejected: US flag + text. `bbcae4d3`: figure with face |
| ESQ-IMP-004 | `86a15edc` `8926c50e` `7367188b` | `7367188b`: elements + gold present (gold on road — reassign) |
| ESQ-IMP-005 | `586f11a1` `cf6b6ece` `56d05c19` | Doc + port art; four-doc row not achieved — assemble |
| ESQ-IMP-006 | `cb87c116` `bb420e21` `4f217960` | `cb87c116` STRONG: stacked bands + gold marks; `4f217960` numbered-bar alternative (garbled numerals) |
| ESQ-IMP-007 | `7feb2287` `87aac954` `f5cb07d0` (+ rejected `4defd451` `2aaa6803` `32546b42` — drew buildings) | Single-container plates, excellent line grammar → component art; comparison built manually |
| ESQ-IMP-008 | `b145840d` `f9410f71` `ba9cf9f8` | Single containers again; `b145840d` carries true ISO dimension-line grammar |
| ESQ-IMP-009 | `e7e9f33f` `243ce822` `e49db97c` | Three strong port scenes; sequence row assembled in cleanup |
| ESQ-IMP-010 | `7c82abec` `73a3e694` `ec740403` (closed exteriors) + `53b042e8` `9d3fed76` `6e0e1f38` (open crates/pallets) | Interior lashing refused; crate plates = component art |
| ESQ-IMP-011 | `e882d81d` `6ccd8acb` `7b53bc69` | `7b53bc69` clean two-tone hub/route; `6ccd8acb` has gold but world-map + garbled compass; simplify coastlines |
| ESQ-IMP-012 | `cf98240d` `569a4f6b` `59071697` | Side-opened container views — Q-ANAT base; castings visible, recolor gold |
| ESQ-IMP-013 | `639411f5` `209daef2` `97ed22df` | BEST OF WAVE: gold landed on approval/report mark in `639411f5`/`209daef2` |

## WAVE 2 — poster register (same day, direction change by Muaaz)

Muaaz rejected the wave-1 navy/paper register against his reference posters
(flat editorial, saturated masses) and required PNG/JPG. Custom style built
from his two reference screenshots: `styleID 7573af00-c9df-4309-81ff-5701dd00332d`
(see MANIFEST.md). All 13 IDs regenerated, n=2, `1024x1280`, short scene
prompts, no substyle. Raw webp in `raw/`; **PNG deliverables in
`assets/esquemas/posters/ESQ-IMP-0NN-{a,b}.png`** (headless-Chrome rasterized,
1024×1280). Style-route probes that led here (all logged in raw/): substyles
`2d_art_poster`/`graphic_intensity`/`hard_comics`/`2d_art_poster_2` rejected
(grain/vintage palettes); `editorial` inconsistent without the custom style.

| ID | raw uuids (a, b) | Note |
|---|---|---|
| 001 | `85d7438d`, `6dc031df` | ship between factory and warehouse |
| 002 | `c437e7ca`, `56f7e68f` | container on hook + crate/ship/shield emblems (shield in b has a swoosh-like mark — check before ship) |
| 003 | `f5acf7ba`, `591e2119` | compound + barrier + watchtower |
| 004 | `a695fafc`, `176b19e8` | central gate crossing |
| 005 | `f6bf9706`, `adbf4a02` | document sheets over ship |
| 006 | `b550cb7e`, `39785d87` | journey band with route line (strong) |
| 007 | `6b4717f7`, `0d7dda2b` | three container sizes + scale figure (custom style unlocked comparison) |
| 008 | `442b6133`, `49eba7dd` | full vs partial container |
| 009 | `152aadff`, `4ca543dd` | port crane (style probes — both palettes) |
| 010 | `02aeb2fc`, `098ef7da` | strapped cargo interiors (unlocked) |
| 011 | `dc7fde35`, `454627bd` | two-route transshipment map |
| 012 | `a057ec2c`, `49e94c69` | open-door container anatomy |
| 013 | `d4cc9937`, `0620e1a6` | clipboard + magnifier inspection (strong) |

## Model findings (feed back into GENERATION.md — done same session)

1. **Named substyles are banned for esquemas** — their trained palettes beat `controls`-less in-prompt hexes.
2. Palette-first prompt ordering reliably produces the two-tone navy/paper register.
3. The gold third color lands in ~⅓ of batches and is often misassigned. Correct per the standard: the single gold element is a **vector-cleanup operation**, not a generation goal.
4. V3 is excellent at single-subject industrial scenes/plates; it structurally refuses side-by-side comparisons, multi-panel rows, and interior cutaways ("cutaway", "cross-section", "architectural" derail it). Q-COMP / Q-DIM / interior Q-CONN esquemas are **assembled manually in vector from generated component plates**.
5. Uninvited content to negate explicitly every time: airplanes, flags, people/faces, clouds, pseudo-text. Even then, sweep garbled glyphs in cleanup (labels are re-set in DM Mono regardless).
