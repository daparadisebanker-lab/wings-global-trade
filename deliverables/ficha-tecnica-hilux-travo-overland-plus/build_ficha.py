#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for the Toyota Hilux Travo Overland Plus 4TREX — corrected/expanded spec
data supplied by the client, superseding the earlier Hilux Travo Overland
ficha (deliverables/ficha-tecnica-hilux-travo-overland/). Same `pdoc` grid/
logo/footer and audit-informed typography (real type scale, check-badge for
boolean specs). This is a NEW, separate document — the original is untouched.

Photography added 2026-09-05 (client-supplied):
  - Cover: a pre-composed marketing frame (already carries the Wings
    logo, "TOYOTA | HILUX TRAVO OVERLAND" lockup, feature icons and
    tagline baked into the image itself, assets/opt/cover.jpg, square
    1080x1080) — since it's square and the page is a taller A4 portrait,
    it's centered/letterboxed (not cropped) on a charcoal ground sampled
    from the image's own dark tones, following the full-bleed named-page
    `@page cover` pattern established on the KQ280 drone ficha. A slim
    doc-number chip + Wings mark sits in the top letterbox band; a small
    credit line in the bottom band — the image's own baked-in text is
    never overlaid or duplicated.
  - Hero product photo: a studio cutout of the truck (assets/opt/
    hero-cutout.jpg, opaque white background) placed right after the
    identity card, sized by natural aspect (no cropping) in a bordered
    card — same idea as the Prado ficha's photo-interleaving, adapted
    for a product-render image rather than in-context photography
    (the Prado's full-bleed `object-fit:cover` banner treatment isn't a
    good fit for a cutout render, so it uses object-fit:contain-style
    sizing instead). The client also supplied a transparent-background
    export of the same render (near-identical to the white-background
    one) — not used, to avoid a duplicate photo in the doc.
Run:
  python3 build_ficha.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMG_DIR = HERE / "assets" / "opt"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"


def img_b64(name: str) -> str:
    return base64.b64encode((IMG_DIR / name).read_bytes()).decode("ascii")


COVER_B64 = img_b64("cover.jpg")
HERO_PHOTO_B64 = img_b64("hero-cutout.jpg")

DOC_NUMBER = "FT-WGT-2026-0826"
DOC_DATE = "26-08-2026"

MODEL_NAME = "Toyota Hilux Travo Overland Plus 4TREX"
MODEL_TRIM = "2.8L Diésel · 4WD · Automática de 6 velocidades"

HERO_STATS = [
    ("Potencia máxima", "204 PS"),
    ("Torque máximo", "500 N·m"),
    ("Transmisión", "6AT"),
    ("Tracción", "4WD · LHD"),
]

