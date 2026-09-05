#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for the Toyota Land Cruiser Prado 2026 2.4T Híbrido — versión tope de gama
(Flagship VX). Pure specifications, no pricing, no supplier named — reuses
the `pdoc` grid/layout/logo from the quotation deliverables.

v2: real vehicle photography paired deliberately with the spec section it
supports (hero banner, mid-section banners, side images, equipment
galleries) instead of a flat list of tables. Images live in assets/opt/
(pre-optimized JPEGs; three are hand-cropped details, three had a
watermarked placeholder plate digitally blanked — see assets/ for the
originals). Self-contained HTML (logo + photos inlined as data URIs). Run:
  python3 build_ficha.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMG_DIR = HERE / "assets" / "opt"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_NUMBER = "FT-WGT-2026-0807"
DOC_DATE = "07-08-2026"

MODEL_NAME = "Toyota Land Cruiser Prado 2026"
MODEL_TRIM = "2.4T Híbrido · Versión tope de gama (Flagship VX)"

HERO_STATS = [
    ("Potencia combinada", "243 kW"),
    ("Tracción", "4WD tiempo completo"),
    ("Transmisión", "8AT"),
    ("Plazas", "5 (2+3)"),
]


def img_uri(name: str) -> str:
    data = (IMG_DIR / f"{name}.jpg").read_bytes()
    return f"data:image/jpeg;base64,{base64.b64encode(data).decode('ascii')}"


