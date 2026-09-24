#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for the EURISE YBL6751D — a 20-seat diesel passenger van/minibus — in the
SAME text-only, image-free style used for the redesigned "Land Cruiser
Prado Híbrida" ficha (solid-ink identity header + solid-ink section bars,
no photography, no price, no warranty section).

Source: client-supplied "QUOTATION OF EURISE" spec sheet (PDF, bilingual
Chinese/English) for model YBL6751D. FOB price, currency/payment/delivery/
warranty terms and price-validity conditions were all left BLANK in the
source document — so, consistent with the no-price/no-warranty convention
already used on the Land Cruiser Prado Híbrida ficha, none of that is
shown here (there is nothing to show).

One discrepancy in the source itself, disclosed in Observaciones: the
Chinese column for the A/C says "12KW前后舱空调" (12 kW) while the English
column next to it says "10KW front & rear air conditioning" — both are
shown, unresolved, since the source itself doesn't clarify which is
correct.

Run: python3 build_ficha.py
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_NUMBER = "FT-WGT-2026-0924"
DOC_DATE = "24-09-2026"

MODEL_NAME = "EURISE YBL6751D"
MODEL_TRIM = "Van de Pasajeros Diésel · 20 asientos (incl. conductor) · 6MT"

HERO_STATS = [
    ("Motor", "2.8T", "RA428, tecnología VM"),
    ("Potencia", "120 kW", "nominal"),
    ("Torque máximo", "420 N·m", "—"),
    ("Transmisión", "6MT", "manual"),
    ("Asientos", "20", "incl. conductor"),
]

