#!/usr/bin/env python3
"""Build the Wings Global Trade branded optional-accessories menu for the
Toyota Hilux Travo Overland Plus 4TREX. Content is derived from a rigorous
side-by-side comparison of client-supplied reference photos:
  - deliverables/../scratchpad (not shipped): WHITE_ACCESORISED_TRAVO.zip
    (accessorized demo unit) vs BLACK_TRAVO.zip (plain/standard unit).
Only items confirmed ABSENT on the plain unit and PRESENT on the
accessorized unit are listed as optional add-ons — the aggressive front
bumper/grille, sport bar, tonneau cover, side steps and fender flares are
standard on both units and are therefore NOT listed as accessories.
Run:
  python3 build_accesorios.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_NUMBER = "ACC-WGT-2026-0827"
DOC_DATE = "27-08-2026"
MODEL_NAME = "Toyota Hilux Travo Overland Plus 4TREX"


def b64img(name: str) -> str:
    data = (ASSETS / name).read_bytes()
    return "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")


IMG = {
    "exterior_hero": b64img("exterior_hero.jpg"),
    "wheel_a": b64img("wheel_a.jpg"),
    "wheel_b": b64img("wheel_b.jpg"),
    "steering_carbon": b64img("steering_carbon.jpg"),
    "rear_vent_carbon": b64img("rear_vent_carbon.jpg"),
    "bed_decal": b64img("bed_decal.jpg"),
}

# ── Accessory catalogue ─────────────────────────────────────────────────
# (num, categoria, nombre, posicion, descripcion)
ITEMS = [
    (1, "Interior — Fibra de Carbono", "Cubiertas de timón en fibra de carbono",
     "Volante, ambos radios laterales + radio inferior",
     "Vinil texturizado de fibra de carbono sobre los radios del timón, alrededor de los mandos de audio y crucero."),
    (2, "Interior — Fibra de Carbono", "Marco de fibra de carbono — salidas de A/C",
     "Tablero central, salidas de aire delanteras",
     "Marco envolvente en acabado carbono alrededor del conjunto de ventilación y climatizador del tablero."),
    (3, "Interior — Fibra de Carbono", "Panel de fibra de carbono — consola trasera",
     "Respaldo de consola central, segunda fila",
     "Panel en acabado carbono sobre las salidas de A/C traseras y puertos de carga USB-C."),
    (4, "Rines y Neumáticos", "Rines de aleación — Diseño A + neumático A/T",
     "Las 4 ruedas",
     "Rin multirradios acabado negro brillante con ventana mecanizada; neumático todo terreno (A/T), reemplaza el rin y la llanta de carretera de serie."),
    (5, "Rines y Neumáticos", "Rines de aleación — Diseño B + neumático A/T",
     "Las 4 ruedas",
     "Rin de doble radio acabado negro brillante con ventana mecanizada; neumático todo terreno (A/T). Opción alterna al Diseño A — no acumulable."),
    (6, "Gráficos Exteriores", 'Kit de calcomanías "OFF ROAD"',
     "Guardafangos delanteros, ambos lados",
     "Rotulado deportivo sobre el guardafango delantero, a la altura de la salida de aire lateral."),
    (7, "Gráficos Exteriores", 'Calcomanía lateral "OVERLAND"',
     "Costado del platón (caja), ambos lados",
     "Rotulado + franja gráfica sobre el panel lateral del platón, debajo del riel de carga."),
]

CATEGORIES = ["Interior — Fibra de Carbono", "Rines y Neumáticos", "Gráficos Exteriores"]

CONDITIONS = [
    "Todos los accesorios listados en esta ficha son <strong>opcionales</strong> y no forman parte del precio base ni de las especificaciones estándar de la unidad.",
    "La <strong>disponibilidad está sujeta a confirmación</strong> con nuestro proveedor al momento de formalizar el pedido; los tiempos de aprovisionamiento pueden variar según el accesorio y el volumen solicitado.",
    "Wings Global Trade <strong>no garantiza la disponibilidad simultánea</strong> de todos los accesorios listados para una misma unidad — se recomienda confirmar la combinación deseada antes de emitir la orden de compra.",
    "Los rines Diseño A y Diseño B son <strong>alternativas entre sí</strong> (una unidad monta un solo diseño de rin), no son acumulables.",
    "Acabados, tonos y proporciones pueden variar ligeramente según el lote de producción respecto a las fotografías de referencia incluidas en este documento.",
    "La instalación de accesorios puede requerir <strong>tiempo adicional de preparación</strong> previo al despacho de la unidad.",
    "El precio de cada accesorio se cotiza de forma individual bajo solicitud; no está incluido en la ficha técnica ni en la cotización estándar del vehículo.",
]


def money_row_svg_exterior() -> str:
    return """
  <svg viewBox="0 0 900 320" width="100%" height="auto" role="img" aria-label="Diagrama exterior — posición de accesorios">
    <rect x="0" y="0" width="900" height="320" fill="var(--pd-tint)"/>
    <line x1="20" y1="272" x2="880" y2="272" stroke="var(--pd-accent)" stroke-width="1" stroke-dasharray="2 4" opacity="0.4"/>

    <path d="
      M 50 272 L 50 172 L 66 160 L 256 148 L 292 94 L 462 94
      L 498 156 L 503 173 L 792 173 L 792 250 L 818 250 L 818 272 Z
    " fill="#12181f"/>

    <circle cx="152" cy="272" r="58" fill="var(--pd-tint)"/>
    <circle cx="662" cy="272" r="58" fill="var(--pd-tint)"/>
    <circle cx="152" cy="272" r="38" fill="#12181f"/>
    <circle cx="152" cy="272" r="14" fill="var(--pd-tint)"/>
    <circle cx="662" cy="272" r="38" fill="#12181f"/>
    <circle cx="662" cy="272" r="14" fill="var(--pd-tint)"/>

    <path d="M 266 152 L 298 104 L 456 104 L 490 150 Z" fill="var(--pd-tint)"/>
    <line x1="345" y1="104" x2="337" y2="150" stroke="#12181f" stroke-width="3"/>
    <line x1="412" y1="104" x2="420" y2="150" stroke="#12181f" stroke-width="3"/>

    <line x1="510" y1="188" x2="786" y2="188" stroke="var(--pd-tint)" stroke-width="1.5" opacity="0.85" stroke-dasharray="5 4"/>

    <line x1="58" y1="188" x2="58" y2="214" stroke="var(--pd-tint)" stroke-width="2"/>
    <line x1="65" y1="184" x2="65" y2="218" stroke="var(--pd-tint)" stroke-width="2"/>
    <line x1="72" y1="180" x2="72" y2="222" stroke="var(--pd-tint)" stroke-width="2"/>
    <rect x="82" y="166" width="11" height="15" rx="2" fill="var(--pd-tint)"/>
    <line x1="50" y1="236" x2="84" y2="236" stroke="var(--pd-tint)" stroke-width="1.5" opacity="0.8"/>

    <path d="M 296 116 L 280 108 L 280 124 Z" fill="#12181f"/>

    <rect x="368" y="164" width="13" height="4" rx="1.5" fill="var(--pd-tint)"/>
    <rect x="440" y="160" width="13" height="4" rx="1.5" fill="var(--pd-tint)"/>
    <line x1="368" y1="156" x2="362" y2="272" stroke="var(--pd-tint)" stroke-width="1.5" opacity="0.7"/>
    <line x1="440" y1="152" x2="448" y2="272" stroke="var(--pd-tint)" stroke-width="1.5" opacity="0.7"/>

    <!-- pin: wheels (4 / 5) -->
    <line x1="152" y1="234" x2="152" y2="70" stroke="var(--pd-accent)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="152" cy="56" r="16" fill="var(--pd-accent)"/>
    <text x="152" y="61" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="14" fill="#fff">4·5</text>
    <text x="152" y="34" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="15" fill="var(--pd-ink)">Rines opcionales</text>

    <!-- pin: fender graphics (6) -->
    <line x1="330" y1="145" x2="330" y2="70" stroke="var(--pd-accent)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="330" cy="56" r="16" fill="var(--pd-accent)"/>
    <text x="330" y="61" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="14" fill="#fff">6</text>
    <text x="330" y="34" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="15" fill="var(--pd-ink)">Gráfico guardafango</text>

    <!-- pin: bed decal (7) -->
    <line x1="740" y1="173" x2="740" y2="70" stroke="var(--pd-accent)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="740" cy="56" r="16" fill="var(--pd-accent)"/>
    <text x="740" y="61" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="14" fill="#fff">7</text>
    <text x="740" y="34" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="15" fill="var(--pd-ink)">Calcomanía platón</text>
  </svg>"""


def interior_svg() -> str:
    return """
  <svg viewBox="0 0 900 260" width="100%" height="auto" role="img" aria-label="Diagrama interior — posición de accesorios">
    <rect x="0" y="0" width="900" height="260" fill="var(--pd-tint)"/>

    <!-- steering wheel -->
    <circle cx="165" cy="140" r="78" fill="none" stroke="#12181f" stroke-width="10"/>
    <circle cx="165" cy="140" r="30" fill="#12181f"/>
    <rect x="155" y="60" width="20" height="55" rx="6" fill="var(--pd-accent)"/>
    <rect x="96" y="152" width="55" height="20" rx="6" fill="var(--pd-accent)" transform="rotate(-28 123 162)"/>
    <rect x="179" y="152" width="55" height="20" rx="6" fill="var(--pd-accent)" transform="rotate(28 206 162)"/>

    <!-- dash vent cluster -->
    <rect x="380" y="80" width="180" height="110" rx="14" fill="none" stroke="#12181f" stroke-width="6"/>
    <rect x="398" y="100" width="62" height="46" rx="4" fill="var(--pd-accent)"/>
    <rect x="480" y="100" width="62" height="46" rx="4" fill="var(--pd-accent)"/>
    <line x1="404" y1="112" x2="454" y2="112" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="404" y1="122" x2="454" y2="122" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="404" y1="132" x2="454" y2="132" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="486" y1="112" x2="536" y2="112" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="486" y1="122" x2="536" y2="122" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="486" y1="132" x2="536" y2="132" stroke="var(--pd-tint)" stroke-width="3"/>

    <!-- rear console vent panel -->
    <rect x="660" y="70" width="160" height="130" rx="14" fill="none" stroke="#12181f" stroke-width="6"/>
    <rect x="676" y="86" width="34" height="18" rx="4" fill="var(--pd-accent)"/>
    <rect x="716" y="86" width="34" height="18" rx="4" fill="var(--pd-accent)"/>
    <rect x="676" y="130" width="58" height="50" rx="4" fill="var(--pd-accent)"/>
    <rect x="744" y="130" width="58" height="50" rx="4" fill="var(--pd-accent)"/>
    <line x1="684" y1="142" x2="726" y2="142" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="684" y1="152" x2="726" y2="152" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="684" y1="162" x2="726" y2="162" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="752" y1="142" x2="794" y2="142" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="752" y1="152" x2="794" y2="152" stroke="var(--pd-tint)" stroke-width="3"/>
    <line x1="752" y1="162" x2="794" y2="162" stroke="var(--pd-tint)" stroke-width="3"/>

    <!-- pin 1: steering wheel -->
    <line x1="165" y1="60" x2="165" y2="30" stroke="var(--pd-accent)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="165" cy="18" r="16" fill="var(--pd-accent)"/>
    <text x="165" y="23" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="14" fill="#fff">1</text>

    <!-- pin 2: dash vents -->
    <line x1="470" y1="80" x2="470" y2="30" stroke="var(--pd-accent)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="470" cy="18" r="16" fill="var(--pd-accent)"/>
    <text x="470" y="23" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="14" fill="#fff">2</text>

    <!-- pin 3: rear vent panel -->
    <line x1="740" y1="70" x2="740" y2="30" stroke="var(--pd-accent)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="740" cy="18" r="16" fill="var(--pd-accent)"/>
    <text x="740" y="23" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="14" fill="#fff">3</text>

    <text x="165" y="238" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="14" fill="var(--pd-ink)">Timón</text>
    <text x="470" y="215" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="14" fill="var(--pd-ink)">Salidas de A/C — tablero</text>
    <text x="740" y="222" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="14" fill="var(--pd-ink)">Consola trasera</text>
  </svg>"""


def table_rows() -> str:
    out = []
    for cat in CATEGORIES:
        out.append(f'<tr class="acc-cat-row"><td colspan="4">{cat}</td></tr>')
        for num, category, name, pos, desc in ITEMS:
            if category != cat:
                continue
            out.append(f"""<tr>
        <td class="acc-num">{num:02d}</td>
        <td class="acc-name">{name}</td>
        <td class="acc-pos">{pos}</td>
        <td class="acc-desc">{desc}</td>
      </tr>""")
    return "\n".join(out)


LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Accesorios Opcionales · Wings Global Trade · Toyota Hilux Travo Overland Plus 4TREX</title>
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
    --pd-bar: #f4f5f4; --pd-tint: #f4f0e6; --pd-accent: #24417a; --pd-pad-x: 52px;
    box-sizing: border-box; width: 100%; max-width: 860px; margin: 0 auto;
    padding: 24px var(--pd-pad-x) 26px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.02em; line-height: 0.98; }}
  .pdoc-subtitle {{ margin: 4px 0 0; font-size: 13px; font-weight: 600; color: var(--pd-accent); }}
  .pdoc-number {{ margin-top: 8px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 6px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 46px; width: auto; filter: brightness(0); }}
  .pdoc-tagline {{ font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 10px 0 16px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-accent); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 14px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  .pdoc-hero {{ border: 1px solid var(--pd-line); border-top: 3px solid var(--pd-accent); padding: 14px 18px; margin-bottom: 14px; break-inside: avoid; }}
  .pdoc-hero-name {{ font-size: 23px; font-weight: 800; letter-spacing: -0.015em; }}
  .pdoc-hero-note {{ margin-top: 6px; font-size: 11.5px; color: var(--pd-muted); line-height: 1.5; }}

  .pdoc-section-bar {{
    display: flex; align-items: baseline; gap: 10px; background: var(--pd-bar);
    border-left: 3px solid var(--pd-accent); padding: 6px 12px; margin: 22px 0 10px;
    break-after: avoid; break-inside: avoid;
  }}
  .pd-sec-index {{ font-family: var(--font-mono, monospace); font-weight: 700; font-size: 15px; color: var(--pd-accent); }}
  .pd-sec-title {{ font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }}

  /* diagrams */
  .acc-diagram-wrap {{ border: 1px solid var(--pd-line); background: var(--pd-tint); padding: 10px 6px 4px; break-inside: avoid; }}
  .acc-diagram-cap {{ text-align: center; font-size: 10.5px; color: var(--pd-muted); margin-top: 4px; padding-bottom: 6px; }}

  /* accessory table */
  .acc-table {{ width: 100%; border-collapse: collapse; font-size: 10.8px; }}
  .acc-table th {{ text-align: left; font-size: 9.5px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--pd-muted); border-bottom: 1px solid var(--pd-ink); padding: 0 6px 5px; font-weight: 700; }}
  .acc-table td {{ padding: 7px 6px; border-bottom: 1px solid var(--pd-tint); vertical-align: top; }}
  .acc-cat-row td {{ padding: 10px 6px 4px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--pd-accent); border-bottom: 1px solid var(--pd-line); }}
  .acc-num {{ font-family: var(--font-mono); font-weight: 700; color: var(--pd-accent); width: 26px; }}
  .acc-name {{ font-weight: 700; width: 26%; }}
  .acc-pos {{ color: var(--pd-muted); width: 24%; }}
  .acc-desc {{ width: 40%; }}
  .acc-table th.acc-th-num {{ width: 26px; }}
  .acc-table th.acc-th-name {{ width: 26%; }}
  .acc-table th.acc-th-pos {{ width: 24%; }}

  /* photo gallery */
  .acc-gallery {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; break-inside: avoid; }}
  .acc-gallery figure {{ margin: 0; break-inside: avoid; }}
  .acc-gallery img {{ display: block; width: 100%; height: auto; border: 1px solid var(--pd-line); }}
  .acc-gallery figcaption {{ margin-top: 4px; font-size: 9.5px; color: var(--pd-muted); line-height: 1.3; }}
  .acc-gallery figcaption b {{ color: var(--pd-ink); }}
  .acc-gallery.acc-gallery-2 {{ grid-template-columns: repeat(2, 1fr); }}

  /* conditions */
  .acc-conditions {{ margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.6; }}
  .acc-conditions li {{ margin-bottom: 7px; }}
  .acc-conditions strong {{ color: var(--pd-ink); }}

  .pdoc-tail {{ margin-top: 26px; padding-top: 10px; }}
  .pdoc-note {{ font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 10px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 10px; padding-top: 6px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media print {{
    @page {{ size: A4 portrait; margin: 8mm; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    .pdoc {{ --pd-pad-x: 0px; max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    .pdoc-close-row, .pdoc-footer, .acc-diagram-wrap, .acc-gallery figure {{ break-inside: avoid; }}
    .acc-table tr {{ break-inside: avoid; }}
  }}
</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <h1 class="pdoc-title">Accesorios Opcionales</h1>
      <p class="pdoc-subtitle">Kit de personalización Overland</p>
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
    <span>Modelo: {MODEL_NAME}</span>
    <span>Tipo: Menú de accesorios</span>
  </div>

  <div class="pdoc-hero">
    <div class="pdoc-hero-name">{MODEL_NAME}</div>
    <p class="pdoc-hero-note">Este documento reúne los accesorios <strong>opcionales</strong> disponibles para personalizar la unidad, identificados
    a partir de una unidad de referencia acondicionada por el proveedor. Ninguno de estos accesorios forma parte de la
    especificación estándar del vehículo — ver Ficha Técnica {("FT-WGT-2026-0826")} para el equipamiento de serie. Cada accesorio
    se cotiza y confirma de forma independiente (ver Condiciones Comerciales).</p>
  </div>

  <div class="pdoc-section-bar">
    <span class="pd-sec-index">01</span>
    <span class="pd-sec-title">Configuración — Exterior</span>
  </div>
  <div class="acc-diagram-wrap">
    {money_row_svg_exterior()}
    <p class="acc-diagram-cap">Posición esquemática de los accesorios exteriores opcionales sobre la silueta del vehículo — ver detalle en la tabla de la sección 03.</p>
  </div>

  <div class="pdoc-section-bar">
    <span class="pd-sec-index">02</span>
    <span class="pd-sec-title">Configuración — Interior</span>
  </div>
  <div class="acc-diagram-wrap">
    {interior_svg()}
    <p class="acc-diagram-cap">Posición esquemática de los acabados en fibra de carbono opcionales — vista de cabina simplificada.</p>
  </div>

  <div class="pdoc-section-bar">
    <span class="pd-sec-index">03</span>
    <span class="pd-sec-title">Listado de Accesorios</span>
  </div>
  <table class="acc-table">
    <thead>
      <tr>
        <th class="acc-th-num">#</th>
        <th class="acc-th-name">Accesorio</th>
        <th class="acc-th-pos">Posición</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      {table_rows()}
    </tbody>
  </table>

  <div class="pdoc-section-bar">
    <span class="pd-sec-index">04</span>
    <span class="pd-sec-title">Referencia Fotográfica</span>
  </div>
  <div class="acc-gallery">
    <figure>
      <img src="{IMG['exterior_hero']}" alt="Vista frontal 3/4 con gráficos opcionales" />
      <figcaption><b>Gráficos guardafango + timón A/T.</b> Unidad de referencia con accesorios 6 y 4/5 instalados.</figcaption>
    </figure>
    <figure>
      <img src="{IMG['bed_decal']}" alt="Perfil lateral con calcomanía OVERLAND" />
      <figcaption><b>Calcomanía lateral de platón.</b> Accesorio 7, costado del platón.</figcaption>
    </figure>
    <figure>
      <img src="{IMG['steering_carbon']}" alt="Timón con acabado en fibra de carbono" />
      <figcaption><b>Timón — fibra de carbono.</b> Accesorio 1, ambos radios laterales.</figcaption>
    </figure>
    <figure>
      <img src="{IMG['rear_vent_carbon']}" alt="Panel trasero con acabado en fibra de carbono" />
      <figcaption><b>Consola trasera — fibra de carbono.</b> Accesorio 3, salidas de A/C y puertos USB-C, segunda fila.</figcaption>
    </figure>
    <figure>
      <img src="{IMG['wheel_a']}" alt="Rin de aleación Diseño A con neumático todo terreno" />
      <figcaption><b>Rin Diseño A.</b> Accesorio 4, acabado negro multirradios + neumático A/T.</figcaption>
    </figure>
    <figure>
      <img src="{IMG['wheel_b']}" alt="Rin de aleación Diseño B con neumático todo terreno" />
      <figcaption><b>Rin Diseño B.</b> Accesorio 5, doble radio + neumático A/T.</figcaption>
    </figure>
  </div>

  <div class="pdoc-section-bar">
    <span class="pd-sec-index">05</span>
    <span class="pd-sec-title">Condiciones Comerciales</span>
  </div>
  <ul class="acc-conditions">
    {"".join(f"<li>{c}</li>" for c in CONDITIONS)}
  </ul>

  <div class="pdoc-tail">
  <p class="pdoc-note">Las fotografías de referencia corresponden a una unidad de demostración acondicionada por el proveedor y se incluyen únicamente con fines ilustrativos de posición y acabado.</p>
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

out = HERE / "accesorios.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"items={len(ITEMS)} categories={len(CATEGORIES)}")