# ── Section groups: (idx, título, [(etiqueta, valor), ...]) ────────────────
SECTIONS = [
    (1, "Identificación", [
        ("Modelo", "Toyota Hilux Travo Overland Plus"),
        ("Versión", "2.8L Diésel · 4WD · Automática de 6 velocidades"),
        ("Carrocería", "Pickup, 4 puertas, doble cabina"),
        ("Tipo de combustible", "Diésel"),
        ("Fabricante", "Toyota"),
        ("Posición del volante", "Izquierdo (LHD) — confirmado por proveedor"),
    ]),
    (2, "Dimensiones y Pesos", [
        ("Longitud × Ancho × Alto (mm)", "5,320 × 1,885 × 1,865"),
        ("Distancia entre ejes (mm)", "3,085"),
    ]),
    (3, "Motor y Transmisión", [
        ("Modelo de motor", "1GD-FTV (High)"),
        ("Tipo de motor",
         "2.8L Diésel, 4 cilindros, 16 válvulas DOHC, turbo de boquilla variable con intercooler enfriado por aire"),
        ("Cilindrada (cc)", "2,755"),
        ("Potencia máxima", "204 PS / 3,000–3,400 rpm"),
        ("Torque máximo", "500 N·m / 1,600–2,800 rpm"),
        ("Transmisión", "Automática de 6 velocidades"),
        ("Dirección", "Asistencia eléctrica (EPS)"),
        ("Diferencial", "Bloqueo trasero"),
    ]),
    (4, "Chasis, Frenos y Neumáticos", [
        ("Frenos (Delanteros)", "Discos ventilados"),
        ("Frenos (Posteriores)", "Discos ventilados"),
        ("Suspensión", "Delantera doble horquilla / Trasera ballestas de eje rígido"),
        ("Neumáticos / Aros", "265/60 R18 aleación"),
    ]),
    (5, "Seguridad Activa y Asistencia a la Conducción", [
        ("Toyota Safety Sense (TSS)", "Sí"),
        ("Frenos antibloqueo (ABS) con Distribución electrónica de frenado (EBD)", "Sí"),
        ("Control de estabilidad (VSC) con Asistencia de frenado (BA)", "Sí"),
        ("Asistencia de ascenso (HAC)", "Sí"),
        ("Control crucero", "Dynamic Radar Cruise Control (adaptativo)"),
        ("Monitor de punto ciego (BSM)", "Sí"),
        ("Alerta de tráfico cruzado trasero (RCTA)", "Sí"),
        ("Sistema de pre-colisión (PCS)", "Sí"),
        ("Alerta de cambio de carril (LDA)", "Sí"),
        ("Cámara", "Panoramic View Monitor"),
        ("Sensores de estacionamiento", "Delanteros 4 / Traseros 4"),
        ("Sistema de seguridad Toyota (TVSS)", "Inmovilizador + bocina"),
    ]),
    (6, "Seguridad Pasiva", [
        ("Airbags SRS", "Conductor, rodilla del conductor, copiloto, laterales, cortina (7 en total)"),
        ("Cinturones delanteros", "3 puntos ELR + pretensor + limitador de fuerza"),
        ("Cinturones traseros", "3 puntos ELR x3"),
        ("Sistema de retención infantil", "ISOFIX x2 + anclaje de correa x2"),
    ]),
    (7, "Equipamiento Interior", [
        ("Asientos (Material)", "Cuero sintético"),
        ("Asiento del conductor", "Ajuste eléctrico de 8 direcciones"),
        ("Asiento del copiloto", "Ajuste manual, 4 direcciones"),
        ("Asiento trasero", "División 60:40"),
        ("Volante", "Dirección asistida eléctrica"),
        ("Controles en el volante",
         "Audio, teléfono, pantalla, control por voz, control crucero, asistencia de mantenimiento de carril"),
        ("Portavasos/Portabotellas", "6 portavasos / 4 portabotellas"),
        ("Pantalla multiinformación (MID)", "12.3\" TFT"),
        ("Espejo retrovisor interior", "Auto-atenuante"),
        ("Aire acondicionado", "Climatizador automático de doble zona"),
        ("Módulo de comunicación de datos", "Con función remota (próximamente)"),
        ("Asistencia de elevación del capó", "Sí"),
        ("Sistema de audio", "Pantalla de 12.3\" con 8 parlantes"),
        ("Función de audio", "Apple CarPlay y Android Auto inalámbricos"),
        ("Toma de 12V", "1"),
        ("Ventanas eléctricas", "Subida/bajada automática con protección anti-atrapamiento"),
        ("Seguro de puertas", "Sensible a la velocidad"),
        ("Entrada sin llave", "Smart Entry"),
        ("Encendido", "Botón de arranque (Push Start)"),
    ]),
    (8, "Equipamiento Exterior e Iluminación", [
        ("Faros", "LED con nivelación automática"),
        ("Luces diurnas (DRL)", "LED"),
        ("Faros antiniebla delanteros", "LED"),
        ("Guardabarros", "Incluidos"),
        ("Limpiaparabrisas delantero", "Intermitente + ajuste de tiempo"),
        ("Luces traseras combinadas", "LED"),
        ("Espejos exteriores", "Ajuste eléctrico + plegado eléctrico"),
    ]),
]


def value_html(value: str) -> str:
    """Boolean specs get a check badge instead of plain 'Sí' text — same
    scannability fix applied throughout the ficha family."""
    if value.startswith("Sí"):
        rest = value[2:].lstrip(",").strip()
        detail = f' <span class="spec-detail">{rest}</span>' if rest else ""
        return f'<span class="spec-check" aria-hidden="true">✓</span><span class="spec-affirm">Sí</span>{detail}'
    return value


def rows_html(rows: list[tuple[str, str]]) -> str:
    return "\n".join(
        f'<div class="spec-row"><span class="spec-label">{label}</span>'
        f'<span class="spec-value">{value_html(value)}</span></div>'
        for label, value in rows
    )