SECTIONS = [
    {"idx": 1, "title": "Identificación", "rows": [
        ("Modelo", MODEL_NAME),
        ("Marca", "EURISE (欧睿)"),
        ("Tipo de carrocería", "Van / minibús de pasajeros"),
        ("Tipo de energía", "Diésel"),
        ("Capacidad de asientos", "20 (incluye asiento del conductor)"),
    ]},
    {"idx": 2, "title": "Dimensiones y Capacidad", "rows": [
        ("Dimensiones — largo x ancho x alto (mm)", "7,490 x 2,000 x 2,875"),
        ("Distancia entre ejes (mm)", "4,325"),
        ("Peso bruto vehicular (kg)", "5,450"),
        ("Velocidad máxima (km/h)", "120"),
        ("Consumo de combustible (L/100 km)", "10.5"),
    ]},
    {"idx": 3, "title": "Motor y Transmisión", "rows": [
        ("Tipo", "RA428 2.8T (tecnología VM)"),
        ("Potencia nominal (kW)", "120"),
        ("Torque máximo (N·m)", "420"),
        ("Norma de emisión", "Euro V"),
        ("Caja de cambios", "6MT (manual, 6 velocidades)"),
        ("Tipo de combustible", "Diésel"),
    ]},
    {"idx": 4, "title": "Chasis, Frenos y Neumáticos", "rows": [
        ("Capacidad del tanque de combustible (L)", "80"),
        ("Neumáticos", "195/75R16LT (Zhongce, incluye llanta de repuesto)"),
        ("Sistema de frenos", "Discos delanteros y traseros"),
        ("Suspensión delantera", "McPherson, independiente"),
        ("Suspensión trasera", "Ballesta de sección variable (paquete reducido de hojas)"),
    ]},
    {"idx": 5, "title": "Equipamiento de Serie — Exterior e Interior", "rows": [
        ("Pintura", "Color sólido estándar (blanco)"),
        ("Ventanas laterales", "Fijas, tipo cerrado (vidrio verde)"),
        ("Vidrios eléctricos", "Solo ventana delantera del lado del conductor"),
        ("Faros delanteros", "Cristal con halógeno integrado"),
        ("Luces diurnas (DRL)", "LED"),
        ("Faros antiniebla delanteros", "Sí"),
        ("Puerta trasera", "Portón trasero"),
        ("Llantas", "Acero, incluye llanta de repuesto"),
        ("Asiento del conductor", "Ajustable en 6 direcciones"),
        ("Interior", "Color beige"),
        ("Paneles laterales", "Revestidos en cuerina beige"),
        ("Piso", "Vinilo con textura de madera clara"),
        ("Asiento del conductor (marca)", "Estándar, Jiangdu Jiulong"),
        ("Asientos de pasajeros", "Cuerina (símil cuero), cinturón de 2 puntos, marca Fuhao A"),
        ("Diagnóstico", "CAN-BUS"),
    ]},
    {"idx": 6, "title": "Equipamiento de Serie — Seguridad", "rows": [
        ("Sistema antirrobo", "Sí, para todo el vehículo"),
        ("Airbag del conductor", "Sí"),
        ("Cinturón del conductor", "3 puntos, con alarma de no abrochado"),
        ("Control electrónico de estabilidad (ESC)", "Sí"),
        ("Freno de escape (retardador de motor)", "Sí"),
        ("Techo corredizo", "Vidrio gris (20%)"),
        ("Martillos de emergencia", "5 unidades"),
        ("Extintor", "1 unidad, 2 kg"),
        ("Radar de retroceso", "Sí"),
        ("Indicador de consumo instantáneo", "Sí"),
        ("Indicador de autonomía disponible", "Sí"),
        ("Luz de freno de posición alta", "Sí"),
    ]},
    {"idx": 7, "title": "Equipamiento de Serie — Confort y Conveniencia", "rows": [
        ("Audio", "Radio + reproductor MP3"),
        ("Desempañador de luna trasera", "Eléctrico"),
        ("Espejos retrovisores exteriores", "Eléctricos, calefaccionados, con luz direccional integrada"),
        ("Volante", "Multifunción"),
        ("Parlantes", "Rango completo"),
        ("Aire acondicionado", "12 kW, delantero y trasero (columna en inglés de la fuente indica 10 kW — confirmar con proveedor)"),
        ("Calefacción zona de pasajeros", "Radiadores, 2 m lado izquierdo"),
        ("Llaves", "2 unidades, control remoto plegable"),
        ("Faros de cortesía", "Función \"sígueme a casa\""),
        ("Desbloqueo automático", "Sí"),
        ("Bloqueo automático por velocidad", "Sí, a partir de 15 km/h"),
        ("Cierre centralizado", "Sí"),
    ]},
    {"idx": 8, "title": "Configuración Opcional — Motor y Chasis", "rows": [
        ("Motor RA428Q163E50, Euro V", "Sin límite de velocidad"),
        ("Motor RA428Q163E50, Euro V", "Límite de velocidad 120 km/h, sin certificación de emisiones"),
        ("Motor RA428Q163E61, Euro VI", "Sin límite de velocidad"),
        ("Motor RA428Q163E61, Euro VI", "Límite de velocidad 120 km/h"),
        ("Tanque de combustible auxiliar", "Opcional"),
        ("Calefacción de línea de combustible", "Opcional"),
        ("Cubierta protectora del tanque de AdBlue (urea)", "Opcional"),
        ("Cubierta protectora del chasis/motor (con orificio para aceite)", "Opcional"),
        ("Doble filtro de combustible diésel", "Opcional"),
        ("Batería resistente a bajas temperaturas", "Opcional"),
    ]},
    {"idx": 9, "title": "Configuración Opcional — Exterior e Interior", "rows": [
        ("Cantidad de asientos", "17 a 21 (21 asientos solo con puerta corrediza)"),
        ("Pintura metálica", "Opcional"),
        ("Tablero de instrumentos actualizado", "Opcional (excepto versión de techo estándar)"),
        ("Interior gris con amarillo (versión anterior)", "Opcional, solo con tablero estándar"),
        ("Paneles laterales de aluminio-plástico", "Opcional, colores blanco marfil o marrón"),
        ("Paneles laterales en fibra revestida en cuerina", "Opcional, colores gris o marrón"),
        ("Asiento del conductor Grammer", "Opcional, con amortiguación neumática tipo airbag"),
        ("Puerta corrediza (lado derecho)", "Opcional"),
        ("Puerta oscilante eléctrica delantera", "Opcional, con control remoto"),
        ("Asiento del copiloto", "Opcional, individual o doble — solo con puerta corrediza"),
        ("Asientos de pasajeros", "Opcional, configuración de 20 o 22 plazas"),
        ("Asientos de pasajeros Jiulong Fuhua (tipo angosto)", "Opcional, cinturón de 2 o 3 puntos"),
        ("Asientos de pasajeros con cinturón de 3 puntos", "Opcional"),
        ("Vidrios laterales grises", "Opcional, transmitancia de 20% o 50%"),
        ("Vidrio termopanel (doble) en ventanas laterales", "Opcional"),
        ("Ventana lateral corrediza", "Opcional, por unidad"),
        ("Ventanas laterales ampliadas", "Opcional, 8 vidrios grandes"),
        ("Vidrio de puerta trasera", "Opcional, color gris 20%"),
        ("Logotipo trasero", "Opcional, EURISE o EURISE + nombre del modelo"),
        ("Cortinas", "Opcional, todas las ventanas laterales"),
        ("Sistema de videovigilancia", "Opcional"),
        ("Airbag del copiloto", "Opcional, solo con tablero estándar"),
        ("Pasamanos/guardapiés en el pilar A", "Opcional"),
        ("Monitoreo de presión de neumáticos", "Opcional, solo delanteros o las 4 ruedas"),
        ("Techo corredizo con ventilador extractor", "Opcional"),
        ("Compartimento de equipaje de dos niveles", "Opcional"),
        ("Interior del compartimento de equipaje", "Opcional, panel en fibra revestida + piso estándar, o panel con relieve de aluminio + piso"),
        ("Luz interior del compartimento de equipaje", "Opcional"),
        ("Agarradera del pilar A (lado del conductor)", "Opcional"),
        ("Calefacción del asiento del conductor", "Opcional"),
        ("Calefacción de asientos del conductor y copiloto", "Opcional"),
        ("Portaequipaje interior", "Opcional, un lado o ambos lados"),
        ("Televisor fijo de 19\"", "Opcional"),
        ("Televisor eléctrico plegable de 19\"", "Opcional"),
        ("Puerto USB en el tablero", "Opcional, 1 o 2 puertos — solo tablero estándar"),
        ("Puerto USB en cada asiento de pasajero", "Opcional"),
        ("Sistema auxiliar de calefacción por combustible (Hauck)", "Opcional"),
        ("Micrófono inalámbrico", "Opcional"),
        ("Reloj digital", "Opcional"),
        ("Paquete de reducción de ruido en zona de pasajeros", "Opcional, nivel C+ o B"),
        ("Calefacción en zona de pasajeros", "Opcional, 2 m a cada lado"),
        ("Control de crucero", "Opcional"),
        ("Sistema MP5 + cámara de retroceso", "Opcional, pantalla grande o pequeña — solo tablero estándar"),
        ("Tratamiento anticorrosión y contra el frío mejorado", "Opcional, en pintura"),
    ]},
    {"idx": 10, "title": "Configuración Opcional — Seguridad", "rows": [
        ("Extintor automático en el compartimento del motor", "Opcional"),
        ("Retardador (freno auxiliar)", "Opcional"),
    ]},
    {"idx": 11, "title": "Configuración Opcional — Confort y Conveniencia", "rows": [
        ("Estribo eléctrico de bienvenida", "Opcional, excepto con puerta oscilante eléctrica"),
    ]},
]


