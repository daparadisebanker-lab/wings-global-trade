#!/usr/bin/env python3
"""Build the freight-forwarder cubicaje/stowage spec sheet for the KQ280
drone — technical (blueprint-style) document, NOT client-facing. Shows
scaled top-view and side-view diagrams of the folded unit inside a
standard 20' GP container, plus a full measurements table. Run:
  python3 build_cubicaje.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"
FONT_WOFF2 = HERE.parent / "fichas-tecnicas-hilux-3-versiones" / "assets" / "Inter-Latin-Variable.woff2"

DOC_NUMBER = "CBQ-WGT-2026-0903"
DOC_DATE = "03-09-2026"
MODEL_NAME = "KQ280"

# ── Measurements (mm unless noted) ──────────────────────────────────────
DRONE_L, DRONE_W, DRONE_H = 1900, 1900, 1800   # folded (arms + propellers)
DRONE_EXT_L, DRONE_EXT_W, DRONE_EXT_H = 4717, 4717, 1800  # arms extended, ref. only
CONT_L, CONT_W, CONT_H = 5899, 2352, 2393       # 20' GP internal
DOOR_W, DOOR_H = 2343, 2280

VOL_DRONE = DRONE_L * DRONE_W * DRONE_H / 1e9
VOL_CONT = CONT_L * CONT_W * CONT_H / 1e9
VOL_PCT = VOL_DRONE / VOL_CONT * 100
REMAIN_L = CONT_L - DRONE_L
CLEAR_W = CONT_W - DRONE_W
CLEAR_H = CONT_H - DRONE_H

EMPTY_WEIGHT = 224
BATTERY_UNIT = 17
BATTERY_QTY = 8
BATTERY_TOTAL = BATTERY_UNIT * BATTERY_QTY
EST_TOTAL_WEIGHT = EMPTY_WEIGHT + BATTERY_TOTAL

TABLE_ROWS = [
    ("Dimensiones", "Largo × Ancho × Alto — plegado (brazos y hélices)",
     f"{DRONE_L:,} × {DRONE_W:,} × {DRONE_H:,} mm"),
    ("Dimensiones", "Largo × Ancho × Alto — brazos extendidos (referencia, no aplica a embalaje)",
     f"{DRONE_EXT_L:,} × {DRONE_EXT_W:,} × {DRONE_EXT_H:,} mm"),
    ("Dimensiones", "Volumen ocupado (plegado)", f"{VOL_DRONE:.3f} m³ ({VOL_DRONE:.1f} CBM)"),
    ("Peso", "Peso vacío (sin baterías)", f"{EMPTY_WEIGHT} kg"),
    ("Peso", "Baterías", f"{BATTERY_QTY} × {BATTERY_UNIT} kg = {BATTERY_TOTAL} kg"),
    ("Peso", "Peso total estimado (unidad + baterías)", f"≈ {EST_TOTAL_WEIGHT} kg"),
    ("Contenedor de referencia", "Tipo", "20' GP (dry standard)"),
    ("Contenedor de referencia", "Dimensiones internas (L × A × Alt)",
     f"{CONT_L:,} × {CONT_W:,} × {CONT_H:,} mm"),
    ("Contenedor de referencia", "Volumen interno", f"{VOL_CONT:.1f} m³"),
    ("Contenedor de referencia", "Abertura de puerta (A × Alt)", f"{DOOR_W:,} × {DOOR_H:,} mm"),
    ("Aprovechamiento", "% de volumen del contenedor ocupado (1 unidad)", f"{VOL_PCT:.1f} %"),
    ("Aprovechamiento", "Holgura en ancho (total, ambos lados)", f"{CLEAR_W} mm"),
    ("Aprovechamiento", "Holgura en alto", f"{CLEAR_H} mm"),
    ("Aprovechamiento", "Longitud remanente en el contenedor", f"{REMAIN_L:,} mm"),
]


def money(n):
    return f"{n:,.0f}"


ROWS_HTML = "\n".join(
    f'<tr><td class="cb-cat">{cat}</td><td class="cb-label">{label}</td>'
    f'<td class="cb-value">{value}</td></tr>'
    for cat, label, value in TABLE_ROWS
)

LOGO_RAW = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO_RAW = LOGO_RAW[LOGO_RAW.index("<svg"):]
LOGO_DARK = LOGO_RAW.replace("<svg ", '<svg class="cb-logo" ', 1)

FONT_B64 = base64.b64encode(FONT_WOFF2.read_bytes()).decode("ascii")
FONT_FACE_CSS = f"""
  @font-face {{
    font-family: 'Inter';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(data:font/woff2;base64,{FONT_B64}) format('woff2');
  }}