def section_html(idx: int, title: str, rows: list[tuple[str, str]]) -> str:
    grid = rows_html(rows)
    return f"""
  <div class="pdoc-spec-section">
    <div class="pdoc-section-bar">
      <span class="pd-sec-index">{idx:02d}</span>
      <span class="pd-sec-title">{title}</span>
    </div>
    <div class="pdoc-spec-grid">
      {grid}
    </div>
  </div>"""


SECTIONS_HTML = "\n".join(section_html(idx, title, rows) for idx, title, rows in SECTIONS)
HERO_STATS_HTML = "\n      ".join(
    f'<div class="pdoc-hero-stat"><span class="pd-hero-label">{label}</span>'
    f'<span class="pd-hero-value">{value}</span></div>'
    for label, value in HERO_STATS
)

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ficha Técnica · Wings Global Trade · Toyota Hilux Travo Overland Plus 4TREX</title>
<style>
  :root {{
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
  }}
  html, body {{ margin: 0; padding: 0; }}
  body {{ background: #52555a; }}
  .pdoc-page {{ min-height: 100vh; padding: 28px 16px 48px; }}
  .pdoc-page .pdoc {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}
  .pdoc-page.cover-page {{ padding: 0; }}
  .pdoc-page.cover-page .pdoc-cover {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  /* ── Cover: full marketing frame, letterboxed on its own charcoal ground ── */
  .pdoc-cover {{
    position: relative; width: 100%; max-width: 820px; margin: 0 auto;
    aspect-ratio: 820 / 1160; overflow: hidden; background: #15171b;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: var(--font-ui, system-ui, sans-serif);
  }}
  .pdoc-cover img {{ width: 100%; height: auto; display: block; }}
  .cover-frame-top {{
    position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center;
    justify-content: flex-end; padding: 22px 30px;
  }}
  .cover-doc-chip {{
    color: rgba(255,255,255,0.85); font-family: var(--font-mono, monospace); font-size: 10.5px;
    letter-spacing: 0.03em; background: rgba(255,255,255,0.12); padding: 5px 10px; border-radius: 3px;
  }}
  .cover-frame-bottom {{
    position: absolute; bottom: 0; left: 0; right: 0; text-align: center; padding: 18px 30px 22px;
    color: rgba(255,255,255,0.55); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
  }}

  /* ── Hero product photo: studio cutout on white, no crop ── */
  .pdoc-hero-photo {{ border: 1px solid var(--pd-line); border-radius: 12px; padding: 10px; margin-bottom: 12px; break-inside: avoid; }}
  .pdoc-hero-photo img {{ width: 100%; height: auto; display: block; border-radius: 6px; }}
  .pdoc-hero-photo figcaption {{ margin: 8px 2px 0; font-size: 10.5px; color: var(--pd-muted); font-style: italic; text-align: center; }}

  .pdoc {{
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db;
    --pd-bar: #f4f5f4; --pd-tint: #f7f8f9; --pd-accent: #24417a; --pd-pad-x: 52px;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 24px var(--pd-pad-x) 26px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  /* ── Masthead: heaviest weight on the page — nothing else competes ── */
  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; line-height: 0.92; }}
  .pdoc-number {{ margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 6px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 46px; width: auto; filter: brightness(0); }}
  .pdoc-tagline {{ font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 10px 0 16px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-accent); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 14px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  /* ── Identity card: second-heaviest weight, clearly a step below the masthead ── */
  .pdoc-hero {{ border: 1px solid var(--pd-line); border-top: 3px solid var(--pd-accent); padding: 14px 18px; margin-bottom: 12px; break-inside: avoid; }}
  .pdoc-hero-name {{ font-size: 25px; font-weight: 800; letter-spacing: -0.015em; }}
  .pdoc-hero-trim {{ margin-top: 3px; font-size: 12.5px; color: var(--pd-muted); }}
  .pdoc-hero-stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 11px; }}
  .pdoc-hero-stat {{ border-top: 2px solid var(--pd-ink); padding-top: 7px; }}
  .pd-hero-label {{ display: block; font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pd-muted); }}
  .pd-hero-value {{ display: block; margin-top: 2px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 13.5px; white-space: nowrap; font-variant-numeric: tabular-nums; }}

  /* ── Section bar: numeral as a real wayfinding rail, title one clear step down from the hero ── */
  .pdoc-section-bar {{
    display: flex; align-items: baseline; gap: 10px; background: var(--pd-bar);
    border-left: 3px solid var(--pd-accent); padding: 6px 12px; margin: 0 0 6px;
    break-after: avoid; break-inside: avoid;
  }}
  .pd-sec-index {{ font-family: var(--font-mono, monospace); font-weight: 700; font-size: 15px; color: var(--pd-accent); }}
  .pd-sec-title {{ font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }}

  .pdoc-spec-section {{ margin-bottom: 10px; }}
  .pdoc-spec-grid {{ display: flex; flex-direction: column; padding: 0 4px; font-size: 11.5px; }}
  .spec-row {{ display: grid; grid-template-columns: 260px 1fr; align-items: start; gap: 4.5px 16px; border-bottom: 1px solid var(--pd-tint); padding-bottom: 4.5px; margin-bottom: 4.5px; break-inside: avoid; }}
  .spec-label {{ font-weight: 600; color: var(--pd-ink); }}
  .spec-value {{ color: var(--pd-ink); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }}

  /* ── Boolean rows: a check badge instead of repeating "Sí" ── */
  .spec-check {{
    display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;
    border-radius: 3px; background: var(--pd-accent); color: #fff; font-size: 10px; font-weight: 700;
    flex-shrink: 0; line-height: 1;
  }}
  .spec-affirm {{ font-weight: 600; }}
  .spec-detail {{ color: var(--pd-muted); }}

  .pdoc-tail {{ margin-top: 20px; padding-top: 10px; }}
  .pdoc-note {{ font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 10px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 10px; padding-top: 6px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .pdoc-hero-stats {{ grid-template-columns: repeat(2, 1fr); }}
    .spec-row {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-close-row {{ flex-direction: column; align-items: flex-start; gap: 16px; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 8mm; }}
    @page cover {{ margin: 0; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{ --pd-pad-x: 0px; max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    .pdoc-close-row, .pdoc-footer {{ break-inside: avoid; }}
    .cover-page {{ page: cover; break-after: page; }}
    .pdoc-page.cover-page .pdoc-cover {{ box-shadow: none; }}
    .pdoc-cover {{
      max-width: none; width: 100%; height: 100vh; aspect-ratio: auto;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }}
  }}
</style>
</head>
<body>

<div class="pdoc-page cover-page">
  <div class="pdoc-cover">
    <div class="cover-frame-top">
      <span class="cover-doc-chip">{DOC_NUMBER}</span>
    </div>
    <img src="data:image/jpeg;base64,{COVER_B64}" alt="{MODEL_NAME} en terreno" />
    <div class="cover-frame-bottom">Wings Global Trade · Soluciones Integrales en Importación</div>
  </div>
</div>

<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <h1 class="pdoc-title">Ficha Técnica</h1>
      <p class="pdoc-number">{DOC_NUMBER}</p>
    </div>
    <div class="pdoc-brand">
      {LOGO}
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Preparado: {DOC_DATE}</span>
    <span>Origen: China</span>
    <span>Segmento: Pickup 4x4</span>
  </div>

  <div class="pdoc-hero">
    <div class="pdoc-hero-name">{MODEL_NAME}</div>
    <div class="pdoc-hero-trim">{MODEL_TRIM}</div>
    <div class="pdoc-hero-stats">
      {HERO_STATS_HTML}
    </div>
  </div>

  <figure class="pdoc-hero-photo">
    <img src="data:image/jpeg;base64,{HERO_PHOTO_B64}" alt="{MODEL_NAME}" />
    <figcaption>Toyota Hilux Travo Overland Plus 4TREX — vista frontal 3/4</figcaption>
  </figure>

  {SECTIONS_HTML}

  <div class="pdoc-tail">
  <p class="pdoc-note">Las especificaciones anteriores se presentan como referencia técnica y pueden variar según lote de producción; se recomienda confirmar contra la unidad física antes de la compra.</p>
  <div class="pdoc-close-row">
    <div class="pdoc-close">
      <div>Atentamente,</div>
      <div class="pdoc-close-signoff">WINGS GLOBAL TRADE</div>
    </div>
  </div>

  <footer class="pdoc-footer">
    <div>
      <div>¿Consultas? · importaciones@wingsglobaltrade.com</div>
      <div>Tel: +507 6025-07</div>
    </div>
    <div class="pd-foot-right">
      <div>wingsglobaltrade.com</div>
    </div>
  </footer>
  </div>

</article>
</div>
</body>
</html>
"""

out = HERE / "ficha.html"
out.write_text(HTMLDOC, encoding="utf-8")
n_rows = sum(len(rows) for _, _, rows in SECTIONS)
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"sections={len(SECTIONS)} rows={n_rows}")
