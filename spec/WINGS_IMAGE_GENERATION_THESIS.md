# Wings Global Trade — Image Generation Thesis
**Authority document for all AI-generated and AI-processed imagery.
Subordinate to `WINGS_VISUAL_THESIS.md` (as amended 2026-07) — where they
conflict, the parent thesis wins.**

---

## THE THESIS

> **"The dossier is drawn; the campaign is shot; the evidence is real.
> Wings generates scenario, restores documentation, and never fabricates
> proof."**

Three registers, three laws:

| Register | Surface | Law |
|---|---|---|
| **A — The Document** | apps/site product surfaces: catalog, spec sheets, lane pages, FillMeter, stamps | Constructed graphics only — plates, charts, seals. Nothing photographic-passing is *generated* here. |
| **B — The Campaign** | Marketing: Meta ads, social, decks, landing heroes, `marketing/meta-ads-program/` | Photorealism permitted — art-directed, livery-graded, scenario imagery. |
| **C — The Evidence** | Supplier product photography, wherever it appears | Always real photography at origin. Restored and staged by pipeline — never reinvented. |

---

## WHY THE LINE SITS WHERE IT DOES

The reader Wings is built for *"trusts data and distrusts marketing."* The
one thing that can never be generated is **evidence** — an image that makes a
factual claim about the goods, a supplier's facility, or work Wings has done.
A buyer who discovers one fabricated weld seam distrusts every number on the
page, and the asset Wings sells is certainty.

But a campaign image of containers at dusk makes no factual claim — it sets a
register. Generated photorealism is legitimate there for the same reason
commissioned brand photography would be: it is art direction, not proof.

**The rule in one line: scenario may be generated; evidence may not.**

---

## REGISTER A — THE DOCUMENT (constructed graphics)

Unchanged law: on product-truth surfaces, generated imagery is openly
constructed — the engraved-certificate register (banknote engraving, Lloyd's
documents, patent plates, nautical charts). Its authority comes from visible
craft, not simulation.

| # | Class | What it is | Route |
|---|---|---|---|
| 1 | **Technical plates** | Machinery line-art, exploded views, cutaways | `recraftv4_1_vector`; V3 `Digital engraving`/`Crosshatch` |
| 2 | **Cartography** | Trade lanes, ports, routes, terrain as chart drawings | `recraftv4_1` / `recraftv4` |
| 3 | **Stamps, seals, emblems** | LaneStamp material, marks *of Wings' own devising* | V3 `Stamp`/`Prestige Emblem`, or `recraftv4_1_vector` |
| 4 | **Cargo illustration** | FillMeter cargo sets to the shared container grammar | `recraftv4_1_utility_vector` → vectorize → manual grammar cleanup |
| 5 | **Texture grounds** | Texture-library members only, ≤ perceptual 5% | `recraftv4_1` seamless prompts |
| 6 | **Diagram bases** | Infographic/poster compositions, ES text in quotes | `recraftv4` or V3 + `text_layout` |

## REGISTER B — THE CAMPAIGN (photorealism)

Permitted classes:

| # | Class | What it is | Route |
|---|---|---|---|
| 7 | **Scenario photography** | Ports, container yards, machinery in environment, Andean terrain, cargo in transit — mood and register for marketing | `recraftv4_1` (short prompts to explore, structured to lock); `_pro` for print/large-format |
| 8 | **Editorial illustration** | Campaign creative that reads as illustration | `recraftv4_1`; V3 custom style once the language settles |
| 9 | **Staged product settings** | Restored supplier photos (Register C) composited onto generated grounds | `remove_background` → `replace_background` (V3) |

Rules of the register — all mandatory:

1. **No fabricated evidence.** The specific SKU, a supplier's actual facility,
   a real port's signage, work Wings claims to have done — never rendered
   as-if-photographed. Generic scenario (a container yard, a machine class in
   environment) is fine; a *claim* is not.
2. **No invented people.** Faces, operators, teams, testimonials stay refused.
   If a campaign needs humans, that is real photography — raise it, don't
   generate it. (Also the pragmatic reading: AI faces are exactly what Meta's
   audience has learned to detect and discount.)
3. **Documentary-industrial art direction.** Prompt concretely per V4.1
   guidance — light source, hour, lens, weather — never "stunning cinematic."
   The reference is commissioned industrial photography (Andreas Gursky's
   logistics scale, Salgado's work-dignity, corporate annual-report craft of
   the 1970s), not stock and not fantasy.
