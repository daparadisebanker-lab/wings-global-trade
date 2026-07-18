# Esquema generation — model addressing (Recraft via MCP)

> **DIRECTION CHANGE 2026-07-09 (Muaaz, supersedes everything below):** esquema
> visuals follow the **poster register** — flat editorial poster illustration
> matched to Muaaz's reference set (bold color masses: golden yellow / cobalt /
> black / white / hot pink + blue / teal / red variant; stylized clouds permitted).
> The navy/paper/gold Drawn Register below NO LONGER governs esquema generation
> (it survives only where other specs cite it — pending founder ratification of
> a formal amendment to `WINGS_ILLUSTRATION_STANDARD.md`).
>
> **Routing:** `recraftv3` + custom `styleID: 7573af00-c9df-4309-81ff-5701dd00332d`
> (logged in `assets/image-generation/MANIFEST.md`; built via `create_style` from
> the reference screenshots, base `digital_illustration`). Prompts are short
> scene descriptions — the style carries palette and register, and it also
> unlocks comparative/interior layouts V3 refused under prompt-only addressing.
> **Deliverable format: PNG** (webp output rasterized via headless Chrome,
> `assets/esquemas/posters/ESQ-<ID>-{a,b}.png`), not SVG. Named substyles remain
> banned (they fight the custom style).

How esquema prompts are assembled and how the model is addressed. Governed by
`spec/WINGS_ESQUEMA_STANDARD.md` (prompt architecture) + `WINGS_ILLUSTRATION_STANDARD.md`
(Drawn Register blocks) + `assets/image-generation/RECRAFT-MODELS.md` (tool reality).

## The model

- **Ideal per the standard:** `recraftv4_1_vector`. **Not reachable** — the MCP
  server exposes only `recraftv3` / `recraftv2` (verified 2026-07-07, re-verified
  2026-07-09 against the live tool schema).
- **Routing in force:** `recraftv3` + `style: vector_illustration` (returns SVG —
  the master format), **no substyle**. Calibrated 2026-07-09: named substyles
  (`editorial` tested) impose their own trained palettes and override in-prompt
  hexes — banned for esquemas. Full findings: `BUILD-LOG-2026-07-09-IMP.md`.
- V3 is the control model — the only family with named styles and `create_style`.
  Once ≥5 esquemas of a Q-form are accepted, distill a V3 custom style per the
  standard's canon-first mechanism.

## MCP schema constraints (design around, don't fight)

| Constraint | Consequence |
|---|---|
| Prompt ≤ 1024 chars | Blocks are compressed, subject text is rationed |
| No `controls.colors` | Palette enforced **in-prompt by hex** (#001E50 · #F8F6F0 · #C4933F) |
| No `random_seed` | Provenance = prompt + model + style + substyle + date, logged verbatim |
| No `negative_prompt` | Negative-list terms stated inside the prompt ("no gradients, no texture") |
| No `no_text` param | "No text, no letters, no words" stated in-prompt; **all labels, step numbers and dimension values are set in DM Mono during vector cleanup** — generated text is never trusted (diacritics law) |

## Prompt assembly (order = priority; earlier tokens dominate)

Calibrated 2026-07-09 (v2 — supersedes the tier-block-verbatim v1 in the fichas):

```
[PALETTE FIRST: "Flat vector technical schematic, deep navy blue #001E50 line
 art and flat fills on warm off-white paper #F8F6F0, exactly one element
 highlighted in solid mustard gold #C4933F."]
[COMPOSITION: literal, left-to-right, concrete nouns; ORO named as the
 "highlighted solid mustard gold" shape]
[GHOST CLAUSE: "Faint thin ghosted outlines with no fill: <FANTASMA>"]
[CLOSE: "Hard edges, flat fills, no gradients, no texture, no shading, two
 line weights, precise mechanical proportions, engineering drawing
 sensibility, generous paper margins. No clouds, no decoration, no people,
 no faces, no airplanes, no flags, no text, no letters, no numbers."]
```

Known model limits (design the ficha's TINTA around them): single-subject
scenes and plates are excellent; side-by-side comparisons, multi-panel rows
and interior cutaways are refused — Q-COMP, Q-DIM and interior Q-CONN forms
are assembled manually in vector from generated component plates. Gold lands
in ~⅓ of batches; the single-gold law is enforced in cleanup regardless.

TIER BLOCK: "Three-tier hierarchy: surrounding context elements as thin ghosted
navy outlines with no fill; the subject system in full navy ink with two stroke
weights and flat fills; exactly one gold element: [ORO]. Nothing else carries color."

BASE BLOCK: "Flat vector technical illustration, geometric construction, hard
edges, no gradients, no texture. Deep navy ink #001E50 on warm off-white paper
#F8F6F0, one gold #C4933F accent only. Two stroke weights. Flat shadow shapes at
consistent 45-degree light. Precise mechanical proportions, engineering drawing
sensibility, industrial trade subject matter. No text, no letters, no words."

Addressing rules that measurably matter on V3:
- Describe **drawing logic, never camera logic** (no lenses, no lighting moods).
- Concrete nouns and spatial relations beat adjectives; state station lists
  left→right in reading order.
- Constraints are respected when stated flatly ("hard edges", "no gradients").
- `n: 3` per ID, select best; never ship the only candidate.
- Sizes by Q-form: Q-SEQ 1820x1024 · Q-MECH/Q-CONN/Q-COMP/Q-DIM 1536x1024 ·
  Q-ANAT and tight Q-CONN 1365x1024. Aspect variants are cut from the cleaned
  master, never generated per-ratio.

## Pipeline position

Generation ≠ acceptance. Raw candidates land in `assets/image-generation/raw/`;
tiers, stroke ratio (3:1), single-gold and DM Mono labels are **enforced in
vector cleanup**; gates X1–X7 judged against the ficha; only then CANON filing,
MANIFEST row, variants. Per-ID fichas + frozen prompts live in `ESQ-<ID>/ficha.md`.