# ── Content sequence: hero → (banner|side-image|gallery) interleaved with
# each spec section, mapped by what the photo actually shows. ──────────────
BLOCKS = [
    {"type": "section", "idx": 1, "title": "Identificación", "rows": [
        ("Modelo", MODEL_NAME),
        ("Versión", MODEL_TRIM),
        ("Carrocería", "SUV, 5 puertas, 5 plazas"),
        ("Tipo de energía", "Híbrido gasolina-eléctrico (HEV)"),
        ("Fabricante", "Toyota"),
        ("Fecha de introducción", "05/2026"),
    ]},
    {"type": "banner", "img": "image3", "caption": "Perfil lateral — proporciones y distancia entre ejes"},
    {"type": "section", "idx": 2, "title": "Dimensiones y Pesos", "rows": [
        ("Longitud (mm)", "4,935"),
        ("Ancho (mm)", "1,980"),
        ("Alto (mm)", "1,935"),
        ("Distancia entre ejes (mm)", "2,850"),
        ("Trocha delantera / trasera (mm)", "1,664 / 1,668"),
        ("Ángulo de ataque / salida (°)", "31.0 / 22.0"),
        ("Peso en orden de marcha (kg)", "2,530"),
        ("Peso bruto vehicular (kg)", "3,050"),
        ("Capacidad del tanque de combustible (L)", "68.0"),
    ]},
    {"type": "banner", "img": "image6", "caption": "Motor 2.4L Turbo Híbrido — cableado de alto voltaje"},
    {"type": "section", "idx": 3, "title": "Motor de Combustión y Transmisión", "rows": [
        ("Tipo", "T24A Turbocargado"),
        ("Cilindrada (cm³)", "2,393 (2.4 L)"),
        ("Número de cilindros", "4 en línea"),
        ("Válvulas", "16, DOHC"),
        ("Potencia motor de combustión (HP / RPM)", "282 / 6,000"),
        ("Torque motor de combustión (N·m / RPM)", "430 / 1,700–3,600"),
        ("Combustible recomendado", "Gasolina 95 octanos"),
        ("Transmisión (Tipo)", "8AT"),
        ("Transmisión (Secuencial)", "De 8 velocidades, modo manual con levas"),
    ]},
    {"type": "section", "idx": 4, "title": "Sistema Híbrido", "rows": [
        ("Motor eléctrico (Potencia)", "54 HP (40 kW)"),
        ("Motor eléctrico (Torque)", "290 N·m"),
        ("Potencia combinada del sistema", "243 kW"),
        ("Torque combinado del sistema", "630 N·m"),
        ("Batería", "Níquel-Metal Hidruro (NiMH), celdas PRIMEARTH"),
        ("Consumo combinado WLTC (L/100 km)", "10.11"),
        ("Garantía batería híbrida", "8 años o 200,000 km"),
        ("Garantía vehículo", "3 años o 100,000 km"),
    ]},
    {"type": "banner", "img": "image9", "caption": "Selector de modos de manejo y tracción 4WD"},
    {"type": "section", "idx": 5, "title": "Chasis y Tracción", "rows": [
        ("Tracción", "4WD tiempo completo (Full-time AWD)"),
        ("Diferencial central", "Torsen, con bloqueo"),
        ("Diferencial trasero", "Autoblocante (limited-slip)"),
        ("Reductora", "Sí, doble rango (alta / baja)"),
        ("Suspensión (Delantera)", "Independiente, doble horquilla"),
        ("Suspensión (Posterior)", "Eje rígido, no independiente"),
        ("Suspensión regulable", "Modo suave / firme"),
        ("Dirección", "Asistencia eléctrica"),
        ("Modos de manejo", "5 modos: Normal, Eco, Deportivo, Nieve, Todo terreno"),
    ]},
    {"type": "section", "idx": 6, "title": "Carrocería, Frenos y Neumáticos", "side_img": "crop_wheel",
     "rows": [
        ("Frenos (Delanteros)", "Discos ventilados"),
        ("Frenos (Posteriores)", "Discos ventilados"),
        ("Freno de estacionamiento", "Electrónico"),
        ("Neumáticos (Medida)", "265/60 R20"),
        ("Aros", "Aleación, 20\""),
        ("Neumático de repuesto", "Medida completa, aleación, bajo la carrocería"),
    ]},
    {"type": "section", "idx": 7, "title": "Seguridad y Asistencia a la Conducción", "rows": [
        ("Airbags", "Delanteros, cortina lateral, rodillas (piloto y copiloto), central"),
        ("Frenos antibloqueo (ABS) / EBD / BA", "Sí"),
        ("Control de tracción (TRC) / Estabilidad (VSC)", "Sí"),
        ("Asistencia de ascenso (HAC) / descenso (DAC)", "Sí"),
        ("AUTOHOLD", "Sí"),
        ("Cámaras", "Visión 360°, 6 cámaras exteriores + sensores de proximidad"),
        ("Radares", "8 ultrasónicos + 5 de onda milimétrica"),
        ("Sistema de pre-colisión (PCS) con frenado autónomo", "Sí"),
        ("Alerta y mantenimiento de carril (LDA / LKA) + centrado", "Sí"),
        ("Crucero adaptativo de rango completo (ACC)", "Sí"),
        ("Asistente de cambio de carril automático", "Sí"),
        ("Nivel de asistencia a la conducción", "Nivel 2 (SAE)"),
        ("Reconocimiento de señales de tránsito", "Sí"),
        ("Monitor de fatiga del conductor (DMS)", "Sí"),
        ("Alerta de apertura de puertas (DOW)", "Sí"),
        ("Sensor de presión de neumáticos (TPMS)", "Sí, con indicación de presión"),
        ("Sistema ISOFIX", "Sí"),
    ]},
    {"type": "banner", "img": "image8", "caption": "Cabina — pantalla táctil de 12.3\" e instrumental digital"},
    {"type": "section", "idx": 8, "title": "Equipamiento Interior", "rows": [
        ("Aire acondicionado", "Climatizador automático, trizona"),
        ("Ventilación trasera independiente", "Sí"),
        ("Filtro de habitáculo PM2.5", "Sí"),
        ("Asientos (Material)", "Cuero genuino"),
        ("Asientos (Disposición)", "2+3 (5 plazas)"),
        ("Asiento piloto", "Eléctrico, ventilado, calefaccionado, con memoria"),
        ("Asiento copiloto", "Eléctrico, ventilado, calefaccionado"),
        ("Asientos traseros", "Abatibles 40:60, calefaccionados"),
        ("Volante (Material)", "Cuero"),
        ("Volante (Ajuste)", "Eléctrico, en altura y profundidad"),
        ("Volante (Funciones)", "Multifunción, levas de cambio, memoria, calefacción"),
        ("Instrumental", "Pantalla digital LCD de 12.3\""),
        ("Pantalla central multimedia", "Táctil, 12.3\""),
        ("Sistema de audio (Marca)", "JBL"),
        ("Conectividad de teléfono", "Apple CarPlay®, HUAWEI HiCar, Carlink"),
        ("Red móvil integrada", "4G, actualizaciones OTA"),
        ("Cargador inalámbrico", "Sí (fila delantera)"),
        ("Entradas USB Tipo-C", "3 delanteras + 2 traseras"),
        ("Tomacorriente 110V / 220V / 230V", "Sí"),
        ("Frigobar (Cool box)", "Sí, función de refrigeración"),
        ("Portón / compuerta trasera", "Eléctrico, con sensor y memoria de posición"),
        ("Llave", "Inteligente + Bluetooth por teléfono"),
        ("Encendido / arranque sin llave", "Sí, con arranque remoto"),
        ("Reconocimiento facial", "Sí"),
        ("Control por voz", "Sí (\"Hola, Toyota\")"),
        ("Head-Up Display (HUD)", "Sí"),
        ("Techo solar", "Panorámico, eléctrico, abrible"),
    ], "gallery": [
        ("image10", "Asiento delantero — cuero"),
        ("image11", "Asientos traseros"),
        ("image13", "Techo solar panorámico"),
        ("image12", "Consola trasera"),
    ]},
    {"type": "banner", "img": "image4", "caption": "Iluminación LED y equipamiento exterior"},
    {"type": "section", "idx": 9, "title": "Equipamiento Exterior e Iluminación", "rows": [
        ("Faros delanteros (Tipo)", "LED tipo proyector"),
        ("Luces altas / bajas adaptativas", "Automáticas"),
        ("Luces diurnas (DRL)", "LED"),
        ("Faros antiniebla (Delanteros)", "LED"),
        ("Antena", "Aleta de tiburón"),
        ("Espejos retrovisores exteriores",
         "Eléctricos, plegables, calefaccionados, con memoria e inclinación automática en reversa"),
        ("Espejo retrovisor interior", "Antidestello automático"),
        ("Parabrisas", "Laminado"),
        ("Lunas laterales y posterior", "Templadas, con tinte y protección UV"),
        ("Limpiaparabrisas", "Sensor de lluvia; trasero con función intermitente"),
        ("Estribos laterales", "Fijos"),
        ("Riel de techo", "Sí"),
    ], "gallery": [
        ("image5", "Techo solar y rieles"),
        ("image17", "Portón eléctrico"),
        ("image16", "Maletero — acceso"),
        ("image15", "Maletero — capacidad"),
    ]},
    {"type": "section", "idx": 10, "title": "Tecnología e Inteligencia Vehicular", "side_img": "crop_screen",
     "rows": [
        ("Chip del sistema multimedia", "Qualcomm Snapdragon 8155"),
        ("Cámaras exteriores", "6 unidades (incluye visión 360°)"),
        ("Radares ultrasónicos / de onda milimétrica", "8 / 5"),
        ("Llave digital vía app", "Sí"),
        ("Monitoreo remoto vía app",
         "Sí (estado del vehículo, control remoto, citas de servicio)"),
    ]},
]


