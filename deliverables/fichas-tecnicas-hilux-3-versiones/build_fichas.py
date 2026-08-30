#!/usr/bin/env python3
"""Build three Wings Global Trade branded ficha técnica documents — one per
trim — from the client-supplied Vietnamese/English factory comparison sheet
(DOC20260828WA0136.pdf: "Hilux Standard 2.8 4x2 MT" / "Hilux Pro 2.8 4x2 AT"
/ "Hilux Trailhunter 2.8 4x4 AT"). Each ficha lists only the features PRESENT
on that trim (positive-listing style, matching every prior Wings ficha) —
translated to Spanish, using the established `pdoc` grid/logo/footer and
audit-informed typography (check-badge for boolean specs).

Nameplates: kept as the ORIGINAL Toyota trim names from the source sheet
(2026-08-28 correction — "Travo" was a one-off custom nameplate created for
a different, unrelated Hilux ficha earlier this session; it does not apply
here):
  Hilux Standard 2.8 4x2 MT    -> Toyota Hilux Standard
  Hilux Pro 2.8 4x2 AT         -> Toyota Hilux Pro
  Hilux Trailhunter 2.8 4x4 AT -> Toyota Hilux Trailhunter (unrelated to,
    and a separate deliverable from, ficha-tecnica-hilux-travo-overland/ —
    that "Travo Overland" ficha covers a different custom-branded vehicle
    and is left untouched)

Run:
  python3 build_fichas.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"
FONT_WOFF2 = HERE / "assets" / "Inter-Latin-Variable.woff2"
DOC_DATE = "28-08-2026"

# ── Per-trim content ─────────────────────────────────────────────────────
TRIMS = [
    {
        "slug": "standard",
        "doc_number": "FT-WGT-2026-0829",
        "model_name": "Toyota Hilux Standard",
        "model_trim": "2.8L Diésel · 4x2 · Manual de 6 velocidades",
        "hero_stats": [
            ("Potencia máxima", "204 PS"),
            ("Torque máximo", "420 N·m"),
            ("Transmisión", "6MT"),
            ("Tracción", "4x2"),
        ],
        "sections": [
            (1, "Identificación", [
                ("Modelo", "Toyota Hilux Standard"),
                ("Versión", "2.8L Diésel · 4x2 · Manual de 6 velocidades"),
                ("Carrocería", "Pickup, 4 puertas, doble cabina"),
                ("Tipo de combustible", "Diésel"),
                ("Fabricante", "Toyota"),
            ]),
            (2, "Dimensiones y Pesos", [
                ("Longitud × Ancho × Alto (mm)", "5,320 × 1,855 × 1,815"),
                ("Distancia entre ejes (mm)", "3,085"),
                ("Distancia libre al suelo (mm)", "312"),
                ("Peso en orden de marcha (kg)", "1,968"),
                ("Peso bruto vehicular (kg)", "2,850"),
            ]),
            (3, "Motor y Transmisión", [
                ("Modelo de motor", "1GD-FTV"),
                ("Tipo de motor", "2.8L Diésel turbo, 4 cilindros en línea"),
                ("Cilindrada (cc)", "2,755"),
                ("Potencia máxima", "150 kW (204 PS) / 3,400 rpm"),
                ("Torque máximo", "420 N·m / 1,400–3,400 rpm"),
                ("Estándar de emisiones", "Euro 5"),
                ("Transmisión", "Manual de 6 velocidades"),
                ("Tracción", "4x2 (RWD)"),
            ]),
            (4, "Chasis, Frenos y Neumáticos", [
                ("Suspensión", "Delantera doble horquilla / Trasera ballestas de eje rígido"),
                ("Rines / Neumáticos", "Acero, 265/65 R17"),
                ("Frenos (Delanteros)", "Discos ventilados"),
                ("Frenos (Posteriores)", "Tambor"),
            ]),
            (5, "Seguridad Activa y Asistencia a la Conducción", [
                ("Frenos antibloqueo (ABS)", "Sí"),
                ("Asistencia de frenado (BA)", "Sí"),
                ("Distribución electrónica de frenado (EBD)", "Sí"),
                ("Control de estabilidad (VSC)", "Sí"),
                ("Control de tracción (TRC)", "Sí"),
                ("Asistencia de ascenso (HAC)", "Sí"),
                ("Luz de freno de emergencia (EBS)", "Sí"),
                ("Cámara", "Cámara de reversa"),
            ]),
            (6, "Seguridad Pasiva", [
                ("Airbags frontales (conductor y copiloto)", "Sí"),
                ("Airbag de rodilla (conductor)", "Sí"),
            ]),
            (7, "Equipamiento Interior", [
                ("Timón (Tipo)", "3 radios"),
                ("Timón (Material)", "Uretano"),
                ("Controles en el timón", "Audio, manos libres"),
                ("Timón (Ajuste)", "Manual, inclinación y profundidad"),
                ("Dirección", "Hidráulica de asistencia variable (VFC)"),
                ("Espejo retrovisor interior", "Día/noche, manual"),
                ("Asientos (Material)", "Tela"),
                ("Asiento del conductor", "Ajuste manual, 6 direcciones"),
                ("Asiento del copiloto", "Ajuste manual, 4 direcciones"),
                ("Aire acondicionado", "Manual"),
                ("Filtro de aire (habitáculo)", "Purificador PM2.5"),
                ("Pantalla central", "Táctil, 9\""),
                ("Sistema de audio", "4 parlantes"),
                ("Conectividad", "USB + Bluetooth, manos libres"),
                ("Conexión de smartphone", "Sí"),
                ("Seguro de puertas", "Eléctrico, automático por velocidad"),
                ("Seguro de puertas a distancia", "Sí"),
                ("Ventanas eléctricas", "4 puertas, un toque + antiatrapamiento"),
                ("Sistema Start-Stop", "Sí"),
            ]),
            (8, "Equipamiento Exterior e Iluminación", [
                ("Faro bajo (Luz de cruce)", "Bi-LED tipo proyector"),
                ("Faro alto (Luz de carretera)", "Bi-LED tipo proyector"),
                ("Control automático de luces", "Sí"),
                ("Alerta de luces encendidas", "Sí"),
                ("Luces traseras", "Bombilla convencional"),
                ("Luz de freno superior (Stop)", "LED"),
                ("Espejos exteriores", "Ajuste eléctrico, luz de giro integrada"),
                ("Desempañador de luna trasera", "Sí"),
                ("Defensas delantera y trasera", "Sí"),
            ]),
        ],
    },
    {
        "slug": "pro",
        "doc_number": "FT-WGT-2026-0830",
        "model_name": "Toyota Hilux Pro",
        "model_trim": "2.8L Diésel · 4x2 · Automática de 6 velocidades",
        "hero_stats": [
            ("Potencia máxima", "204 PS"),
            ("Torque máximo", "500 N·m"),
            ("Transmisión", "6AT"),
            ("Tracción", "4x2"),
        ],
        "sections": [
            (1, "Identificación", [
                ("Modelo", "Toyota Hilux Pro"),
                ("Versión", "2.8L Diésel · 4x2 · Automática de 6 velocidades"),
                ("Carrocería", "Pickup, 4 puertas, doble cabina"),
                ("Tipo de combustible", "Diésel"),
                ("Fabricante", "Toyota"),
            ]),
            (2, "Dimensiones y Pesos", [
                ("Longitud × Ancho × Alto (mm)", "5,320 × 1,885 × 1,815"),
                ("Distancia entre ejes (mm)", "3,085"),
                ("Distancia libre al suelo (mm)", "312"),
                ("Peso en orden de marcha (kg)", "1,980"),
                ("Peso bruto vehicular (kg)", "2,850"),
            ]),
            (3, "Motor y Transmisión", [
                ("Modelo de motor", "1GD-FTV"),
                ("Tipo de motor", "2.8L Diésel turbo, 4 cilindros en línea"),
                ("Cilindrada (cc)", "2,755"),
                ("Potencia máxima", "150 kW (204 PS) / 3,000–3,400 rpm"),
                ("Torque máximo", "500 N·m / 1,600–2,800 rpm"),
                ("Estándar de emisiones", "Euro 5"),
                ("Modo de manejo", "ECO / Normal / SPORT"),
                ("Transmisión", "Automática de 6 velocidades"),
                ("Tracción", "4x2 (RWD)"),
            ]),
            (4, "Chasis, Frenos y Neumáticos", [
                ("Suspensión", "Delantera doble horquilla / Trasera ballestas de eje rígido"),
                ("Rines / Neumáticos", "Acero, 265/65 R17"),
                ("Frenos (Delanteros)", "Discos ventilados"),
                ("Frenos (Posteriores)", "Tambor"),
            ]),
            (5, "Seguridad Activa y Asistencia a la Conducción", [
                ("Frenos antibloqueo (ABS)", "Sí"),
                ("Asistencia de frenado (BA)", "Sí"),
                ("Distribución electrónica de frenado (EBD)", "Sí"),
                ("Control de estabilidad (VSC)", "Sí"),
                ("Control de tracción (TRC)", "Sí"),
                ("Asistencia de ascenso (HAC)", "Sí"),
                ("Luz de freno de emergencia (EBS)", "Sí"),
                ("Cámara", "Cámara de reversa"),
                ("Sensores de estacionamiento", "Traseros, esquinas + centro"),
            ]),
            (6, "Seguridad Pasiva", [
                ("Airbags frontales (conductor y copiloto)", "Sí"),
                ("Airbag de rodilla (conductor)", "Sí"),
            ]),
            (7, "Equipamiento Interior", [
                ("Timón (Tipo)", "3 radios"),
                ("Timón (Material)", "Uretano"),
                ("Controles en el timón", "Audio, manos libres, pantalla multiinformación"),
                ("Timón (Ajuste)", "Manual, inclinación y profundidad"),
                ("Dirección", "Hidráulica de asistencia variable (VFC)"),
                ("Espejo retrovisor interior", "Día/noche, manual"),
                ("Indicador Eco", "Sí"),
                ("Indicador de consumo de combustible", "Sí"),
                ("Indicador de posición de cambios", "Sí"),
                ("Pantalla multiinformación (MID)", "TFT color, 7\""),
                ("Asientos (Material)", "Tela"),
                ("Asiento del conductor", "Ajuste manual, 6 direcciones"),
                ("Asiento del copiloto", "Ajuste manual, 4 direcciones"),
                ("Apoyabrazos trasero", "Sí, con 2 portavasos"),
                ("Aire acondicionado", "Manual"),
                ("Filtro de aire (habitáculo)", "Purificador PM2.5"),
                ("Pantalla central", "Táctil, 9\""),
                ("Sistema de audio", "8 parlantes"),
                ("Conectividad", "USB + Bluetooth, manos libres"),
                ("Conexión de smartphone", "Sí"),
                ("Seguro de puertas", "Eléctrico, automático por velocidad"),
                ("Seguro de puertas a distancia", "Sí"),
                ("Ventanas eléctricas", "4 puertas, un toque + antiatrapamiento"),
                ("Sistema Start-Stop", "Sí"),
                ("Control crucero", "Sí"),
            ]),
            (8, "Equipamiento Exterior e Iluminación", [
                ("Faro bajo (Luz de cruce)", "Bi-LED tipo proyector"),
                ("Faro alto (Luz de carretera)", "Bi-LED tipo proyector"),
                ("Luces diurnas (DRL)", "LED"),
                ("Control automático de luces", "Sí"),
                ("Alerta de luces encendidas", "Sí"),
                ("Ajuste de altura de faros", "Automático"),
                ("Luz de bienvenida (faros)", "Sí"),
                ("Luces traseras", "LED"),
                ("Luz de freno superior (Stop)", "LED"),
                ("Espejos exteriores", "Ajuste eléctrico, luz de giro integrada"),
                ("Desempañador de luna trasera", "Sí"),
                ("Defensas delantera y trasera", "Sí"),
            ]),
        ],
    },
    {
        "slug": "trailhunter",
        "doc_number": "FT-WGT-2026-0831",
        "model_name": "Toyota Hilux Trailhunter",
        "model_trim": "2.8L Diésel · 4WD · Automática de 6 velocidades",
        "hero_stats": [
            ("Potencia máxima", "204 PS"),
            ("Torque máximo", "500 N·m"),
            ("Transmisión", "6AT"),
            ("Tracción", "4WD"),
        ],
        "sections": [
            (1, "Identificación", [
                ("Modelo", "Toyota Hilux Trailhunter"),
                ("Versión", "2.8L Diésel · 4WD · Automática de 6 velocidades"),
                ("Carrocería", "Pickup, 4 puertas, doble cabina"),
                ("Tipo de combustible", "Diésel"),
                ("Fabricante", "Toyota"),
            ]),
            (2, "Dimensiones y Pesos", [
                ("Longitud × Ancho × Alto (mm)", "5,320 × 1,885 × 1,815"),
                ("Distancia entre ejes (mm)", "3,085"),
                ("Distancia libre al suelo (mm)", "312"),
                ("Peso en orden de marcha (kg)", "2,095"),
                ("Peso bruto vehicular (kg)", "2,950"),
            ]),
            (3, "Motor y Transmisión", [
                ("Modelo de motor", "1GD-FTV"),
                ("Tipo de motor", "2.8L Diésel turbo, 4 cilindros en línea"),
                ("Cilindrada (cc)", "2,755"),
                ("Potencia máxima", "150 kW (204 PS) / 3,000–3,400 rpm"),
                ("Torque máximo", "500 N·m / 1,600–2,800 rpm"),
                ("Estándar de emisiones", "Euro 5"),
                ("Modo de manejo", "ECO / Normal / SPORT"),
                ("Sistema Multi-Terrain Select", "Nieve, Barro, Arena, Tierra y modo Automático"),
                ("Transmisión", "Automática de 6 velocidades"),
                ("Tracción", "4WD electrónico, tiempo parcial (part-time)"),
                ("Diferencial", "Bloqueo trasero"),
            ]),
            (4, "Chasis, Frenos y Neumáticos", [
                ("Suspensión", "Delantera doble horquilla / Trasera ballestas de eje rígido"),
                ("Rines / Neumáticos", "Aleación, 265/60 R18"),
                ("Frenos (Delanteros)", "Discos ventilados"),
                ("Frenos (Posteriores)", "Discos ventilados"),
            ]),
            (5, "Seguridad Activa y Asistencia a la Conducción", [
                ("Sistema de pre-colisión (PCS)", "Sí"),
                ("Alerta de cambio de carril (LDA)", "Sí"),
                ("Asistencia de mantenimiento de carril (LTA)", "Sí"),
                ("Control crucero", "Dynamic Radar Cruise Control (DRCC, adaptativo)"),
                ("Luces altas automáticas (AHB)", "Sí"),
                ("Monitor de punto ciego (BSM)", "Sí"),
                ("Alerta de tráfico cruzado trasero (RCTA)", "Sí"),
                ("Frenos antibloqueo (ABS)", "Sí"),
                ("Asistencia de frenado (BA)", "Sí"),
                ("Distribución electrónica de frenado (EBD)", "Sí"),
                ("Control de estabilidad (VSC)", "Sí"),
                ("Control de tracción (TRC)", "Sí"),
                ("Asistencia de ascenso (HAC)", "Sí"),
                ("Asistencia de descenso (DAC)", "Sí"),
                ("Freno de apoyo en estacionamiento (PKSB)", "Sí"),
                ("Sensor de presión de neumáticos (TPMS)", "Sí"),
                ("Luz de freno de emergencia (EBS)", "Sí"),
                ("Cámara", "360° / Panoramic View Monitor (PVM)"),
                ("Sensores de estacionamiento", "Delanteros y traseros, esquinas + centro"),
            ]),
            (6, "Seguridad Pasiva", [
                ("Airbags frontales (conductor y copiloto)", "Sí"),
                ("Airbag de rodilla (conductor)", "Sí"),
                ("Airbags laterales delanteros", "Sí"),
                ("Airbags de cortina", "Sí"),
            ]),
            (7, "Equipamiento Interior", [
                ("Timón (Tipo)", "3 radios"),
                ("Timón (Material)", "Cuero"),
                ("Controles en el timón",
                 "Audio, pantalla multiinformación, manos libres, control crucero adaptativo (DRCC), alerta de carril (LDA)"),
                ("Timón (Ajuste)", "Manual, inclinación y profundidad"),
                ("Dirección", "Asistencia eléctrica (EPS)"),
                ("Espejo retrovisor interior", "Auto-atenuante (electrocrómico)"),
                ("Indicador Eco", "Sí"),
                ("Indicador de consumo de combustible", "Sí"),
                ("Indicador de posición de cambios", "Sí"),
                ("Pantalla multiinformación (MID)", "Digital, 12\""),
                ("Asientos (Material)", "Cuero"),
                ("Asiento del conductor", "Ajuste eléctrico, 10 direcciones"),
                ("Asiento del copiloto", "Ajuste manual, 4 direcciones"),
                ("Apoyabrazos trasero", "Sí, con 2 portavasos"),
                ("Aire acondicionado", "Automático, bizona"),
                ("Filtro de aire (habitáculo)", "Purificador PM2.5"),
                ("Salida de aire trasera", "Sí"),
                ("Frigobar", "Sí"),
                ("Pantalla central", "Táctil, 12.3\""),
                ("Sistema de audio", "8 parlantes"),
                ("Conectividad", "USB + Bluetooth, manos libres"),
                ("Conexión de smartphone", "Sí, inalámbrica"),
                ("Llave inteligente", "Sí, Smart Entry + botón de arranque (Push Start)"),
                ("Freno de mano", "Electrónico (EPB) + Auto Hold"),
                ("Seguro de puertas", "Eléctrico, automático por velocidad"),
                ("Seguro de puertas a distancia", "Sí"),
                ("Ventanas eléctricas", "4 puertas, un toque + antiatrapamiento"),
                ("Carga inalámbrica", "Sí"),
                ("Sistema Start-Stop", "Sí"),
                ("Control crucero", "Sí"),
            ]),
            (8, "Equipamiento Exterior e Iluminación", [
                ("Faro bajo (Luz de cruce)", "Bi-LED tipo proyector"),
                ("Faro alto (Luz de carretera)", "Bi-LED tipo proyector"),
                ("Luces diurnas (DRL)", "LED"),
                ("Control automático de luces", "Sí"),
                ("Alerta de luces encendidas", "Sí"),
                ("Ajuste de altura de faros", "Automático"),
                ("Luz de bienvenida (faros)", "Sí"),
                ("Luces traseras", "LED"),
                ("Luz de freno superior (Stop)", "LED"),
                ("Faros antiniebla delanteros", "LED"),
                ("Faros antiniebla traseros", "LED"),
                ("Espejos exteriores", "Ajuste y plegado eléctrico automático, luz de giro integrada"),
                ("Desempañador de luna trasera", "Sí"),
                ("Defensas delantera y trasera", "Sí"),
            ]),
        ],
    },
]


def value_html(value: str) -> str:
    if value.startswith("Sí"):
        rest = value[2:].lstrip(",").strip()
        detail = f' <span class="spec-detail">{rest}</span>' if rest else ""
        return f'<span class="spec-check" aria-hidden="true">✓</span><span class="spec-affirm">Sí</span>{detail}'
    return value


def rows_html(rows):
    return "\n".join(
        f'<div class="spec-row"><span class="spec-label">{label}</span>'
        f'<span class="spec-value">{value_html(value)}</span></div>'
        for label, value in rows
    )


def section_html(idx, title, rows):
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


LOGO_RAW = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO_RAW = LOGO_RAW[LOGO_RAW.index("<svg"):]
LOGO_RAW = LOGO_RAW.replace("<svg ", '<svg class="pdoc-logo" ', 1)

# Audit finding (visual-audit skill, 2026-08-30): every prior Wings PDF in this
# series declared `font-family: 'Inter', ...` but never actually loaded Inter —
# the render sandbox has no system Inter, so every document has silently been
# rendering in the DejaVu Sans fallback. Embedding the real variable font here
# (base64, self-contained — no network dependency at render time) is the
# single highest-impact typography fix available.
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

CSS = FONT_FACE_CSS + """
  :root {
    --font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Inter', ui-monospace, 'SF Mono', Menlo, monospace;
  }
  html, body { margin: 0; padding: 0; }
  body { background: #52555a; }
  .pdoc-page { min-height: 100vh; padding: 28px 16px 48px; }
  .pdoc-page .pdoc { box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); }

  .pdoc {
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db;
    --pd-bar: #f4f5f4; --pd-tint: #f7f8f9; --pd-accent: #24417a; --pd-pad-x: 52px;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 24px var(--pd-pad-x) 26px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }
  .pdoc *, .pdoc *::before, .pdoc *::after { box-sizing: border-box; }

  .pdoc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
  .pdoc-title { margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; line-height: 0.92; }
  .pdoc-number { margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }
  .pdoc-brand { display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 6px; flex-shrink: 0; }
  .pdoc-logo { height: 58px; width: auto; filter: brightness(0); }
  .pdoc-tagline { font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }

  .pdoc-rule { position: relative; height: 3px; margin: 10px 0 16px; background: var(--pd-line); }
  .pdoc-rule::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-accent); }

  .pdoc-dateline { display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 14px; font-size: 11.5px; color: var(--pd-muted); }
  .pdoc-dateline span:not(:last-child)::after { content: '|'; margin-left: 16px; color: var(--pd-line); }

  .pdoc-hero { border: 1px solid var(--pd-line); border-top: 3px solid var(--pd-accent); padding: 14px 18px; margin-bottom: 12px; break-inside: avoid; }
  .pdoc-hero-name { font-size: 25px; font-weight: 800; letter-spacing: -0.015em; }
  .pdoc-hero-trim { margin-top: 3px; font-size: 12.5px; color: var(--pd-muted); }
  .pdoc-hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 11px; }
  .pdoc-hero-stat { border-top: 2px solid var(--pd-ink); padding-top: 7px; }
  .pd-hero-label { display: block; font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pd-muted); }
  .pd-hero-value { display: block; margin-top: 2px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 13.5px; white-space: nowrap; font-variant-numeric: tabular-nums; }

  .pdoc-section-bar {
    display: flex; align-items: baseline; gap: 10px; background: var(--pd-bar);
    border-left: 3px solid var(--pd-accent); padding: 7px 12px; margin: 26px 0 12px;
    break-after: avoid; break-inside: avoid;
  }
  .pdoc-spec-section:first-of-type .pdoc-section-bar { margin-top: 0; }
  .pd-sec-index { font-family: var(--font-mono, monospace); font-weight: 700; font-size: 15px; color: var(--pd-accent); }
  .pd-sec-title { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }

  .pdoc-spec-section { margin-bottom: 4px; }
  .pdoc-spec-grid { display: flex; flex-direction: column; padding: 0 4px; font-size: 11.5px; }
  .spec-row { display: grid; grid-template-columns: 260px 1fr; align-items: start; gap: 6px 16px; border-bottom: 1px solid var(--pd-tint); padding-bottom: 7px; margin-bottom: 7px; break-inside: avoid; }
  .spec-label { font-weight: 600; color: var(--pd-ink); }
  .spec-value { color: var(--pd-ink); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }

  .spec-check {
    display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;
    border-radius: 3px; background: var(--pd-accent); color: #fff; font-size: 10px; font-weight: 700;
    flex-shrink: 0; line-height: 1;
  }
  .spec-affirm { font-weight: 600; }
  .spec-detail { color: var(--pd-muted); }

  .pdoc-tail { margin-top: 20px; padding-top: 10px; break-inside: avoid; }
  .pdoc-note { font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 10px; }
  .pdoc-close-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
  .pdoc-close-signoff { margin-top: 2px; font-weight: 600; }

  .pdoc-footer { display: flex; justify-content: space-between; gap: 24px; margin-top: 10px; padding-top: 6px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }
  .pdoc-footer .pd-foot-right { text-align: right; }

  @media (max-width: 640px) {
    .pdoc { padding: 26px 20px 28px; }
    .pdoc-title { font-size: 32px; }
    .pdoc-hero-stats { grid-template-columns: repeat(2, 1fr); }
    .spec-row { grid-template-columns: 1fr; gap: 0; }
    .pdoc-close-row { flex-direction: column; align-items: flex-start; gap: 16px; }
    .pdoc-footer { flex-direction: column; gap: 12px; }
  }

  @media print {
    @page { size: A4 portrait; margin: 8mm; }
    body { background: #ffffff; }
    .pdoc-page { min-height: 0; padding: 0; }
    .pdoc-page .pdoc { box-shadow: none; }
    .pdoc { --pd-pad-x: 0px; max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdoc-close-row, .pdoc-footer { break-inside: avoid; }
  }
"""


def build(trim: dict) -> Path:
    sections_html = "\n".join(section_html(idx, title, rows) for idx, title, rows in trim["sections"])
    hero_stats_html = "\n      ".join(
        f'<div class="pdoc-hero-stat"><span class="pd-hero-label">{label}</span>'
        f'<span class="pd-hero-value">{value}</span></div>'
        for label, value in trim["hero_stats"]
    )

    htmldoc = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ficha Técnica · Wings Global Trade · {trim['model_name']}</title>
<style>{CSS}</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <header class="pdoc-header">
    <div>
      <h1 class="pdoc-title">Ficha Técnica</h1>
      <p class="pdoc-number">{trim['doc_number']}</p>
    </div>
    <div class="pdoc-brand">
      {LOGO_RAW}
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-dateline">
    <span>Preparado: {DOC_DATE}</span>
    <span>Origen: Tailandia</span>
    <span>Segmento: Pickup 4x4</span>
  </div>

  <div class="pdoc-hero">
    <div class="pdoc-hero-name">{trim['model_name']}</div>
    <div class="pdoc-hero-trim">{trim['model_trim']}</div>
    <div class="pdoc-hero-stats">
      {hero_stats_html}
    </div>
  </div>

  {sections_html}

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
    out_dir = HERE / trim["slug"]
    out_dir.mkdir(exist_ok=True)
    out = out_dir / "ficha.html"
    out.write_text(htmldoc, encoding="utf-8")
    n_rows = sum(len(rows) for _, _, rows in trim["sections"])
    print(f"wrote {out} ({len(htmldoc):,} bytes) — sections={len(trim['sections'])} rows={n_rows}")
    return out


if __name__ == "__main__":
    for trim in TRIMS:
        build(trim)