OPTIONAL_RE = re.compile(r"^Opcional\b", re.IGNORECASE)


def value_html(value: str) -> str:
    """Boolean specs get a check badge instead of plain 'Sí' text; rows
    whose value starts with 'Opcional' get a pill so an optional-equipment
    section still reads at a glance even without the check-badge pattern."""
    if value.startswith("Sí"):
        rest = value[2:].lstrip(",").strip()
        detail = f' <span class="spec-detail">{rest}</span>' if rest else ""
        return f'<span class="spec-check" aria-hidden="true">✓</span><span class="spec-affirm">Sí</span>{detail}'
    m = OPTIONAL_RE.match(value)
    if m:
        rest = value[m.end():].strip(" ,").strip()
        detail = f' <span class="spec-detail">{rest}</span>' if rest else ""
        return f'<span class="spec-optional">Opcional</span>{detail}'
    return value


def rows_html(rows: list[tuple[str, str]]) -> str:
    return "\n".join(
        f'<div class="spec-row"><span class="spec-label">{label}</span>'
        f'<span class="spec-value">{value_html(value)}</span></div>'
        for label, value in rows
    )


def section_html(s: dict) -> str:
    bar = f'<div class="pdoc-section-bar"><span class="pd-sec-index">{s["idx"]:02d}</span>{s["title"]}</div>'
    grid = rows_html(s["rows"])
    return f"""
  <div class="pdoc-spec-section">
    {bar}
    <div class="pdoc-spec-grid">{grid}</div>
  </div>"""


