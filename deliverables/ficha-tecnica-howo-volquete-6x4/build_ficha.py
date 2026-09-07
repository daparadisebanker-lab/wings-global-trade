#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for the Sinotruk HOWO 6x4 dump truck (camión volquete), model ZZ3257N3847B1.

Source: client-supplied project configuration details (text spec list) +
6 WhatsApp photos of the actual unit (dealer lot in China). One lot photo
showing multiple bare chassis with Chinese dealership signage in the
background was left out as too cluttered/unbranded for a client-facing
doc; the other 5 are used, each paired with the section it illustrates
(hero, chassis/hoist-mount detail, hydraulic cylinder, cab interior,
engine-bay/battery side view) — same photo-interleaving approach as the
Prado ficha (deliverables/ficha-tecnica-prado-flagship/).

Several source spec lines were terse, literally-translated Chinese
export-listing English (e.g. "bottom 8 sides 6", "domestic front top 180
cylinder") — interpreted here as: cargo-body plate thickness (floor 8mm /
sides 6mm) and a domestically-made front-mount hydraulic hoist cylinder
with an 180mm bore, both standard ways these specs are phrased on
Sinotruk/HOWO export sheets. "Three pull-out belts" is read as three
retractable seatbelts. These interpretations are flagged in Observaciones
for the client to confirm against the supplier's original sheet.

Run:
  python3 build_ficha.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMG_DIR = HERE / "assets" / "opt"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_NUMBER = "FT-WGT-2026-0909"
DOC_DATE = "07-09-2026"

MODEL_NAME = "Sinotruk HOWO 6x4"
MODEL_TRIM = "Camión Volquete — Modelo ZZ3257N3847B1"

HERO_STATS = [
    ("Potencia máxima", "371 HP"),
    ("Configuración", "6x4"),
    ("Norma de emisiones", "Euro 5"),
    ("Tanque de combustible", "300 L"),
]


def img_uri(name: str) -> str:
    data = (IMG_DIR / f"{name}.jpg").read_bytes()
    return f"data:image/jpeg;base64,{base64.b64encode(data).decode('ascii')}"