"""

# ── Scaled technical diagram (top view + side view) ─────────────────────
SCALE = 0.068  # px per mm
X0 = 90
Y_TOP = 45
CONT_L_PX = CONT_L * SCALE
CONT_W_PX = CONT_W * SCALE
CONT_H_PX = CONT_H * SCALE
DRONE_L_PX = DRONE_L * SCALE
DRONE_W_PX = DRONE_W * SCALE
DRONE_H_PX = DRONE_H * SCALE

top_drone_x = X0
top_drone_y = Y_TOP + (CONT_W_PX - DRONE_W_PX) / 2
Y_SIDE = Y_TOP + CONT_W_PX + 65
side_drone_x = X0
side_drone_y = Y_SIDE + CONT_H_PX - DRONE_H_PX

DIAGRAM_SVG = f"""
<svg viewBox="0 0 900 {Y_SIDE + CONT_H_PX + 10:.0f}" style="width:100%;height:auto;display:block" role="img" aria-label="Diagrama de cubicaje">
  <rect x="0" y="0" width="900" height="{Y_SIDE + CONT_H_PX + 10:.0f}" fill="#eef2f8"/>

  <!-- ═══ TOP VIEW ═══ -->
  <text x="{X0}" y="{Y_TOP - 30}" font-family="var(--font-ui)" font-weight="700" font-size="13" fill="#0f1216" letter-spacing="0.04em">VISTA SUPERIOR (PLANTA)</text>

  <!-- container floor -->
  <rect x="{X0}" y="{Y_TOP}" width="{CONT_L_PX:.1f}" height="{CONT_W_PX:.1f}" fill="#ffffff" stroke="#0f1216" stroke-width="2"/>
  <!-- drone footprint -->
  <rect x="{top_drone_x:.1f}" y="{top_drone_y:.1f}" width="{DRONE_L_PX:.1f}" height="{DRONE_W_PX:.1f}" fill="#24417a" fill-opacity="0.18" stroke="#24417a" stroke-width="2"/>
  <text x="{top_drone_x + DRONE_L_PX/2:.1f}" y="{top_drone_y + DRONE_W_PX/2 - 4:.1f}" text-anchor="middle" font-family="var(--font-ui)" font-weight="700" font-size="12" fill="#24417a">KQ280</text>
  <text x="{top_drone_x + DRONE_L_PX/2:.1f}" y="{top_drone_y + DRONE_W_PX/2 + 12:.1f}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="#24417a">{DRONE_L}×{DRONE_W} mm</text>

  <!-- length dimension line (below container) -->
  <line x1="{X0}" y1="{Y_TOP + CONT_W_PX + 22:.1f}" x2="{X0 + CONT_L_PX:.1f}" y2="{Y_TOP + CONT_W_PX + 22:.1f}" stroke="#0f1216" stroke-width="1"/>
  <line x1="{X0}" y1="{Y_TOP + CONT_W_PX + 16:.1f}" x2="{X0}" y2="{Y_TOP + CONT_W_PX + 28:.1f}" stroke="#0f1216" stroke-width="1"/>
  <line x1="{X0 + CONT_L_PX:.1f}" y1="{Y_TOP + CONT_W_PX + 16:.1f}" x2="{X0 + CONT_L_PX:.1f}" y2="{Y_TOP + CONT_W_PX + 28:.1f}" stroke="#0f1216" stroke-width="1"/>
  <text x="{X0 + CONT_L_PX/2:.1f}" y="{Y_TOP + CONT_W_PX + 36:.1f}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="#0f1216">Largo interno: {CONT_L:,} mm</text>

  <!-- remaining length bracket -->
  <line x1="{top_drone_x + DRONE_L_PX:.1f}" y1="{Y_TOP - 10:.1f}" x2="{X0 + CONT_L_PX:.1f}" y2="{Y_TOP - 10:.1f}" stroke="#b4551f" stroke-width="1.2"/>
  <line x1="{top_drone_x + DRONE_L_PX:.1f}" y1="{Y_TOP - 16:.1f}" x2="{top_drone_x + DRONE_L_PX:.1f}" y2="{Y_TOP - 4:.1f}" stroke="#b4551f" stroke-width="1.2"/>
  <line x1="{X0 + CONT_L_PX:.1f}" y1="{Y_TOP - 16:.1f}" x2="{X0 + CONT_L_PX:.1f}" y2="{Y_TOP - 4:.1f}" stroke="#b4551f" stroke-width="1.2"/>
  <text x="{top_drone_x + DRONE_L_PX + (CONT_L_PX-DRONE_L_PX)/2:.1f}" y="{Y_TOP - 16:.1f}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" fill="#b4551f">Remanente: {REMAIN_L:,} mm</text>

  <!-- width dimension line (left of container) -->
  <line x1="{X0 - 22:.1f}" y1="{Y_TOP:.1f}" x2="{X0 - 22:.1f}" y2="{Y_TOP + CONT_W_PX:.1f}" stroke="#0f1216" stroke-width="1"/>
  <line x1="{X0 - 28:.1f}" y1="{Y_TOP:.1f}" x2="{X0 - 16:.1f}" y2="{Y_TOP:.1f}" stroke="#0f1216" stroke-width="1"/>
  <line x1="{X0 - 28:.1f}" y1="{Y_TOP + CONT_W_PX:.1f}" x2="{X0 - 16:.1f}" y2="{Y_TOP + CONT_W_PX:.1f}" stroke="#0f1216" stroke-width="1"/>
  <text x="{X0 - 34:.1f}" y="{Y_TOP + CONT_W_PX/2:.1f}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" fill="#0f1216" transform="rotate(-90 {X0-34:.1f} {Y_TOP + CONT_W_PX/2:.1f})">Ancho interno: {CONT_W:,} mm</text>

  <!-- width clearance -->
  <text x="{X0 + CONT_L_PX + 12:.1f}" y="{top_drone_y - 6:.1f}" font-family="var(--font-mono)" font-size="9.5" fill="#b4551f">Holgura {CLEAR_W//2} mm</text>
  <text x="{X0 + CONT_L_PX + 12:.1f}" y="{top_drone_y + DRONE_W_PX + 12:.1f}" font-family="var(--font-mono)" font-size="9.5" fill="#b4551f">Holgura {CLEAR_W//2} mm</text>

  <!-- ═══ SIDE VIEW ═══ -->
  <text x="{X0}" y="{Y_SIDE - 8}" font-family="var(--font-ui)" font-weight="700" font-size="13" fill="#0f1216" letter-spacing="0.04em">VISTA LATERAL (ELEVACIÓN)</text>

  <rect x="{X0}" y="{Y_SIDE:.1f}" width="{CONT_L_PX:.1f}" height="{CONT_H_PX:.1f}" fill="#ffffff" stroke="#0f1216" stroke-width="2"/>
  <rect x="{side_drone_x:.1f}" y="{side_drone_y:.1f}" width="{DRONE_L_PX:.1f}" height="{DRONE_H_PX:.1f}" fill="#24417a" fill-opacity="0.18" stroke="#24417a" stroke-width="2"/>
  <text x="{side_drone_x + DRONE_L_PX/2:.1f}" y="{side_drone_y + DRONE_H_PX/2 + 4:.1f}" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="11" fill="#24417a">{DRONE_H} mm alto</text>

  <!-- height clearance -->
  <line x1="{side_drone_x + DRONE_L_PX/2:.1f}" y1="{Y_SIDE:.1f}" x2="{side_drone_x + DRONE_L_PX/2:.1f}" y2="{side_drone_y:.1f}" stroke="#b4551f" stroke-width="1.2"/>
  <line x1="{side_drone_x + DRONE_L_PX/2 - 6:.1f}" y1="{Y_SIDE:.1f}" x2="{side_drone_x + DRONE_L_PX/2 + 6:.1f}" y2="{Y_SIDE:.1f}" stroke="#b4551f" stroke-width="1.2"/>
  <line x1="{side_drone_x + DRONE_L_PX/2 - 6:.1f}" y1="{side_drone_y:.1f}" x2="{side_drone_x + DRONE_L_PX/2 + 6:.1f}" y2="{side_drone_y:.1f}" stroke="#b4551f" stroke-width="1.2"/>
  <text x="{side_drone_x + DRONE_L_PX/2 + 10:.1f}" y="{Y_SIDE + (side_drone_y-Y_SIDE)/2 + 4:.1f}" font-family="var(--font-mono)" font-size="10" fill="#b4551f">Holgura {CLEAR_H} mm</text>

  <!-- height dimension line -->
  <line x1="{X0 - 22:.1f}" y1="{Y_SIDE:.1f}" x2="{X0 - 22:.1f}" y2="{Y_SIDE + CONT_H_PX:.1f}" stroke="#0f1216" stroke-width="1"/>
  <line x1="{X0 - 28:.1f}" y1="{Y_SIDE:.1f}" x2="{X0 - 16:.1f}" y2="{Y_SIDE:.1f}" stroke="#0f1216" stroke-width="1"/>
  <line x1="{X0 - 28:.1f}" y1="{Y_SIDE + CONT_H_PX:.1f}" x2="{X0 - 16:.1f}" y2="{Y_SIDE + CONT_H_PX:.1f}" stroke="#0f1216" stroke-width="1"/>
  <text x="{X0 - 34:.1f}" y="{Y_SIDE + CONT_H_PX/2:.1f}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" fill="#0f1216" transform="rotate(-90 {X0-34:.1f} {Y_SIDE + CONT_H_PX/2:.1f})">Alto interno: {CONT_H:,} mm</text>
</svg>
"""

FILLBAR_SVG = f"""
<svg viewBox="0 0 900 70" style="width:100%;height:auto;display:block" role="img" aria-label="Aprovechamiento volumétrico">
  <rect x="0" y="24" width="900" height="22" rx="3" fill="#e5e9f0" stroke="#c3cbda" stroke-width="1"/>
  <rect x="0" y="24" width="{900*VOL_PCT/100:.1f}" height="22" rx="3" fill="#24417a"/>
  <text x="0" y="16" font-family="var(--font-ui)" font-weight="700" font-size="12" fill="#0f1216">Aprovechamiento volumétrico — 1 unidad en contenedor 20' GP</text>
  <text x="{900*VOL_PCT/100 + 10:.1f}" y="40" font-family="var(--font-mono)" font-weight="700" font-size="12" fill="#24417a">{VOL_PCT:.1f}%</text>
  <text x="0" y="62" font-family="var(--font-mono)" font-size="10.5" fill="#6b7280">{VOL_DRONE:.1f} m³ ocupados de {VOL_CONT:.1f} m³ disponibles</text>
</svg>
"""

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cubicaje · {MODEL_NAME} · Wings Global Trade</title>
<style>{FONT_FACE_CSS}
  :root {{
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
  }}
  html, body {{ margin: 0; padding: 0; }}
  body {{ background: #52555a; }}
  .cb-page {{ min-height: 100vh; padding: 28px 16px 48px; }}
  .cb-page .cb-doc {{ box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }}

  .cb-doc {{
    --cb-ink: #0f1216; --cb-muted: #6b7280; --cb-line: #d1d5db;
    --cb-accent: #24417a; --cb-warn: #b4551f;
    box-sizing: border-box; width: 100%; max-width: 900px; margin: 0 auto;
    padding: 26px 48px 8px; background: #ffffff; color: var(--cb-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 11.5px; line-height: 1.35;
  }}
  .cb-doc *, .cb-doc *::before, .cb-doc *::after {{ box-sizing: border-box; }}

  .cb-uso-interno {{
    display: inline-block; background: #fef3e7; border: 1px solid #e3a765; color: #8a4f0e;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 3px; margin-bottom: 10px;
  }}
  .cb-header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }}
  .cb-title {{ margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.015em; line-height: 1; }}
  .cb-subtitle {{ margin: 4px 0 0; font-size: 12.5px; color: var(--cb-muted); }}
  .cb-number {{ margin-top: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--cb-ink); }}
  .cb-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 4px; flex-shrink: 0; }}
  .cb-logo {{ height: 40px; width: auto; filter: brightness(0); }}

  .cb-rule {{ position: relative; height: 3px; margin: 14px 0 16px; background: var(--cb-line); }}
  .cb-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 140px; background: var(--cb-warn); }}

  .cb-section-bar {{
    display: flex; align-items: baseline; gap: 10px; background: #f4f5f4;
    border-left: 3px solid var(--cb-accent); padding: 6px 12px; margin: 16px 0 8px;
  }}
  .cb-sec-title {{ font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }}

  .cb-diagram-wrap {{ border: 1px solid var(--cb-line); padding: 8px 6px; break-inside: avoid; }}

  .cb-table {{ width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }}
  .cb-table th {{ text-align: left; font-size: 9.5px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--cb-muted); border-bottom: 1px solid var(--cb-ink); padding: 0 8px 5px; font-weight: 700; }}
  .cb-table td {{ padding: 5.5px 8px; border-bottom: 1px solid #eef0f2; vertical-align: top; }}
  .cb-cat {{ color: var(--cb-accent); font-weight: 700; font-size: 10px; letter-spacing: 0.03em; text-transform: uppercase; width: 22%; }}
  .cb-label {{ width: 48%; }}
  .cb-value {{ font-family: var(--font-mono); font-weight: 600; }}

  .cb-notes {{ margin: 0; padding-left: 18px; font-size: 10.8px; line-height: 1.42; color: var(--cb-ink); }}
  .cb-notes li {{ margin-bottom: 2px; }}
  .cb-notes li:last-child {{ margin-bottom: 0; }}

  .cb-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 3px; padding-top: 3px; border-top: 1px solid var(--cb-line); color: var(--cb-muted); font-size: 10.5px; }}

  @media print {{
    @page {{ size: A4 landscape; margin: 8mm; }}
    body {{ background: #ffffff; }}
    .cb-page {{ min-height: 0; padding: 0; }}
    .cb-page .cb-doc {{ box-shadow: none; }}
    .cb-doc {{ max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  }}
</style>
</head>
<body>
<div class="cb-page">
<article class="cb-doc">

  <div class="cb-uso-interno">Uso interno · Documento técnico para freight forwarders — no distribuir al cliente final</div>

  <header class="cb-header">
    <div>
      <h1 class="cb-title">Especificación de Embalaje y Cubicaje</h1>
      <p class="cb-subtitle">{MODEL_NAME} — Dron Multirotor de Carga Pesada · Unidad plegada, sin crate</p>
      <p class="cb-number">{DOC_NUMBER} · Preparado: {DOC_DATE}</p>
    </div>
    <div class="cb-brand">
      {LOGO_DARK}
    </div>
  </header>
  <div class="cb-rule" aria-hidden="true"></div>

  <div class="cb-section-bar"><span class="cb-sec-title">Diagrama técnico — 1 unidad en contenedor 20' GP</span></div>
  <div class="cb-diagram-wrap">
    {DIAGRAM_SVG}
  </div>

  {FILLBAR_SVG}

  <div class="cb-section-bar"><span class="cb-sec-title">Tabla de medidas</span></div>
  <table class="cb-table">
    <thead>
      <tr><th>Categoría</th><th>Medida</th><th>Valor</th></tr>
    </thead>
    <tbody>
      {ROWS_HTML}
    </tbody>
  </table>

  <div class="cb-section-bar"><span class="cb-sec-title">Notas para el forwarder</span></div>
  <ul class="cb-notes">
    <li>Medidas basadas en la configuración <strong>plegada</strong> (brazos y hélices plegados) según ficha técnica del fabricante — no incluyen crate, paletizado ni material de sujeción/bracing, que añadirán volumen y peso adicionales.</li>
    <li>Las baterías de litio (8 × 17 kg, 24S) pueden requerir declaración IMDG/DGR y documentación específica según el modo de transporte (marítimo/aéreo) — confirmar clasificación UN antes de reservar espacio.</li>
    <li>Con 1 unidad cargada, quedan {REMAIN_L:,} mm de longitud disponibles en el contenedor — suficientes para el set de accesorios (control remoto, cargador, baterías adicionales, estación RTK) o, en teoría, una segunda unidad en sentido longitudinal (2 × {DRONE_L:,} mm = {2*DRONE_L:,} mm ≤ {CONT_L:,} mm). Dos unidades NO caben lado a lado (ancho combinado {2*DRONE_W:,} mm {'>' } ancho interno {CONT_W:,} mm).</li>
    <li>Peso total estimado por unidad (≈{EST_TOTAL_WEIGHT} kg) está muy por debajo del payload típico de un 20' GP (~28,000 kg) — el volumen, no el peso, es la variable limitante para esta carga.</li>
    <li>Confirmar dimensiones de crate real con el proveedor antes de cotizar flete — estas medidas son de la unidad sin embalar.</li>
  </ul>

  <footer class="cb-footer">
    <div>Wings Global Trade · Documento técnico interno — uso en cotización y reserva de espacio con forwarders</div>
    <div>{DOC_NUMBER}</div>
  </footer>

</article>
</div>
</body>
</html>
"""

out = HERE / "cubicaje.html"
out.write_text(HTMLDOC, encoding="utf-8")
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"vol_drone={VOL_DRONE:.3f}m3 vol_cont={VOL_CONT:.1f}m3 pct={VOL_PCT:.1f}% remain_len={REMAIN_L}mm")
