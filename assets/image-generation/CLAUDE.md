# Image generation workshop — Recraft-produced assets for Wings

Read order before generating anything: `spec/WINGS_IMAGE_GENERATION_THESIS.md`
(law — permitted/refused classes, palette, gates), then `RECRAFT-MODELS.md`
here (tool — model ids, prompting, parameters). For catalog/product-card
hero cutouts, `spec/WINGS_CATALOG_HERO_STANDARD.md` (C-HERO) governs on top.
The Mister mark is NEVER generated/traced/vectorized by any model —
registered masters live in `packages/liveries/mister/logo/`, governed by
`spec/MISTER_LOGO_APPLICATION_STANDARD.md` (expressive/ambient behavior:
`spec/MISTER_EXPRESSIVE_LAYER_SPEC.md`).

- The `recraft` MCP server writes raw output to `raw/` in this folder
  (`IMAGE_STORAGE_DIRECTORY` in `~/.claude.json`; changed from the old
  user-global `tools\recraft-images` on 2026-07-07). `raw/` is git-ignored —
  exploration dumps and rejects never enter git history. Move **accepted**
  files into `library/{class}/` here, kebab-case, lane-prefixed:
  `wgt-03-provisions-plate-coffee-01.svg` (`wings-` for house).
- Nothing enters `library/` without passing all six thesis gates, and nothing
  enters without a MANIFEST.md row (file · class · lane · model · seed ·
  prompt · style_id · date · destination). Always set `random_seed`; an
  unlogged seed is a lost asset.
- Default exploration: `recraftv4_1`, `n: 3`, short prompt, livery
  `controls.colors`. Escalate to `_pro` only for accepted directions.
- Three registers (thesis §THE THESIS): A document graphics · B campaign
  photorealism (`library/scenario/`, `library/editorial/`) · C supplier photo
  restoration (`library/supplier-restoration/` — originals kept beside outputs
  as `*-original.*`; crisp_upscale only, never image_to_image on products).
- Check credits (`get_user`) before any batch over 10 generations.
- Serving copies go to `apps/site/public/` (assets/ is never served) —
  optimized per the asset budget, SVG preferred for plates/stamps/cargo.
- V3 custom-style ids are recorded only in MANIFEST.md — losing one means
  regenerating the style from the library set.
- Marketing/ads programs consume `library/` under their own source rules.
  The previous meta-ads program was deleted 2026-07-08 (replacement pending);
  until the new program defines its rules, the evidence rule (no place-claimed
  generated scenario) binds directly from the thesis on any campaign use of
  `library/` assets.