# ── Content sequence: hero → (banner|side-image) interleaved with each
# spec section, mapped by what the photo actually shows. ───────────────────
BLOCKS = [
    {"type": "section", "idx": 1, "title": "Identificación", "rows": [
        ("Marca", "Sinotruk HOWO"),
        ("Tipo de vehículo", "Camión volquete (dump truck)"),
        ("Configuración", "6x4"),
        ("Modelo", "ZZ3257N3847B1"),
        ("Cabina", "HW76 (cabina frontal nueva)"),
        ("Color", "Estándar"),
    ]},
    {"type": "section", "idx": 2, "title": "Motor y Transmisión", "rows": [
        ("Motor", "WD615.47"),
        ("Potencia máxima", "371 HP"),
        ("Norma de emisiones", "Euro 5"),
        ("Transmisión", "HW19710"),
        ("Toma de fuerza (PTO)", "HW50, acoplamiento directo"),
    ]},
    {"type": "section", "idx": 3, "title": "Ejes, Tracción y Neumáticos", "rows": [
        ("Eje delantero", "VGD95 (tambor)"),
        ("Eje motriz trasero", "MCX16ZG, doble (tambor)"),
        ("Relación de transmisión del eje", "4.803"),
        ("Neumáticos", "12.00R20, banda mixta, 18PR"),
        ("Dirección", "Bosch"),
        ("Sistema ABS", "No incluye"),
        ("Ruedas", "Reforzadas, delanteras y traseras"),
    ]},
    {"type": "banner", "img": "chasis-detalle", "caption": "Bastidor doble y mecanismo de izaje hidráulico"},
    {"type": "section", "idx": 4, "title": "Chasis y Suspensión", "rows": [
        ("Bastidor", "Doble capa (8+8/300)"),
        ("Suspensión delantera", "Ballestas multihoja reforzadas (10 hojas)"),
        ("Suspensión trasera", "Ballestas multihoja reforzadas (12 hojas)"),
        ("Parachoques", "Metálico, posición alta, con cubierta protectora de luces delanteras y traseras"),
        ("Gancho de remolque trasero", "Sí"),
        ("Guardabarros", "Integral"),
    ]},
    {"type": "section", "idx": 5, "title": "Caja Volcable y Sistema Hidráulico", "side_img": "cilindro-hidraulico",
     "rows": [
        ("Dimensiones interiores (L×A×A)", "5,600 × 2,300 × 1,500 mm"),
        ("Espesor de plancha", "Piso 8 mm / Laterales 6 mm"),
        ("Material de la plancha", "Acero estándar"),
        ("Subchasis", "Rejilla rectangular de 4 vigas longitudinales"),
        ("Cilindro hidráulico de volteo", "Montaje frontal, nacional, diámetro 180 mm"),
    ]},
    {"type": "banner", "img": "cabina-interior", "caption": "Cabina HW76 — puesto de conducción"},
    {"type": "section", "idx": 6, "title": "Cabina y Confort", "rows": [
        ("Asientos", "Principal y auxiliar, tipo ligero"),
        ("Aire acondicionado", "Con calefacción y enfriamiento"),
        ("Tablero de instrumentos", "En inglés"),
        ("Cinturones de seguridad", "Retráctiles (3 unidades)"),
        ("Alarma de retroceso", "Sí"),
        ("Interruptor de arranque/parada inferior", "Opcional"),
    ]},
    {"type": "section", "idx": 7, "title": "Combustible y Sistemas Auxiliares", "side_img": "motor-lateral",
     "rows": [
        ("Tanque de combustible", "300 L"),
        ("Filtro de combustible primario Parker", "Opcional"),
        ("Sistema de admisión de aire", "Versión ingeniería, con filtro de aceite"),
        ("Protección del intercooler", "Sí"),
        ("Depósito de expansión de agua", "Izquierdo y trasero"),
        ("Depósito de aire comprimido", "Sí"),
    ]},
    {"type": "section", "idx": 8, "title": "Equipamiento Estándar Adicional", "rows": [
        ("Extintor", "Sí"),
        ("Caja de baterías", "Con sistema antirrobo"),
        ("Encerado del vehículo", "Tratamiento completo de fábrica"),
        ("Faros delanteros y traseros", "Tipo grande, con cubierta protectora"),
    ]},
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


def block_html(b: dict) -> str:
    if b["type"] == "banner":
        return f"""
  <figure class="pdoc-banner">
    <img src="{img_uri(b['img'])}" alt="" />
    <figcaption>{b['caption']}</figcaption>
  </figure>"""

    # section
    grid = rows_html(b["rows"])
    bar = f'<div class="pdoc-section-bar"><span class="pd-sec-index">{b["idx"]:02d}</span>{b["title"]}</div>'

    if b.get("side_img"):
        body = f"""
    <div class="pdoc-section-split">
      <div class="pdoc-side-img"><img src="{img_uri(b['side_img'])}" alt="" /></div>
      <div class="pdoc-spec-grid pdoc-spec-grid--narrow">
        {grid}
      </div>
    </div>"""
    else:
        body = f'<div class="pdoc-spec-grid">{grid}</div>'

    return f"""
  <div class="pdoc-spec-section">
    {bar}
    {body}
  </div>"""


BLOCKS_HTML = "\n".join(block_html(b) for b in BLOCKS)
HERO_STATS_HTML = "\n      ".join(
    f'<div class="pdoc-hero-stat2"><span class="pd-hero-label2">{label}</span>'
    f'<span class="pd-hero-value2">{value}</span></div>'
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
<title>Ficha Técnica · Wings Global Trade · Sinotruk HOWO 6x4</title>
<style>
  :root {{
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
  }}
  html, body {{ margin: 0; padding: 0; }}
  body {{ background: #52555a; }}
  .pdoc-page {{ min-height: 100vh; padding: 28px 16px 48px; }}
  .pdoc-page .pdoc {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  .pdoc {{
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db;
    --pd-bar: #ececec; --pd-tint: #f7f8f9; --pd-accent: #24417a; --pd-pad-x: 52px;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 22px var(--pd-pad-x) 26px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 30px; font-weight: 600; letter-spacing: -0.01em; line-height: 0.95; }}
  .pdoc-number {{ margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 6px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 46px; width: auto; filter: brightness(0); }}
  .pdoc-tagline {{ font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 10px 0 14px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  /* ── Hero: full-bleed cover photo with overlaid identity + stat strip ── */
  .pdoc-hero-banner {{
    position: relative; margin: 0 calc(var(--pd-pad-x) * -1) 10px; width: calc(100% + var(--pd-pad-x) * 2);
    border-radius: 0 0 16px 16px; overflow: hidden; break-inside: avoid;
  }}
  .pdoc-hero-img {{ width: 100%; height: 258px; object-fit: cover; display: block; }}
  .pdoc-hero-scrim {{
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(8,10,12,.92) 0%, rgba(8,10,12,.55) 34%, rgba(8,10,12,0) 66%);
  }}
  .pdoc-hero-overlay {{ position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 22px 16px; color: #fff; }}
  .pdoc-hero-kicker-text {{ font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #9fb3d9; font-weight: 600; margin-bottom: 6px; display: block; }}
  .pdoc-hero-name2 {{ font-size: 23px; font-weight: 700; letter-spacing: -0.01em; }}
  .pdoc-hero-trim2 {{ margin-top: 2px; font-size: 11.5px; color: rgba(255,255,255,.78); }}
  .pdoc-hero-stats2 {{ display: flex; margin-top: 11px; background: rgba(8,10,12,.5); border-radius: 12px; padding: 8px 6px; }}
  .pdoc-hero-stat2 {{ flex: 1; text-align: center; border-left: 1px solid rgba(255,255,255,.18); padding: 0 4px; }}
  .pdoc-hero-stat2:first-child {{ border-left: none; }}
  .pd-hero-label2 {{ display: block; font-size: 8.5px; letter-spacing: .05em; text-transform: uppercase; color: rgba(255,255,255,.68); }}
  .pd-hero-value2 {{ display: block; margin-top: 2px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 13px; color: #fff; font-variant-numeric: tabular-nums; }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 12px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  /* ── Section bars, numbered for wayfinding ── */
  .pdoc-section-bar {{ background: var(--pd-bar); padding: 6px 12px; margin: 0 0 6px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; break-after: avoid; break-inside: avoid; }}
  .pd-sec-index {{ font-family: var(--font-mono, monospace); color: var(--pd-accent); margin-right: 9px; font-weight: 700; }}
  .pdoc-spec-section {{ margin-bottom: 10px; }}
  .pdoc-spec-grid {{ display: flex; flex-direction: column; padding: 0 4px; font-size: 11.5px; }}
  .spec-row {{ display: grid; grid-template-columns: 250px 1fr; gap: 4.5px 16px; border-bottom: 1px solid var(--pd-tint); padding-bottom: 4.5px; margin-bottom: 4.5px; break-inside: avoid; }}
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

  /* ── Mid-section full-bleed banner with caption pill ── */
  .pdoc-banner {{ position: relative; margin: 4px calc(var(--pd-pad-x) * -1) 14px; width: calc(100% + var(--pd-pad-x) * 2); break-inside: avoid; }}
  .pdoc-banner img {{ width: 100%; height: 168px; object-fit: cover; display: block; }}
  .pdoc-banner figcaption {{
    position: absolute; left: 16px; bottom: 10px; color: #fff; font-size: 10.5px; font-weight: 600;
    background: rgba(8,10,12,.55); padding: 4px 11px; border-radius: 999px; letter-spacing: 0.01em;
  }}

  /* ── Section with a side detail photo ── */
  .pdoc-section-split {{ display: flex; gap: 14px; align-items: flex-start; }}
  .pdoc-side-img {{ width: 168px; flex-shrink: 0; border-radius: 12px; overflow: hidden; break-inside: avoid; }}
  .pdoc-side-img img {{ width: 100%; height: 200px; object-fit: cover; display: block; }}
  .pdoc-spec-grid--narrow {{ flex: 1; min-width: 0; }}
  .pdoc-spec-grid--narrow .spec-row {{ grid-template-columns: 178px 1fr; }}

  .pdoc-tail {{ margin-top: 18px; padding-top: 10px; }}
  .pdoc-note {{ font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 10px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 10px; padding-top: 6px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .spec-row {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-section-split {{ flex-direction: column; }}
    .pdoc-side-img {{ width: 100%; }}
    .pdoc-close-row {{ flex-direction: column; align-items: flex-start; gap: 16px; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
  }}

  @media print {{
    @page {{ size: A4 portrait; margin: 8mm; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{ --pd-pad-x: 0px; max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    .pdoc-close-row, .pdoc-footer {{ break-inside: avoid; }}
  }}
</style>
</head>
<body>
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

  <figure class="pdoc-hero-banner">
    <img class="pdoc-hero-img" src="{img_uri('hero-truck')}" alt="{MODEL_NAME}" />
    <div class="pdoc-hero-scrim"></div>
    <div class="pdoc-hero-overlay">
      <span class="pdoc-hero-kicker-text">Ficha Técnica · Wings Global Trade</span>
      <div class="pdoc-hero-name2">{MODEL_NAME}</div>
      <div class="pdoc-hero-trim2">{MODEL_TRIM}</div>
      <div class="pdoc-hero-stats2">
      {HERO_STATS_HTML}
      </div>
    </div>
  </figure>

  <div class="pdoc-dateline">
    <span>Preparado: {DOC_DATE}</span>
    <span>Origen: China</span>
    <span>Segmento: Camión volquete pesado 6x4</span>
  </div>

  {BLOCKS_HTML}

  <div class="pdoc-tail">
  <p class="pdoc-note">Las especificaciones y fotografías anteriores se presentan como referencia técnica y pueden variar según lote de producción; se recomienda confirmar contra la unidad física antes de la compra. Algunos términos de la ficha de origen (espesor de plancha del volquete, cilindro hidráulico de volteo y cinturones de seguridad) se recibieron en inglés traducido de forma literal desde el chino y fueron interpretados aquí según convenciones habituales de fichas de exportación Sinotruk/HOWO; se recomienda confirmar con el proveedor.</p>
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
n_rows = sum(len(b["rows"]) for b in BLOCKS if b["type"] == "section")
n_photos = len({b["img"] for b in BLOCKS if b["type"] == "banner"} | {b["side_img"] for b in BLOCKS if b.get("side_img")}) + 1
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"sections={sum(1 for b in BLOCKS if b['type']=='section')} rows={n_rows} photos={n_photos}")
