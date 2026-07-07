# Recraft Models — Internal Reference

Operating knowledge for any agent generating imagery through the `recraft` MCP
server. Source: recraft.ai/docs (fetched 2026-07-07). If a parameter here is
rejected by the API, re-verify against https://www.recraft.ai/docs/llms.txt and
update this file in the same session.

## Access

- MCP tools: `generate_image` · `image_to_image` · `vectorize_image` ·
  `remove_background` · `replace_background` · `crisp_upscale` ·
  `creative_upscale` · `create_style` · `get_user` (credits balance).
- Raw files land in `C:\Users\Muaaz\tools\recraft-images` (server env), not in
  the repo. See this folder's CLAUDE.md for how accepted files move here.
- **The API serves only Recraft's own models.** External models visible in
  Recraft Studio (GPT Image, Flux, Imagen, Seedream, Ideogram, video models)
  are Studio-only — never reachable from here. Don't plan around them.
- Capabilities that exist in the raw API but are not exposed as MCP tools
  (inpaint, outpaint, erase region, remix, explore, enhance prompt) are
  unavailable unless the server adds them — check the tool schema before
  promising a workflow that needs them.

## Model matrix (exact API ids)

| Family | Ids | Use for | Notes |
|---|---|---|---|
| **V4.1** (default) | `recraftv4_1`, `recraftv4_1_vector`, `recraftv4_1_pro`, `recraftv4_1_pro_vector`, `recraftv4_1_utility`, `recraftv4_1_utility_vector`, `recraftv4_1_utility_pro`, `recraftv4_1_utility_pro_vector` | Best overall image quality; expressive direction | ~6.5s (vector 12s, utility 8.5s; pro +5–6s) |
| **V4** | `recraftv4`, `recraftv4_vector`, `recraftv4_pro`, `recraftv4_pro_vector` | Design-led composition, in-image text, production SVG | 1024² ~10s; pro 2048² ~30s (print-ready) |
| **V3** | `recraftv3`, `recraftv3_vector` | **The control model** — see below | Only model with fine-grained controls |
| **V2** | `recraftv2`, `recraftv2_vector` | Legacy; cheap; brand-consistent icon substyles | Unreliable in-image text — never use for text |

### What each family is actually good at

**V4.1** — photorealism with natural light, strong 3D/metal/gradient rendering,
character sheets. Interprets *short* prompts like a creative director (3–6
words produce composed results). `_vector`: logos, lettering, brush-script,
letterforms legible at small sizes. `_utility`: flat lighting, front-facing,
predictable output — the variant for consistent product/mockup sets.

**V4** — strongest design taste (balanced composition, cohesive color, avoids
stock-photo genericness), clear legible in-image text (infographics, signage,
packaging), and the only family producing production-quality editable SVG.
Exports SVG/PNG/JPG/PDF/TIFF/Lottie.

**V3** — the only model with: the **style library** (named styles), **custom
styles** (`create_style` → `style_id` — the brand-consistency mechanism),
**`text_layout`** (place text at exact positions), **`artistic_level`** 0–5,
**`no_text`**, and **`negative_prompt`**. Choose V3 whenever repeatable brand
style or exact text placement outranks raw image quality.

**V2** — only model generating vector *icons* with brand consistency
(Icon/Outline/Pictogram/Colored-shape substyles). Lower cost. Nothing else.

### Capability × model

| Capability | V4.1 | V4 | V3 | V2 |
|---|---|---|---|---|
| Named styles / `style` param | ✗ | ✗ | ✓ | ✓ |
| Custom style (`create_style` → `style_id`) | ✗ | ✗ | ✓ | ✓ |
| `negative_prompt` | ✗ | ✗ | ✓ | ✓ |
| `text_layout` (positioned text) | ✗ | ✗ | ✓ | ✗ |
| `artistic_level` (0–5) / `no_text` | ✗ | ✗ | ✓ | ✗ |
| `controls.colors` / `background_color` | ✓ | ✓ | ✓ | ✓ |
| Reliable in-image text | ✓ | ✓ | ✓ (mid-size) | ✗ |
| Production SVG | ✓ | ✓ | ✓ | ✓ |

## Choosing (decision list)

