#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for the "Toyota Land Cruiser Prado Híbrida" — named per client request.

Source: Toyota USA's own comparison page for the 2027 Land Cruiser lineup
(https://www.toyota.com/landcruiser/features/mpg_other_price/6165/6167),
comparing the "Land Cruiser 1958" and "Land Cruiser" trims. This ficha uses
ONLY the "Land Cruiser" trim's data (the one circled in the client's
screenshot, not "Land Cruiser 1958") — identified by cross-checking every
trim-specific spec (curb weight/payload/MSRP/height/track width/approach-
departure angles all appear twice in the page's embedded JSON, in the same
[1958, Land Cruiser] order every time). NO PRICE/MSRP IS INCLUDED, per
explicit instruction.

Reuses the Prado Flagship ficha's photography (assets/opt/, copied
verbatim from ficha-tecnica-prado-flagship/) per instruction — the
combustion engine and hybrid-system totals sourced here (326 hp / 243 kW
combined, 465 lb-ft / 630 N·m combined, 2.4L turbo 4-cyl, 8AT, wheelbase
2,850 mm, GVWR 3,050 kg, fuel tank ~68 L) match that internal ficha's
figures closely, confirming it's the same underlying vehicle/platform.

Unit conversions (in/lb/gal/mi → mm/kg/L/km) computed directly from the
sourced imperial values; shown alongside a note that these are conversions
of the manufacturer's own published (US-market) figures — the metric
figures aren't Toyota's own numbers, and rounding differences vs. Toyota's
metric-market literature are expected. EPA fuel economy (mpg) converted to
L/100km — a different test cycle than the WLTC figure used elsewhere in
Wings' fichas, so it isn't directly comparable to WLTC output.

Run: python3 build_ficha.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMG_DIR = HERE / "assets" / "opt"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_NUMBER = "FT-WGT-2026-0923"
DOC_DATE = "23-09-2026"

MODEL_NAME = "Toyota Land Cruiser Prado Híbrida"
MODEL_TRIM = "2.4L Turbo Híbrido i-FORCE MAX · Grado \"Land Cruiser\""

HERO_STATS = [
    ("Potencia combinada", "243 kW (326 hp)"),
    ("Tracción", "4WD tiempo completo"),
    ("Transmisión", "8AT"),
    ("Plazas", "5"),
]


def img_uri(name: str) -> str:
    data = (IMG_DIR / f"{name}.jpg").read_bytes()
    return f"data:image/jpeg;base64,{base64.b64encode(data).decode('ascii')}"


