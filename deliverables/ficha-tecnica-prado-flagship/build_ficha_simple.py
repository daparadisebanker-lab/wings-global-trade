#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for the Toyota Land Cruiser Prado 2026 2.4T Híbrido — versión tope de gama
(Flagship VX) — TEXT-ONLY variant, no photography. Same data as build_ficha.py
(same 10 sections / 108 rows) and the same `pdoc` grid/logo/footer family,
but applies the typography-hierarchy and boolean-iconography fixes from the
design audit (audit/audit.html) that don't require photography: a real type
scale (masthead > hero name > section title > row), a check-glyph treatment
for "Sí" rows instead of repeated plain text, and a stronger numbered-index
rail on each section bar. Self-contained HTML (logo inlined). Run:
  python3 build_ficha_simple.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
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

# ── Section groups: (idx, título, [(etiqueta, valor), ...]) ────────────────
SECTIONS = [
    (1, "Identificación", [
        ("Modelo", MODEL_NAME),
        ("Versión", MODEL_TRIM),
        ("Carrocería", "SUV, 5 puertas, 5 plazas"),
        ("Tipo de energía", "Híbrido gasolina-eléctrico (HEV)"),
        ("Fabricante", "Toyota"),
        ("Fecha de introducción", "05/2026"),
    ]),
    (2, "Dimensiones y Pesos", [
        ("Longitud (mm)", "4,935"),
        ("Ancho (mm)", "1,980"),
        ("Alto (mm)", "1,935"),
        ("Distancia entre ejes (mm)", "2,850"),
        ("Trocha delantera / trasera (mm)", "1,664 / 1,668"),
        ("Ángulo de ataque / salida (°)", "31.0 / 22.0"),
        ("Peso en orden de marcha (kg)", "2,530"),
        ("Peso bruto vehicular (kg)", "3,050"),
        ("Capacidad del estanque de combustible (L)", "68.0"),
    ]),
    (3, "Motor de Combustión y Transmisión", [
        ("Tipo", "T24A Turbocargado"),
        ("Cilindrada (cm³)", "2,393 (2.4 L)"),
        ("Número de cilindros", "4 en línea"),
        ("Válvulas", "16, DOHC"),
        ("Potencia motor de combustión (HP / RPM)", "282 / 6,000"),
        ("Torque motor de combustión (N·m / RPM)", "430 / 1,700–3,600"),
        ("Combustible recomendado", "Gasolina 95 octanos"),
        ("Transmisión (Tipo)", "8AT"),
        ("Transmisión (Secuencial)", "De 8 velocidades, modo manual con levas"),
    ]),
    (4, "Sistema Híbrido", [
        ("Motor eléctrico (Potencia)", "54 HP (40 kW)"),
        ("Motor eléctrico (Torque)", "290 N·m"),
        ("Potencia combinada del sistema", "243 kW"),
        ("Torque combinado del sistema", "630 N·m"),
        ("Batería", "Níquel-Metal Hidruro (NiMH), celdas PRIMEARTH"),
        ("Consumo combinado WLTC (L/100 km)", "10.11"),
        ("Garantía batería híbrida", "8 años o 200,000 km"),
        ("Garantía vehículo", "3 años o 100,000 km"),
    ]),
    (5, "Chasis y Tracción", [
        ("Tracción", "4WD tiempo completo (Full-time AWD)"),
        ("Diferencial central", "Torsen, con bloqueo"),
        ("Diferencial trasero", "Autoblocante (limited-slip)"),
        ("Reductora", "Sí, doble rango (alta / baja)"),
        ("Suspensión (Delantera)", "Independiente, doble horquilla"),
        ("Suspensión (Posterior)", "Eje rígido, no independiente"),
        ("Suspensión regulable", "Modo suave / firme"),
        ("Dirección", "Asistencia eléctrica"),
        ("Modos de manejo", "5 modos: Normal, Eco, Deportivo, Nieve, Todo terreno"),
    ]),
    (6, "Carrocería, Frenos y Neumáticos", [
        ("Frenos (Delanteros)", "Discos ventilados"),
        ("Frenos (Posteriores)", "Discos ventilados"),
        ("Freno de estacionamiento", "Electrónico"),
        ("Neumáticos (Medida)", "265/60 R20"),
        ("Aros", "Aleación, 20\""),
        ("Neumático de repuesto", "Medida completa, aleación, bajo la carrocería"),
    ]),
    (7, "Seguridad y Asistencia a la Conducción", [
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
    ]),
    (8, "Equipamiento Interior", [
        ("Aire acondicionado", "Climatizador automático, trizona"),
        ("Ventilación trasera independiente", "Sí"),
        ("Filtro de habitáculo PM2.5", "Sí"),
        ("Asientos (Material)", "Cuero genuino"),
        ("Asientos (Disposición)", "2+3 (5 plazas)"),
        ("Asiento piloto", "Eléctrico, ventilado, calefaccionado, con memoria"),
        ("Asiento copiloto", "Eléctrico, ventilado, calefaccionado"),
        ("Asientos traseros", "Abatibles 40:60, calefaccionados"),
        ("Timón (Material)", "Cuero"),
        ("Timón (Ajuste)", "Eléctrico, en altura y profundidad"),
        ("Timón (Funciones)", "Multifunción, levas de cambio, memoria, calefacción"),
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
    ]),
    (9, "Equipamiento Exterior e Iluminación", [
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
    ]),
    (10, "Tecnología e Inteligencia Vehicular", [
        ("Chip del sistema multimedia", "Qualcomm Snapdragon 8155"),
        ("Cámaras exteriores", "6 unidades (incluye visión 360°)"),
        ("Radares ultrasónicos / de onda milimétrica", "8 / 5"),
        ("Llave digital vía app", "Sí"),
        ("Monitoreo remoto vía app",
         "Sí (estado del vehículo, control remoto, citas de servicio)"),
    ]),
]


def value_html(value: str) -> str:
    """Rows that are affirmations get a check-badge instead of plain 'Sí' text
    — the audit flagged 40+ identical 'Sí' rows as the document's flattest,
    least scannable pattern."""
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
  .spec-row {{ display: grid; grid-template-columns: 250px 1fr; align-items: start; gap: 4.5px 16px; border-bottom: 1px solid var(--pd-tint); padding-bottom: 4.5px; margin-bottom: 4.5px; break-inside: avoid; }}
  .spec-label {{ font-weight: 600; color: var(--pd-ink); }}
  .spec-value {{ color: var(--pd-ink); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }}

  /* ── Boolean rows: a check badge instead of forty repeated "Sí" ── */
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

  <div class="pdoc-dateline">
    <span>Preparado: {DOC_DATE}</span>
    <span>Origen: China</span>
    <span>Segmento: SUV mediano-grande</span>
  </div>

  <div class="pdoc-hero">
    <div class="pdoc-hero-name">{MODEL_NAME}</div>
    <div class="pdoc-hero-trim">{MODEL_TRIM}</div>
    <div class="pdoc-hero-stats">
      {HERO_STATS_HTML}
    </div>
  </div>

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

out = HERE / "ficha-simple.html"
out.write_text(HTMLDOC, encoding="utf-8")
n_rows = sum(len(rows) for _, _, rows in SECTIONS)
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"sections={len(SECTIONS)} rows={n_rows}")