SECTIONS_HTML = "\n".join(section_html(s) for s in SECTIONS)
HERO_STATS_HTML = "\n      ".join(
    f'<div class="pdoc-hero-stat"><span class="pd-hero-label">{label}</span>'
    f'<span class="pd-hero-value">{value}</span><span class="pd-hero-sub">{sub}</span></div>'
    for label, value, sub in HERO_STATS
)

LOGO = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO = LOGO[LOGO.index("<svg"):]
LOGO = LOGO.replace("<svg ", '<svg class="pdoc-logo" ', 1)

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ficha Técnica · Wings Global Trade · EURISE YBL6751D</title>
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
    --pd-bar: #f0f1f2; --pd-tint: #f7f8f9; --pd-accent: #24417a; --pd-accent-tint: #eef2f8; --pd-pad-x: 52px;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 22px var(--pd-pad-x) 26px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }}
  .pdoc *, .pdoc *::before, .pdoc *::after {{ box-sizing: border-box; }}

  .pdoc-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .pdoc-title {{ margin: 0; font-size: 30px; font-weight: 600; letter-spacing: -0.01em; line-height: 0.95; }}
  .pdoc-number {{ margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }}
  .pdoc-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 6px; flex-shrink: 0; }}
  .pdoc-logo {{ height: 42px; width: auto; filter: brightness(0); }}
  .pdoc-tagline {{ font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }}

  .pdoc-rule {{ position: relative; height: 3px; margin: 14px 0 16px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  /* ── Text-only identity block — solid ink panel ── */
  .pdoc-identity {{
    background: var(--pd-ink); color: #fff; border-radius: 14px;
    padding: 18px 22px 16px; margin-bottom: 18px;
  }}
  .pdoc-identity-kicker {{ font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: #9fb3d9; font-weight: 700; margin-bottom: 5px; }}
  .pdoc-identity-name {{ font-size: 23px; font-weight: 700; letter-spacing: -0.01em; color: #fff; }}
  .pdoc-identity-trim {{ margin-top: 3px; font-size: 12px; color: rgba(255,255,255,.72); }}
  .pdoc-hero-stats {{ display: flex; margin-top: 14px; background: rgba(255,255,255,.08); border-radius: 10px; padding: 9px 6px; }}
  .pdoc-hero-stat {{ flex: 1; text-align: center; border-left: 1px solid rgba(255,255,255,.18); padding: 0 6px; display: flex; flex-direction: column; }}
  .pdoc-hero-stat:first-child {{ border-left: none; }}
  .pd-hero-label {{ font-size: 8.5px; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.62); }}
  .pd-hero-value {{ margin-top: 3px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 15px; color: #fff; font-variant-numeric: tabular-nums; }}
  .pd-hero-sub {{ margin-top: 1px; font-size: 9px; color: rgba(255,255,255,.55); }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 14px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  /* ── Section bars: solid ink background + accent numbered chip ── */
  .pdoc-section-bar {{
    display: flex; align-items: center; gap: 10px; background: var(--pd-ink); color: #fff;
    border-radius: 6px; padding: 6px 12px; margin: 0 0 3px; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; break-after: avoid; break-inside: avoid;
  }}
  .pd-sec-index {{
    display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px;
    border-radius: 5px; background: var(--pd-accent); color: #fff; font-family: var(--font-mono, monospace);
    font-size: 10.5px; font-weight: 700; flex-shrink: 0;
  }}
  .pdoc-spec-section {{ margin-bottom: 9px; }}
  .pdoc-spec-grid {{ display: flex; flex-direction: column; font-size: 11.5px; }}
  .spec-row {{
    display: grid; grid-template-columns: 270px 1fr; align-items: start; gap: 4.5px 16px;
    padding: 5.5px 8px; border-bottom: 1px solid var(--pd-tint); break-inside: avoid;
  }}
  .spec-row:nth-child(even) {{ background: var(--pd-tint); }}
  .spec-label {{ font-weight: 600; color: var(--pd-ink); }}
  .spec-value {{ color: var(--pd-ink); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; font-variant-numeric: tabular-nums; }}

  /* ── Boolean rows: a check badge instead of repeating "Sí" ── */
  .spec-check {{
    display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;
    border-radius: 3px; background: var(--pd-accent); color: #fff; font-size: 10px; font-weight: 700;
    flex-shrink: 0; line-height: 1;
  }}
  .spec-affirm {{ font-weight: 600; }}
  .spec-detail {{ color: var(--pd-muted); }}

  /* ── "Opcional" — its own visual state ── */
  .spec-optional {{
    display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; letter-spacing: .02em;
    text-transform: uppercase; color: var(--pd-accent); background: var(--pd-accent-tint);
    border: 1px solid var(--pd-line); border-radius: 999px; padding: 2px 9px; flex-shrink: 0;
  }}

  .pdoc-tail {{ margin-top: 10px; padding-top: 6px; }}
  .pdoc-note {{ font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 8px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 6px; padding-top: 4px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .spec-row {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-hero-stats {{ flex-wrap: wrap; }}
    .pdoc-hero-stat {{ flex: 1 1 40%; border-left: none; border-top: 1px solid rgba(255,255,255,.18); padding-top: 8px; margin-top: 8px; }}
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

  <div class="pdoc-identity">
    <div class="pdoc-identity-kicker">Ficha Técnica · Wings Global Trade</div>
    <div class="pdoc-identity-name">{MODEL_NAME}</div>
    <div class="pdoc-identity-trim">{MODEL_TRIM}</div>
    <div class="pdoc-hero-stats">
      {HERO_STATS_HTML}
    </div>
  </div>

  <div class="pdoc-dateline">
    <span>Preparado: {DOC_DATE}</span>
    <span>Origen: China</span>
    <span>Segmento: Van / minibús de pasajeros</span>
  </div>

  {SECTIONS_HTML}

  <div class="pdoc-tail">
  <p class="pdoc-note">Especificaciones tomadas de la hoja de cotización del proveedor (EURISE, modelo YBL6751D). El documento fuente no incluye precio, condiciones de pago, plazo de entrega ni términos de garantía, por lo que no se muestran en esta ficha. La sección "Aire acondicionado" presenta una discrepancia en la fuente entre 12 kW (columna en chino) y 10 kW (columna en inglés) — se recomienda confirmar con el proveedor. Las secciones de "Configuración Opcional" no vienen de serie y están sujetas a cotización adicional. Se recomienda confirmar equipamiento y especificaciones contra la unidad física antes de la compra.</p>
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
n_rows = sum(len(s["rows"]) for s in SECTIONS)
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"sections={len(SECTIONS)} rows={n_rows} images=0")