4. **Livery-graded.** Pass livery tokens as `controls.colors`; grade toward
   navy shadows, warm-white highlights, gold as scarce accent. A Wings
   campaign image should be attributable with the logo off.
5. **Wholesale register.** No retail-lifestyle scenes, no smiling consumers.
   The campaign sells capacity and certainty, not unboxings.
6. **Meta formats:** generate closest supported size to 1:1 (1080²), 4:5
   (1080×1350), 9:16 (1080×1920); `crisp_upscale` to final pixel size.

## REGISTER C — THE EVIDENCE (supplier photo restoration)

Supplier photography is often low-quality. It gets **restored, never
reinvented**:

- **Pipeline:** original → `crisp_upscale` (faithful enlargement) →
  `remove_background` where staging is needed → `replace_background` onto
  livery-consistent grounds (warm-white sweep, navy environment) →
  export.
- **`creative_upscale` is refused on product surfaces.** It invents detail;
  invented detail on goods offered wholesale is misrepresentation. Faithful
  `crisp_upscale` only.
- **Never alter the product:** no geometry, color, badge, or condition
  changes. `image_to_image` on a supplier photo is refused for the same
  reason.
- Restored-and-staged supplier photos may serve as **primary product
  images** (parent thesis amended 2026-07 to permit faithful restoration).
- Manifest logs the original file, every operation applied, and the supplier
  source — restoration provenance is the audit trail if a buyer ever asks.

## REFUSED — all registers, categorical

- Fabricated evidence (rule B-1 above) — anywhere, including decks.
- Invented people.
- Real-world marks: certification logos, port-authority signage, client or
  competitor brands. Wings' own stamps only.
- `creative_upscale` or generative editing on supplier product photography.
- Gradient meshes, ambient decoration, retail-lifestyle scenes.
- In-image UI text. Only *drawn* type (stamps, plates, chart labels) or
  campaign display type may be baked in — Spanish first, verified
  character-by-character including diacritics (ñ á é í ó ú).

## PALETTE LAW

Generated imagery consumes the livery, never invents color. `controls.colors`
on every generation; palette constraint repeated in the prompt. House livery
(source of truth: `packages/liveries/wings/livery.css`):

| Token | Hex | RGB for `controls.colors` |
|---|---|---|
| Navy (ink/authority) | `#001E50` | `{r:0, g:30, b:80}` |
| Gold (annotation/precision) | `#C4933F` | `{r:196, g:147, b:63}` |
| Warm white (paper) | `#F8F6F0` | `{r:248, g:246, b:240}` |

Gold is annotation, not glow — in Register B it is the scarce accent (a
painted line on a machine, low sun on steel), never a wash. Pure black and
pure white stay refused. When lanes WGT/01–06 onboard, each lane generates
from its registered livery (`packages/liveries/registry.md`).

## CONSISTENCY MECHANISM

1. Explore with V4.1 (`n` 3–6) until a class language settles.
2. At **≥5 accepted assets** of a class, distill a V3 custom style
   (`create_style`), record `style_id` in the MANIFEST.
3. That class then generates through its `style_id`. New exploration requires
   a reason, not a mood.

## ACCEPTANCE GATES (all must pass before an asset leaves `assets/`)

1. **Register test** — A: could it be tipped into a certified dossier?
   B: could it pass as commissioned industrial photography for this brand?
   C: is it faithful to the original in every product detail?
2. **Evidence test** — does it make a factual claim it cannot back? Kill it.
3. **Palette audit** — livery colors only; grading toward navy/warm-white/gold.
4. **Artifact scan at 200%** — melted lines, phantom letters, impossible
   mechanics (hydraulics, cables, tread patterns get special scrutiny in B).
5. **Parent test** — certified document, not marketplace listing.
6. **Awwwards clause** — one deliberate moment of tension, or regenerate.

## PROVENANCE

Every accepted asset gets a MANIFEST.md row: file, class, register, lane,
model, seed, prompt (or source file + operations for Register C), style_id,
date, destination. An asset without a manifest row does not ship. Generated
scenario imagery is never captioned or alt-texted as documentary photography
of Wings operations.

---

*Maintained in: `spec/WINGS_IMAGE_GENERATION_THESIS.md` · Created July 2026,
registers restructured 2026-07 (photorealism + supplier restoration added).*
*Operations: `assets/image-generation/CLAUDE.md` · Models: `assets/image-generation/RECRAFT-MODELS.md`*
