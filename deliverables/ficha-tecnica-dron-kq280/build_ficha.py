#!/usr/bin/env python3
"""Build the Wings Global Trade branded ficha técnica for the KQ280 —
UFO POWER's all-electric heavy-lift multirotor drone (350 kg max payload),
translated from the client-supplied EN spec sheet (350_kg_Drone.pdf).

Uses the same `pdoc` design system as the Hilux fichas (embedded Inter
variable font, audit-fixed spacing, WhatsApp CTA), plus a new full-bleed
photo COVER page (this product line's first — no prior Wings ficha had one).
Run:
  python3 build_ficha.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"
FONT_WOFF2 = HERE.parent / "fichas-tecnicas-hilux-3-versiones" / "assets" / "Inter-Latin-Variable.woff2"
HERO_JPG = HERE / "assets" / "hero.jpg"

DOC_NUMBER = "FT-WGT-2026-0903"
DOC_DATE = "03-09-2026"
MODEL_NAME = "KQ280"
MODEL_TAGLINE = "Dron Multirotor Eléctrico de Carga Pesada"
MODEL_SCENARIO = "Transporte logístico en zonas montañosas y otros escenarios"
MANUFACTURER = "UFO POWER"

HERO_STATS = [
    ("Carga máxima", "350 kg"),
    ("Velocidad máxima", "15 m/s"),
    ("Rango de temperatura", "-20 °C a 50 °C"),
]

# ── Sections: (idx, título, [(label, value), ...]) ──────────────────────
SECTIONS = [
    (1, "KQ280 — Dron Multirotor de Carga Pesada", [
        ("Peso vacío", "224 kg (sin baterías ni peso de eslinga)"),
        ("Capacidad de carga nominal", "300 kg"),
        ("Capacidad de carga máxima", "350 kg"),
        ("Método de plegado", "Brazos plegables hacia abajo"),
        ("Distancia máxima entre ejes (brazos extendidos)", "4,600 mm"),
        ("Dimensiones exteriores — brazos y hélices plegados", "1,900 × 1,900 × 1,800 mm"),
        ("Dimensiones exteriores — brazos extendidos, hélices plegadas", "4,717 × 4,717 × 1,800 mm"),
        ("Autonomía de vuelo sin carga", "30 min"),
        ("Velocidad máxima de ascenso", "5 m/s"),
        ("Velocidad máxima de descenso", "2 m/s"),
        ("Velocidad máxima de vuelo horizontal", "15 m/s"),
        ("Resistencia máxima al viento", "≤ Nivel 6"),
        ("Rango de temperatura de operación", "-20 °C a 50 °C"),
        ("Nivel de protección general", "IP34"),
        ("Altitud máxima de vuelo", "500 m"),
        ("Altitud máxima de vuelo sobre el nivel del mar", "4,500 m"),
        ("GNSS", "GPS + Galileo + BeiDou + GLONASS"),
    ]),
    (2, "Hélices", [
        ("Tamaño de hélice", "63 × 24 pulgadas"),
        ("Material de la pala", "Fibra de carbono"),
        ("Tipo de hélice", "Dos palas"),
        ("Número de rotores", "16 pares"),
    ]),
    (3, "Transmisión de Datos", [
        ("EIRP (Potencia isotrópica radiada equivalente)", "5 dBi"),
        ("Frecuencia de operación", "5.8 GHz"),
        ("Alcance máximo efectivo de señal", "5 km"),
        ("Calidad de video en tiempo real", "1080p, 25 fps"),
        ("Antena", "Antena dual"),
    ]),
    (4, "Sistema de Izaje", [
        ("Función de pesaje y anti-balanceo", "Sí"),
        ("Apertura/cierre automático del gancho + liberación de emergencia de cuerda", "Sí"),
        ("Longitud del cable", "10–40 m"),
        ("Apertura/cierre manual del gancho", "Operación por palanca del control remoto"),
    ]),
    (5, "Batería Inteligente", [
        ("Número de baterías", "8"),
        ("Tiempo de carga", "35 min"),
        ("Peso de batería", "17 kg (cada una)"),
        ("Capacidad", "36 Ah"),
        ("Voltaje", "24S"),
    ]),
    (6, "Cápsula Electro-Óptica", [
        ("Zoom del lente", "Zoom óptico 10x"),
        ("Capacidad de almacenamiento compatible", "256 GB"),
    ]),
    (7, "Control Remoto", [
        ("Alcance de operación", "5 km (control remoto único)"),
        ("Configuración del sistema", "Mínimo 4 GB RAM, 64 GB de almacenamiento"),
        ("Modo de relevo del control remoto", "Compatible con doble control de un solo dron"),
        ("Pantalla", "LCD táctil de 7\", alta definición y alto brillo"),
        ("Autonomía de batería", "10 horas"),
        ("Aviso de voz / hover al perder señal", "Sí"),
        ("Retorno al punto de origen por pérdida de enlace", "Sí"),
        ("Trayectoria de vuelo", "Grabación y almacenamiento de datos de vuelo a bordo"),
        ("Protección de batería baja", "Aviso de dos etapas — retorno, aterrizaje u hover"),
    ]),
    (8, "Cargador", [
        ("Voltaje de entrada", "CA 100V–240V"),
        ("Corriente de salida nominal", "5A / 10A / 15A / 20A / 25A / 30A"),
        ("Potencia nominal", "200 W"),
        ("Función de protección", "Sobrevoltaje, sobrecorriente, conexión inversa, sobretemperatura"),
        ("Temperatura ambiente de operación", "0–40 °C"),
    ]),
    (9, "Grupo Generador (opcional)", [
        ("Capacidad del tanque de combustible", "65 L"),
        ("Dimensiones", "2,000 × 830 × 1,200 mm"),
        ("Tipo de combustible", "Diésel"),
        ("Capacidad de aceite de motor", "25 L"),
        ("Método de arranque", "Eléctrico"),
        ("Peso", "800 kg"),
        ("Consumo estimado de combustible", "8 L/h"),
    ]),
    (10, "Estación Base de Posicionamiento RTK (opcional)", [
        ("Alcance de operación", "5 km"),
        ("Autonomía de batería", "6 horas"),
        ("Peso", "1.3 kg"),
        ("Control de múltiples drones desde una estación", "Sí"),
        ("Precisión de posicionamiento",
         "Aterrizaje en modo estación móvil: 0.2 m · con RTK de red: 2 cm + 1 ppm"),
    ]),
    (11, "Función de Izaje Conjunto (opcional)", [
        ("Izaje conjunto con dos drones", "Sí"),
        ("Capacidad de carga estándar en izaje conjunto", "400 kg"),
        ("Formaciones compatibles", "Línea horizontal y vertical"),
        ("Modos de izaje conjunto compatibles", "Manual y por ruta autónoma"),
        ("Puntos de montaje compatibles", "1 a 2 puntos"),
    ]),
    (12, "Sistema de Detección de Obstáculos (opcional)", [
        ("Tipo de sistema de seguridad", "Radar de detección de obstáculos"),
        ("Dirección", "Adelante + atrás"),
        ("Temperatura ambiente de operación", "-40 °C a 75 °C"),
        ("Nivel de resistencia al agua", "IP67"),
        ("Rango de detección", "1.5 a 27 m"),
    ]),
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


SECTIONS_HTML = "\n".join(section_html(idx, title, rows) for idx, title, rows in SECTIONS)
HERO_STATS_HTML = "\n      ".join(
    f'<div class="cover-stat"><span class="cover-stat-value">{value}</span>'
    f'<span class="cover-stat-label">{label}</span></div>'
    for label, value in HERO_STATS
)

LOGO_RAW = Path(LOGO_SVG).read_text(encoding="utf-8")
LOGO_RAW = LOGO_RAW[LOGO_RAW.index("<svg"):]
LOGO_DARK = LOGO_RAW.replace("<svg ", '<svg class="pdoc-logo" ', 1)
LOGO_LIGHT = LOGO_RAW.replace("<svg ", '<svg class="cover-logo" ', 1)

FONT_B64 = base64.b64encode(FONT_WOFF2.read_bytes()).decode("ascii")
HERO_B64 = base64.b64encode(HERO_JPG.read_bytes()).decode("ascii")

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
  .pdoc-page.cover-page { padding: 0; }
  .pdoc-page.cover-page .pdoc { box-shadow: none; }

  .pdoc {
    --pd-ink: #0f1216; --pd-muted: #6b7280; --pd-line: #d1d5db;
    --pd-bar: #f4f5f4; --pd-tint: #f7f8f9; --pd-accent: #24417a; --pd-pad-x: 52px;
    box-sizing: border-box; width: 100%; max-width: 820px; margin: 0 auto;
    padding: 24px var(--pd-pad-x) 26px; background: #ffffff; color: var(--pd-ink);
    font-family: var(--font-ui, system-ui, sans-serif); font-size: 12px; line-height: 1.35;
  }
  .pdoc *, .pdoc *::before, .pdoc *::after { box-sizing: border-box; }

  /* ── Cover page ── */
  .pdoc-cover {
    position: relative; width: 100%; max-width: 820px; margin: 0 auto;
    aspect-ratio: 820 / 1160; overflow: hidden; background: #0f1216;
    font-family: var(--font-ui, system-ui, sans-serif);
  }
  .pdoc-cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cover-scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(10,14,20,0.55) 0%, rgba(10,14,20,0.0) 30%, rgba(10,14,20,0.0) 52%, rgba(10,14,20,0.78) 78%, rgba(6,9,13,0.94) 100%);
  }
  .cover-top { position: absolute; top: 30px; left: 40px; right: 40px; display: flex; align-items: flex-start; justify-content: space-between; }
  .cover-logo { height: 40px; width: auto; filter: brightness(0) invert(1); }
  .cover-doc-number { color: rgba(255,255,255,0.85); font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.03em; background: rgba(255,255,255,0.12); padding: 5px 10px; border-radius: 3px; }
  .cover-bottom { position: absolute; left: 40px; right: 40px; bottom: 34px; color: #fff; }
  .cover-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9fb3d6; margin-bottom: 8px; }
  .cover-title { font-size: 56px; font-weight: 800; letter-spacing: -0.02em; line-height: 0.95; margin: 0; }
  .cover-tagline { font-size: 16px; font-weight: 500; margin-top: 8px; color: rgba(255,255,255,0.9); }
  .cover-scenario { font-size: 12px; margin-top: 4px; color: rgba(255,255,255,0.65); }
  .cover-stats { display: flex; gap: 28px; margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.25); }
  .cover-stat { display: flex; flex-direction: column; }
  .cover-stat-value { font-family: var(--font-mono, monospace); font-weight: 700; font-size: 20px; }
  .cover-stat-label { font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-top: 2px; }
  .cover-manufacturer { position: absolute; right: 40px; bottom: 34px; text-align: right; color: rgba(255,255,255,0.55); font-size: 10.5px; letter-spacing: 0.04em; text-transform: uppercase; }
  .cover-manufacturer strong { display: block; color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 0.02em; text-transform: none; margin-bottom: 2px; }

  .pdoc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
  .pdoc-title { margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; line-height: 0.92; }
  .pdoc-number { margin-top: 10px; font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.02em; color: var(--pd-ink); }
  .pdoc-brand { display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 6px; flex-shrink: 0; }
  .pdoc-logo { height: 58px; width: auto; filter: brightness(0); }
  .pdoc-tagline { font-size: 10.5px; letter-spacing: 0.02em; color: var(--pd-muted); text-transform: uppercase; }

  .pdoc-rule { position: relative; height: 3px; margin: 10px 0 16px; background: var(--pd-line); }
  .pdoc-rule::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-accent); }

  .pdoc-hero { border: 1px solid var(--pd-line); border-top: 3px solid var(--pd-accent); padding: 14px 18px; margin-bottom: 12px; break-inside: avoid; }
  .pdoc-hero-name { font-size: 25px; font-weight: 800; letter-spacing: -0.015em; }
  .pdoc-hero-trim { margin-top: 3px; font-size: 12.5px; color: var(--pd-muted); }
  .pdoc-hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 11px; }
  .pdoc-hero-stat { border-top: 2px solid var(--pd-ink); padding-top: 7px; }
  .pd-hero-label { display: block; font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pd-muted); }
  .pd-hero-value { display: block; margin-top: 2px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 13.5px; white-space: nowrap; font-variant-numeric: tabular-nums; }

  .pdoc-section-bar {
    display: flex; align-items: baseline; gap: 10px; background: var(--pd-bar);
    border-left: 3px solid var(--pd-accent); padding: 7px 12px; margin: 22px 0 10px;
    break-after: avoid; break-inside: avoid;
  }
  .pdoc-spec-section:first-of-type .pdoc-section-bar { margin-top: 0; }
  .pd-sec-index { font-family: var(--font-mono, monospace); font-weight: 700; font-size: 15px; color: var(--pd-accent); }
  .pd-sec-title { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }

  .pdoc-spec-section { margin-bottom: 3px; }
  .pdoc-spec-grid { display: flex; flex-direction: column; padding: 0 4px; font-size: 11.5px; }
  .spec-row { display: grid; grid-template-columns: 320px 1fr; align-items: start; gap: 6px 16px; border-bottom: 1px solid var(--pd-tint); padding-bottom: 6px; margin-bottom: 6px; break-inside: avoid; }
  .spec-label { font-weight: 600; color: var(--pd-ink); }
  .spec-value { color: var(--pd-ink); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }

  .spec-check {
    display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;
    border-radius: 3px; background: var(--pd-accent); color: #fff; font-size: 10px; font-weight: 700;
    flex-shrink: 0; line-height: 1;
  }
  .spec-affirm { font-weight: 600; }
  .spec-detail { color: var(--pd-muted); }

  .pdoc-tail { margin-top: 40px; padding-top: 14px; break-inside: avoid; }
  .pdoc-note { font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 10px; }
  .pdoc-close-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
  .pdoc-close-signoff { margin-top: 2px; font-weight: 600; }

  .pdoc-footer { display: flex; justify-content: space-between; gap: 24px; margin-top: 10px; padding-top: 6px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }
  .pdoc-footer .pd-foot-right { text-align: right; }

  .pdoc-whatsapp { margin-top: 8px; text-align: center; break-inside: avoid; }
  .pdoc-whatsapp a { display: inline-block; padding: 7px 16px; background: var(--pd-accent); color: #fff; font-size: 11px; font-weight: 700; text-decoration: none; border-radius: 3px; letter-spacing: 0.01em; }

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
    @page cover { margin: 0; }
    body { background: #ffffff; }
    .pdoc-page { min-height: 0; padding: 0; }
    .pdoc-page .pdoc { box-shadow: none; }
    .pdoc { --pd-pad-x: 0px; max-width: none; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdoc-close-row, .pdoc-footer { break-inside: avoid; }
    .cover-page { page: cover; break-after: page; }
    .pdoc-cover { max-width: none; width: 100%; height: 100vh; aspect-ratio: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
"""