BLOCKS = [
    {"type": "section", "idx": 1, "title": "Identificación", "rows": [
        ("Modelo", MODEL_NAME),
        ("Versión", MODEL_TRIM),
        ("Carrocería", "SUV, 5 puertas, 5 plazas"),
        ("Tipo de energía", "Híbrido gasolina-eléctrico (HEV)"),
        ("Fabricante", "Toyota"),
        ("Año modelo", "2027"),
    ]},
    {"type": "banner", "img": "image3", "caption": "Perfil lateral — proporciones y distancia entre ejes"},
    {"type": "section", "idx": 2, "title": "Dimensiones y Pesos", "rows": [
        ("Longitud (mm)", "4,989"),
        ("Ancho de carrocería (mm)", "1,979"),
        ("Ancho con espejos (mm)", "2,113"),
        ("Alto (mm)", "1,933"),
        ("Distancia entre ejes (mm)", "2,850"),
        ("Trocha delantera / trasera (mm)", "1,664 / 1,666"),
        ("Ángulo de ataque / salida (°)", "31 / 22"),
        ("Altura libre al suelo, estática (mm)", "201"),
        ("Altura libre al suelo, en marcha (mm)", "211"),
        ("Radio de giro (m)", "6.1"),
        ("Peso en orden de marcha, mínimo (kg)", "2,470"),
        ("Peso bruto vehicular — GVWR (kg)", "3,050"),
        ("Carga útil máxima (kg)", "581"),
        ("Capacidad máxima de remolque (kg)", "2,722"),
        ("Capacidad del tanque de combustible (L)", "67.8"),
    ]},
    {"type": "banner", "img": "image6", "caption": "Motor 2.4L Turbo Híbrido i-FORCE MAX — cableado de alto voltaje"},
    {"type": "section", "idx": 3, "title": "Motor y Transmisión", "rows": [
        ("Tipo", "i-FORCE MAX, Turbo Híbrido"),
        ("Cilindrada (cm³)", "2,393 (2.4 L)"),
        ("Número de cilindros", "4 en línea"),
        ("Potencia total del sistema (hp / rpm)", "326 / 6,000"),
        ("Torque total del sistema (N·m / rpm)", "630 / 1,700"),
        ("Combustible recomendado", "Gasolina"),
        ("Transmisión (Tipo)", "8AT — Automática electrónica con inteligencia (ECT-i)"),
        ("Transmisión (Secuencial)", "De 8 velocidades, modo manual secuencial"),
        ("Relaciones de caja (1ª–8ª)", "4.41 / 2.80 / 1.95 / 1.51 / 1.27 / 1.00 / 0.79 / 0.65"),
        ("Relación de reversa", "3.64"),
    ]},
    {"type": "section", "idx": 4, "title": "Sistema Híbrido", "rows": [
        ("Batería de alto voltaje", "288V, Níquel-Metal Hidruro (NiMH) sellada"),
        ("Capacidad de batería (kWh)", "1.87"),
        ("Consumo EPA ciudad / carretera / combinado (mpg)", "22 / 25 / 23"),
        ("Consumo EPA equivalente (L/100 km, ciudad/carretera/combinado)", "10.7 / 9.4 / 10.2"),
    ]},
    {"type": "section", "idx": 5, "title": "Garantías (mercado EE.UU., referencial)", "rows": [
        ("Garantía básica", "36 meses / 57,900 km"),
        ("Garantía de tren motriz (powertrain)", "60 meses / 96,600 km"),
        ("Garantía anticorrosión (perforación)", "60 meses / sin límite de kilometraje"),
        ("Garantía de sistema de retención", "60 meses / 96,600 km"),
        ("Garantía de batería híbrida", "120 meses / 241,400 km"),
        ("Garantía de sistema híbrido", "96 meses / 160,900 km"),
    ]},
    {"type": "banner", "img": "image9", "caption": "Selector de modos de manejo y tracción 4WD"},
    {"type": "section", "idx": 6, "title": "Chasis y Tracción", "rows": [
        ("Tracción", "4WD tiempo completo (Full-Time 4WD)"),
        ("Diferencial central", "Torsen, con bloqueo, autoblocante (limited-slip)"),
        ("Control de tracción activo", "A-TRAC"),
        ("Diferenciales trasero y central bloqueables", "Electrónicos"),
        ("Reductora", "Sí, doble rango (alta / baja)"),
        ("Suspensión (Delantera)", "Independiente, doble horquilla, resortes helicoidales"),
        ("Suspensión (Posterior)", "Eje de 4 brazos, resortes helicoidales, eje semiflotante"),
        ("Mecanismo de desconexión de barra estabilizadora (SDM)", "Sí"),
        ("Dirección", "Asistencia eléctrica, cremallera y piñón, relación variable"),
        ("Modos de manejo (Drive Mode Select)", "Sport, Eco, Normal, Nieve"),
        ("Selector de terreno (Multi-Terrain Select)", "Auto, Tierra, Arena, Barro, Roca, Nieve profunda"),
        ("Control de descenso en pendiente (Crawl Control)", "Sí"),
        ("Monitor multi-terreno", "Vistas frontal, lateral y posterior seleccionables"),
        ("Toma de aire elevada (High-mount air intake)", "Sí"),
        ("Ganchos de remolque delanteros y traseros", "Fijos al chasis"),
        ("Placa de protección delantera", "Motor, transmisión y caja de transferencia"),
    ]},
    {"type": "section", "idx": 7, "title": "Carrocería, Frenos y Neumáticos", "side_img": "crop_wheel",
     "rows": [
        ("Frenos (Delanteros)", "Discos ventilados, 332.7 x 30.5 mm"),
        ("Frenos (Posteriores)", "Discos ventilados, 332.7 x 19.8 mm"),
        ("Freno de estacionamiento", "Electrónico (EPB)"),
        ("Neumáticos (Medida)", "265/60 R20"),
        ("Aros", "Aleación, 20\", color gris"),
        ("Neumático de repuesto", "Medida completa, sobre aro de aleación, bajo la carrocería"),
    ]},
    {"type": "section", "idx": 8, "title": "Seguridad y Asistencia a la Conducción", "rows": [
        ("Sistema de seguridad activa", "Toyota Safety Sense™ 3.0"),
        ("Airbags", "9 — frontales duales, rodillas (piloto y copiloto), cojín de asiento del copiloto, laterales, cortina lateral delantera y trasera"),
        ("Sistema Star Safety™", "VSC mejorado, TRAC, ABS, EBD, BA, Smart Stop Technology®"),
        ("Monitor de punto ciego (BSM)", "Sí"),
        ("Alerta de tráfico cruzado trasero (FCTA)", "Sí"),
        ("Crucero adaptativo de rango completo (DRCC)", "Sí"),
        ("Asistencia en atasco de tráfico (TJA)", "Disponible en paquete opcional"),
        ("Asistente de cambio de carril (LCA)", "Disponible en paquete opcional"),
        ("Alerta de salida segura (SEA)", "Sí"),
        ("Cámara de retroceso con trayectoria proyectada", "Sí"),
        ("Asistencia de estacionamiento delantera/trasera con frenado (PA w/AB)", "Sí"),
        ("Monitor de presión de neumáticos (TPMS)", "Sí, con lectura directa por posición"),
        ("Anclajes LATCH para asientos infantiles", "Sí, en plazas exteriores de 2ª fila"),
        ("Inmovilizador de motor / antirrobo", "Sí"),
    ]},
    {"type": "banner", "img": "image8", "caption": "Cabina — pantalla táctil de 12.3\" e instrumental digital"},
    {"type": "section", "idx": 9, "title": "Equipamiento Interior", "rows": [
        ("Aire acondicionado", "Climatizador automático trizona, control independiente por fila"),
        ("Asientos (Material)", "Tapizado SofTex®; cuero disponible en paquete opcional"),
        ("Asiento piloto", "8 vías eléctrico con soporte lumbar"),
        ("Asiento copiloto", "6 vías manual (eléctrico en paquete opcional)"),
        ("Asientos calefaccionados / ventilados", "Delanteros calefaccionados y ventilados de serie"),
        ("Asientos traseros calefaccionados/ventilados", "Disponibles en paquete opcional"),
        ("Volante", "Ajuste manual inclinación/telescópico, insignia TOYOTA"),
        ("Instrumental", "Pantalla digital de 12.3\" con múltiples modos de visualización"),
        ("Pantalla central multimedia", "Táctil, 12.3\", Toyota Audio Multimedia"),
        ("Sistema de audio", "10 parlantes de serie; JBL® Premium de 14 parlantes disponible en paquete"),
        ("Conectividad de teléfono", "Android Auto™ y Apple CarPlay® inalámbricos"),
        ("Cargador inalámbrico", "Compatible Qi"),
        ("Entradas USB", "6 puertos USB"),
        ("Tomacorrientes", "1 de 12V + inversor de CA de 2400W"),
        ("Caja fría de consola (Console Cool Box)", "Disponible en paquete opcional"),
        ("Portón / compuerta trasera", "Eléctrico ajustable con protección antiatrapamiento"),
        ("Llave", "Smart Key con botón de encendido; llave digital disponible en paquete opcional"),
        ("Head-Up Display (HUD)", "Disponible en paquete opcional"),
        ("Techo solar", "Corredizo/inclinable con parasol; disponible en paquete opcional"),
    ], "gallery": [
        ("image10", "Asiento delantero"),
        ("image11", "Asientos traseros"),
        ("image13", "Techo solar"),
        ("image12", "Consola trasera"),
    ]},
    {"type": "banner", "img": "image4", "caption": "Iluminación LED y equipamiento exterior"},
    {"type": "section", "idx": 10, "title": "Equipamiento Exterior e Iluminación", "rows": [
        ("Faros delanteros (Tipo)", "LED rectangulares"),
        ("Luces diurnas (DRL)", "LED integradas"),
        ("Faros antiniebla", "LED, color seleccionable (Rigid Industries®)"),
        ("Espejos retrovisores exteriores", "Con función de aviso de punto ciego integrada"),
        ("Espejo retrovisor interior", "Antidestello automático con brújula y HomeLink®"),
        ("Limpiaparabrisas", "Delantero sensor de lluvia intermitente variable; trasero intermitente"),
        ("Deshielador de parabrisas (limpiaparabrisas)", "Sí"),
        ("Estribos", "Disponibles en paquete opcional (iluminados)"),
        ("Riel de techo", "Sí"),
        ("Guardabarros", "De serie"),
        ("Cristales con privacidad", "Laterales traseros, cuarto y luneta"),
    ], "gallery": [
        ("image5", "Techo solar y rieles"),
        ("image17", "Portón eléctrico"),
        ("image16", "Maletero — acceso"),
        ("image15", "Maletero — capacidad"),
    ]},
    {"type": "section", "idx": 11, "title": "Interior — Espacio y Capacidad", "side_img": "crop_screen",
     "rows": [
        ("Capacidad de asientos", "5"),
        ("Espacio para la cabeza, 1ª/2ª fila (cm)", "101.9 / 99.8"),
        ("Espacio para las piernas, 1ª/2ª fila (cm)", "109.2 / 93.2"),
        ("Espacio de cadera, 1ª/2ª fila (cm)", "140.7 / 144.8"),
        ("Volumen de carga tras 1ª fila (L)", "2,325"),
        ("Volumen de carga tras 2ª fila (L)", "1,308"),
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
<title>Ficha Técnica · Wings Global Trade · Toyota Land Cruiser Prado Híbrida</title>
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
  .pdoc-hero-name2 {{ font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }}
  .pdoc-hero-trim2 {{ margin-top: 2px; font-size: 11.5px; color: rgba(255,255,255,.78); }}
  .pdoc-hero-stats2 {{ display: flex; margin-top: 11px; background: rgba(8,10,12,.5); border-radius: 12px; padding: 8px 6px; }}
  .pdoc-hero-stat2 {{ flex: 1; text-align: center; border-left: 1px solid rgba(255,255,255,.18); padding: 0 4px; }}
  .pdoc-hero-stat2:first-child {{ border-left: none; }}
  .pd-hero-label2 {{ display: block; font-size: 8.5px; letter-spacing: .05em; text-transform: uppercase; color: rgba(255,255,255,.68); }}
  .pd-hero-value2 {{ display: block; margin-top: 2px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 13px; color: #fff; font-variant-numeric: tabular-nums; }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 12px; font-size: 11.5px; color: var(--pd-muted); }}
  .pdoc-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 16px; color: var(--pd-line); }}

  .pdoc-section-bar {{ background: var(--pd-bar); padding: 6px 12px; margin: 0 0 6px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; break-after: avoid; break-inside: avoid; }}
  .pd-sec-index {{ font-family: var(--font-mono, monospace); color: var(--pd-accent); margin-right: 9px; font-weight: 700; }}
  .pdoc-spec-section {{ margin-bottom: 10px; }}
  .pdoc-spec-grid {{ display: flex; flex-direction: column; padding: 0 4px; font-size: 11.5px; }}
  .spec-row {{ display: grid; grid-template-columns: 260px 1fr; gap: 4.5px 16px; border-bottom: 1px solid var(--pd-tint); padding-bottom: 4.5px; margin-bottom: 4.5px; break-inside: avoid; }}
  .spec-label {{ font-weight: 600; color: var(--pd-ink); }}
  .spec-value {{ color: var(--pd-ink); display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }}

  .spec-check {{
    display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;
    border-radius: 3px; background: var(--pd-accent); color: #fff; font-size: 10px; font-weight: 700;
    flex-shrink: 0; line-height: 1;
  }}
  .spec-affirm {{ font-weight: 600; }}
  .spec-detail {{ color: var(--pd-muted); }}

  .pdoc-banner {{ position: relative; margin: 4px calc(var(--pd-pad-x) * -1) 14px; width: calc(100% + var(--pd-pad-x) * 2); break-inside: avoid; }}
  .pdoc-banner img {{ width: 100%; height: 168px; object-fit: cover; display: block; }}
  .pdoc-banner figcaption {{
    position: absolute; left: 16px; bottom: 10px; color: #fff; font-size: 10.5px; font-weight: 600;
    background: rgba(8,10,12,.55); padding: 4px 11px; border-radius: 999px; letter-spacing: 0.01em;
  }}

  .pdoc-section-split {{ display: flex; gap: 14px; align-items: flex-start; }}
  .pdoc-side-img {{ width: 168px; flex-shrink: 0; border-radius: 12px; overflow: hidden; break-inside: avoid; }}
  .pdoc-side-img img {{ width: 100%; height: 200px; object-fit: cover; display: block; }}
  .pdoc-spec-grid--narrow {{ flex: 1; min-width: 0; }}
  .pdoc-spec-grid--narrow .spec-row {{ grid-template-columns: 188px 1fr; }}

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
    <span>Origen: Japón</span>
    <span>Segmento: SUV grande</span>
  </div>

  {BLOCKS_HTML}

  <div class="pdoc-tail">
  <p class="pdoc-note">Especificaciones tomadas del sitio oficial de Toyota EE.UU. para el grado "Land Cruiser" 2027 (i-FORCE MAX 2.4L Turbo Híbrido); las cifras métricas son conversiones de las cifras imperiales publicadas por el fabricante y pueden diferir levemente de la literatura métrica oficial. El equipamiento marcado "disponible en paquete opcional" no viene de serie. Se recomienda confirmar equipamiento y especificaciones contra la unidad física antes de la compra. No se incluye información de precio.</p>
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