1. Need a locked, repeatable brand style across many assets → **V3 + `style_id`**.
2. Need text at an exact position → **V3 + `text_layout`**.
3. Need a consistent multi-asset set with flat, predictable lighting → **V4.1 Utility**.
4. Logo, lettering, emblem, stamp → **V4.1 Vector** (or V3 emblem styles for engraved registers).
5. Poster/diagram with typographic hierarchy → **V4**.
6. Print or 2048px+ → any **`_pro`** variant, then `crisp_upscale` if larger still.
7. Icon sets with brand consistency → **V2 vector icon substyles**.
8. Everything else / exploration → **`recraftv4_1`** with short prompts, `n` 3–6.

## Prompting

**Universal template** (slots in this order):
`[SUBJECT + ACTION], [COMPOSITION], [CONTEXT], [MEDIUM], [STYLE], [VIBE], [ATTRIBUTES]`
Attributes = lighting, color, texture, lens/technical detail.

**V4/V4.1 structured order** (when precision matters): core concept →
background/environment → subject framing & pose → physical attributes →
secondary subjects & spatial relations → lighting direction → camera/depth/
contrast → mood. **Earlier elements get higher priority** — reorder to shift
emphasis.

Rules that measurably change output quality:

- Short prompts (3–6 words) put V4.1 in interpretive mode — good for
  exploration. Structured prompts don't make results "better," they make them
  **repeatable**. Match length to intent.
- In-image text goes **in quotation marks**, with hierarchy and placement
  described around it.
- Vector/logo prompts: define graphic type, shape logic, strict palette, line
  discipline, and constraints ("two-color palette", "flat fills only", "no
  gradients") — the model respects constraints. **Never use texture or
  material language in vector prompts.**
- Photorealism: concrete description beats stacked evaluative adjectives
  ("warm tungsten light from the left" not "stunning cinematic masterpiece").
- Illustration: define drawing logic (line behavior, color logic, surface
  treatment), not camera logic.

## Parameters worth using every time

- `n`: 1–6 per call — generate 3+ and select; never ship the only candidate.
- `random_seed`: always set and **log it** — reproducibility is provenance.
- `size`: `WxH` (model-dependent ranges — check appendix when going non-square).
- `controls.colors`: array of RGB objects with optional weights — works on
  every model; this is how livery palettes are enforced (see the thesis).
- `strength` (image_to_image): 0–1 float, required.
- Upscale: `crisp_upscale` for faithful enlargement (print), `creative_upscale`
  when reinterpretation is acceptable.

## V3 style shortlist (relevant subset)

- Photoreal: `Enterprise`, `Studio photo`, `Natural light`, `Product photo`, `Black & white`
- Illustration: `Color engraving`, `Digital engraving`, `Crosshatch`, `Linocut` (vector), `Engraving` (vector), `Noir`, `Grain`
- Emblem: `Prestige Emblem`, `Stamp`, `Vintage Emblem`
- Vector: `Vector art`, `Line art`, `Editorial`, `Thin`, `Bold stroke`

Full catalog: https://www.recraft.ai/docs/api-reference/styles.md

## Supplier photo restoration pipeline (Register C)

For low-quality supplier photography — restore, never reinvent:

1. `crisp_upscale` — faithful enlargement, the only upscaler permitted on
   product surfaces. `creative_upscale` invents detail → refused on products
   (thesis law), acceptable only on Register-B scenario imagery.
2. `remove_background` — when the product needs isolating.
3. `replace_background` — stages the cut-out onto a prompted ground
   (livery-consistent: warm-white sweep, navy environment). Runs on **V3
   only** — style/`style_id`/`negative_prompt` available here.
4. **Never** run `image_to_image` on supplier product photos — `strength`
   regenerates product surfaces regardless of how low it's set.

Order matters: upscale *before* background removal (edge quality), stage last.
Log original file + each operation in the MANIFEST (restoration provenance).

## Photorealism prompting (Register B quick reference)

`recraftv4_1`, short prompts to explore, then structured to lock. Specify
light source, hour, lens, and weather concretely; no evaluative adjectives.
Livery grade via `controls.colors`. Meta ad sizes: generate nearest supported
size to 1:1 / 4:5 / 9:16, then `crisp_upscale` to final pixels.

## Cost discipline

- `get_user` before any batch of >10 generations.
- V4 Exploration mode (Studio/API): 8 images for 16 credits — cheapest wide sweep.
- V2 < V3 < V4 < V4.1 pro in cost; don't burn pro credits on exploration.