HTMLDOC = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ficha Técnica · Wings Global Trade · {MODEL_NAME}</title>
<style>{CSS}</style>
</head>
<body>

<div class="pdoc-page cover-page">
  <div class="pdoc-cover">
    <img src="data:image/jpeg;base64,{HERO_B64}" alt="{MODEL_NAME} transportando carga" />
    <div class="cover-scrim"></div>
    <div class="cover-top">
      {LOGO_LIGHT}
      <span class="cover-doc-number">FICHA TÉCNICA · {DOC_NUMBER}</span>
    </div>
    <div class="cover-bottom">
      <div class="cover-eyebrow">Dron Multirotor Eléctrico</div>
      <h1 class="cover-title">{MODEL_NAME}</h1>
      <div class="cover-tagline">{MODEL_TAGLINE}</div>
      <div class="cover-scenario">{MODEL_SCENARIO}</div>
      <div class="cover-stats">
        {HERO_STATS_HTML}
      </div>
    </div>
    <div class="cover-manufacturer">
      <strong>{MANUFACTURER}</strong>
      Preparado: {DOC_DATE}
    </div>
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
      {LOGO_DARK}
      <span class="pdoc-tagline">SOLUCIONES INTEGRALES EN IMPORTACIÓN</span>
    </div>
  </header>
  <div class="pdoc-rule" aria-hidden="true"></div>

  <div class="pdoc-hero">
    <div class="pdoc-hero-name">{MODEL_NAME}</div>
    <div class="pdoc-hero-trim">{MODEL_TAGLINE} · {MANUFACTURER}</div>
    <div class="pdoc-hero-stats">
      <div class="pdoc-hero-stat"><span class="pd-hero-label">Carga máxima</span><span class="pd-hero-value">350 kg</span></div>
      <div class="pdoc-hero-stat"><span class="pd-hero-label">Velocidad máxima</span><span class="pd-hero-value">15 m/s</span></div>
      <div class="pdoc-hero-stat"><span class="pd-hero-label">Autonomía sin carga</span><span class="pd-hero-value">30 min</span></div>
      <div class="pdoc-hero-stat"><span class="pd-hero-label">Rotores</span><span class="pd-hero-value">16 pares</span></div>
    </div>
  </div>

  {SECTIONS_HTML}

  <div class="pdoc-tail">
  <p class="pdoc-note">Las especificaciones anteriores se presentan como referencia técnica y pueden variar según lote de producción; se recomienda confirmar contra la unidad física antes de la compra. Las funciones marcadas como "opcional" no forman parte del equipo estándar.</p>
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
  <div class="pdoc-whatsapp">
    <a href="https://wa.me/message/5GKD6PBYCCD6K1">Escríbenos por WhatsApp — wa.me/message/5GKD6PBYCCD6K1</a>
  </div>
  </div>

</article>
</div>
</body>
</html>
"""

out = HERE / "ficha.html"
out.write_text(HTMLDOC, encoding="utf-8")
n_rows = sum(len(rows) for _, _, rows in SECTIONS)
print(f"wrote {out} ({len(HTMLDOC):,} bytes) — sections={len(SECTIONS)} rows={n_rows}")