def value_html(value: str) -> str:
    """Boolean specs get a check badge instead of plain 'Sí' text — same
    scannability fix already applied on the Travo Overland Plus ficha."""
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
    gallery_html = ""
    if b.get("gallery"):
        items = "\n".join(
            f'<div class="pdoc-gallery-item"><img src="{img_uri(img)}" alt="" />'
            f'<span class="pdoc-gallery-cap">{cap}</span></div>'
            for img, cap in b["gallery"]
        )
        gallery_html = f'<div class="pdoc-gallery">{items}</div>'

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
    {gallery_html}
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
<title>Ficha Técnica · Wings Global Trade · Toyota Land Cruiser Prado 2026 Flagship</title>
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
  .pdoc-hero-kicker {{ display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }}
  .pdoc-hero-emblem {{ width: 26px; height: 26px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,.5); }}
  .pdoc-hero-kicker-text {{ font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #9fb3d9; font-weight: 600; }}
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

  /* ── Section with a side detail photo (Carrocería wheel / Tecnología screen) ── */
  .pdoc-section-split {{ display: flex; gap: 14px; align-items: flex-start; }}
  .pdoc-side-img {{ width: 168px; flex-shrink: 0; border-radius: 12px; overflow: hidden; break-inside: avoid; }}
  .pdoc-side-img img {{ width: 100%; height: 200px; object-fit: cover; display: block; }}
  .pdoc-spec-grid--narrow {{ flex: 1; min-width: 0; }}
  .pdoc-spec-grid--narrow .spec-row {{ grid-template-columns: 178px 1fr; }}

  /* ── Equipment galleries: small captioned thumbnails ── */
  .pdoc-gallery {{ display: flex; gap: 9px; margin: 8px 0 2px; break-inside: avoid; }}
  .pdoc-gallery-item {{ flex: 1; display: flex; flex-direction: column; gap: 4px; }}
  .pdoc-gallery-item img {{ width: 100%; height: 92px; object-fit: cover; border-radius: 10px; display: block; }}
  .pdoc-gallery-cap {{ font-size: 9px; color: var(--pd-muted); text-align: center; line-height: 1.25; }}

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
    .pdoc-gallery {{ flex-wrap: wrap; }}
    .pdoc-gallery-item {{ flex: 1 1 40%; }}
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
    <img class="pdoc-hero-img" src="{img_uri('image2')}" alt="{MODEL_NAME}" />
    <div class="pdoc-hero-scrim"></div>
    <div class="pdoc-hero-overlay">
      <div class="pdoc-hero-kicker">
        <img class="pdoc-hero-emblem" src="{img_uri('crop_emblem')}" alt="" />
        <span class="pdoc-hero-kicker-text">Ficha Técnica · Wings Global Trade</span>
      </div>
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
    <span>Segmento: SUV mediano-grande</span>
  </div>

  {BLOCKS_HTML}

  <div class="pdoc-tail">
  <p class="pdoc-note">Las especificaciones y fotografías anteriores se presentan como referencia técnica y pueden variar según lote de producción; se recomienda confirmar contra la unidad física antes de la compra.</p>
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
n_photos = len(set(
    [b["img"] for b in BLOCKS if b["type"] == "banner"]
    + [b["side_img"] for b in BLOCKS if b.get("side_img")]
    + [img for b in BLOCKS if b.get("gallery") for img, _ in b["gallery"]]
    + ["image2", "crop_emblem"]
))
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"sections={sum(1 for b in BLOCKS if b['type']=='section')} rows={n_rows} photos={n_photos}")
