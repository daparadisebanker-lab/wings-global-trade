# Brand Assets Manifest — Wings-Mister-Assets

Source of truth for every visual decision. Verified byte-exact from Drive (folder `MISTER ASSETS`, owner aladinimports@gmail.com, 2026-07-23). Repo destination: `/public/brand` (marks, backgrounds) and `/public/fonts` (typeface). The `.design-sync/` + `claude/mister-brand-assets-github` branch may already carry some of these — dedupe on integration.

| File | What it is | Implementation role |
|---|---|---|
| `Wings-Mister-isotipo.pdf/.PNG` (1080²) | Molecular M, flat blue | Source of the canonical dot map (`constellation-map.json`); static fallback <32px |
| `Wings-Mister-isotipo-degradado.pdf/.PNG` | Gradient version | Color law source (per-dot hexes + gradient fit); ≥96px renders |
| `Wings-Mister-isotipo-tramado.pdf/.PNG` | Stippled/dither version | The loading/texture language (condensation, grain overlays) |
| `Wings-Mister-logotipo.pdf/.PNG` (1920×800) | "Mister" wordmark, Space Grotesk | Lockups ≥32px from file; live text below; dot-of-the-i signature moment |
| `Wings-Mister-imagotipo.pdf/.PNG` + `-2/-3.PNG` | Mark + wordmark lockups | Headers, OG images, document frames (min width 120px) |
| `Wings-Mister-colores.pdf` | 5-color palette w/ RGB·CMYK·HEX·Pantone | Token system ground truth (#E1E8F0 · #92C5FC · #3B82F6 · #1384AD · #0F182A) |
| `Space_Grotesk.zip` | Variable + static weights (OFL) | The only product typeface; self-host, tabular numerals for data |
| `Wings-Mister-background_01.PNG` (3508×2480) | Deep-water grain gradient | Reference only — recreate as CSS `--grad-depth` + noise.svg; never shipped |
| `Wings-Mister-background_02.pdf` | Background variant | Same treatment; print contexts |
| `Wings-Mister-Brand_Essential.pdf` (19MB, **not in package** — exceeded transfer limit) | Brand summary | Text extracted and incorporated; obtain full file as visual tie-breaker if needed |

Logo law (from 01-BRAND-FOUNDATION): clear space = largest-dot diameter; isotipo min 24px; imagotipo min 120px; gradient mark never on Fresh Baby Blue fills; tramado is a state/texture, never the primary lockup.
