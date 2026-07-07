# Image generation workshop — Recraft-produced assets for Wings

Read order before generating anything: `spec/WINGS_IMAGE_GENERATION_THESIS.md`
(law — permitted/refused classes, palette, gates), then `RECRAFT-MODELS.md`
here (tool — model ids, prompting, parameters).

- The `recraft` MCP server writes raw output to
  `C:\Users\Muaaz\tools\recraft-images` (user-global env) — never point it at
  the repo. Move **accepted** files into `library/{class}/` here, kebab-case,
  lane-prefixed: `wgt-03-provisions-plate-coffee-01.svg` (`wings-` for house).
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
- The meta-ads program consumes `library/` under its own source rules
  (`marketing/meta-ads-program/05-execution/asset-production-queue.md`,
  global constants) — its evidence rule (no place-claimed generated scenario)
  binds even after an asset passes every gate here. Designated first
  production session: the technical-silhouette batch in that queue's
  pre-production dependency #3.
