#!/usr/bin/env python3
"""Build the Wings Global Trade branded technical spec sheet (Ficha Técnica)
for a 20-seat diesel passenger van — "Van de 20 Pasajeros - Asiastar".

Source specs: client-supplied "QUOTATION OF EURISE" spec sheet (PDF,
bilingual Chinese/English) for model YBL6751D — kept in the identity
section as the underlying model code. FOB price, currency/payment/
delivery/warranty terms and price-validity conditions were all left BLANK
in the source document, so none of that is shown here.

Photos: 5 client-supplied reference photos of a similar chassis-cab
passenger van, showing "ASIASTAR" branding — used as reference photography
of a comparable van, not exact renders of the quoted EURISE YBL6751D.

QA pass (2026-09-24), against the source PDF's own bilingual text:
- Fixed: near-invisible zebra-row divider (border color matched the tint
  background), collapsed row spacing at a page break, a leaked internal QA
  aside inside the Aire acondicionado value, a duplicate spare-tire mention,
  and an image/table height mismatch in sections 04-05 (side images pulled
  out into full-width lead-in banners instead of a stretched side column).
- Verified, not changed: "Fuhao A" (§05, source page 1: 富豪A) and "Jiulong
  Fuhua" (§09, source page 3: 九龙富华) are two different Chinese terms for
  two different seat suppliers — not a typo.
- Added: running per-page header/footer with page numbers and a table of
  contents, both filled in by render_pdf.py after Chromium renders the base
  PDF (Chromium's --print-to-pdf has no header/footer templating and its
  print engine doesn't reliably support CSS counter(pages), so this is done
  by drawing directly on the rendered PDF instead of relying on print CSS).

Run: python3 build_ficha.py && python3 render_pdf.py
"""
import base64
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMG_DIR = HERE / "assets" / "opt"
LOGO_SVG = "/home/user/wings-global-trade/apps/tower/public/brand/wings-imagotipo.svg"

DOC_NUMBER = "FT-WGT-2026-0924"
DOC_DATE = "24-09-2026"

MODEL_NAME = "Van de 20 Pasajeros - Asiastar"
MODEL_TRIM = "EURISE YBL6751D · 2.8T Diésel · 6MT"

HERO_STATS = [
    ("Motor", "2.8T"),
    ("Potencia", "120 kW"),
    ("Torque máximo", "420 N·m"),
    ("Transmisión", "6MT"),
    ("Asientos", "20"),
]


def img_uri(name: str) -> str:
    data = (IMG_DIR / f"{name}.jpg").read_bytes()
    return f"data:image/jpeg;base64,{base64.b64encode(data).decode('ascii')}"


BLOCKS = [
    {"type": "section", "idx": 1, "title": "Identificación", "break_before": True, "rows": [
        ("Modelo comercial", MODEL_NAME),
        ("Modelo / código de fábrica", "EURISE YBL6751D"),
        ("Marca de fábrica", "EURISE (欧睿)"),
        ("Tipo de carrocería", "Van / minibús de pasajeros"),
        ("Tipo de energía", "Diésel"),
        ("Capacidad de asientos", "20 (incluye asiento del conductor)"),
    ]},
    {"type": "section", "idx": 2, "title": "Dimensiones y Capacidad", "rows": [
        ("Dimensiones — largo x ancho x alto (mm)", "7,490 x 2,000 x 2,875"),
        ("Distancia entre ejes (mm)", "4,325"),
        ("Peso bruto vehicular (kg)", "5,450"),
        ("Velocidad máxima (km/h)", "120"),
        ("Consumo de combustible (L/100 km)", "10.5"),
    ]},
    {"type": "section", "idx": 3, "title": "Motor y Transmisión", "rows": [
        ("Tipo", "RA428 2.8T (tecnología VM)"),
        ("Potencia nominal (kW)", "120"),
        ("Torque máximo (N·m)", "420"),
        ("Norma de emisión", "Euro V"),
        ("Caja de cambios", "6MT (manual, 6 velocidades)"),
        ("Tipo de combustible", "Diésel"),
    ]},
    {"type": "section", "idx": 4, "title": "Chasis, Frenos y Neumáticos", "rows": [
        ("Capacidad del tanque de combustible (L)", "80"),
        # Spare-tire mention kept here only (was also repeated under "Llantas"
        # in §05 — the source PDF states it twice too, once per part, but the
        # client-facing ficha keeps it in one place only).
        ("Neumáticos", "195/75R16LT (Zhongce, incluye llanta de repuesto)"),
        ("Sistema de frenos", "Discos delanteros y traseros"),
        ("Suspensión delantera", "McPherson, independiente"),
        ("Suspensión trasera", "Ballesta de sección variable (paquete reducido de hojas)"),
    ]},
    {"type": "section", "idx": 5, "title": "Equipamiento de Serie — Exterior e Interior", "rows": [
        ("Pintura", "Color sólido estándar (blanco)"),
        ("Ventanas laterales", "Fijas, tipo cerrado (vidrio verde)"),
        ("Vidrios eléctricos", "Solo ventana delantera del lado del conductor"),
        ("Faros delanteros", "Cristal con halógeno integrado"),
        ("Luces diurnas (DRL)", "LED"),
        ("Faros antiniebla delanteros", "Sí"),
        ("Puerta trasera", "Portón trasero"),
        ("Llantas", "Acero"),
        ("Asiento del conductor", "Ajustable en 6 direcciones"),
        ("Interior", "Color beige"),
        ("Paneles laterales", "Revestidos en cuerina beige"),
        ("Piso", "Vinilo con textura de madera clara"),
        ("Asiento del conductor (marca)", "Estándar, Jiangdu Jiulong"),
        # "Fuhao A" verified against source PDF p.1 (富豪A) — a different
        # Chinese term/brand from "Jiulong Fuhua" in §09 (source p.3, 九龙富
        # 华). Not a typo; do not merge or "correct" one into the other.
        ("Asientos de pasajeros", "Cuerina (símil cuero), cinturón de 2 puntos, marca Fuhao A"),
        ("Diagnóstico", "CAN-BUS"),
    ]},
    {"type": "section", "idx": 6, "title": "Equipamiento de Serie — Seguridad", "rows": [
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
    {"type": "section", "idx": 7, "title": "Equipamiento de Serie — Confort y Conveniencia", "rows": [
        ("Audio", "Radio + reproductor MP3"),
        ("Desempañador de luna trasera", "Eléctrico"),
        ("Espejos retrovisores exteriores", "Eléctricos, calefaccionados, con luz direccional integrada"),
        ("Volante", "Multifunción"),
        ("Parlantes", "Rango completo"),
        # INTERNAL QA NOTE (not for the client-facing PDF): source PDF p.2
        # states 12 kW in the Chinese column but 10 kW in the English column
        # for this field ("12KW前后舱空调" vs "10KW front & rear air
        # conditioning") — confirm the real spec with the supplier before
        # this ficha goes out. Chinese column kept here as the primary text;
        # flag to Muaaz if the supplier confirms 10 kW instead.
        ("Aire acondicionado", "12 kW, delantero y trasero"),
        ("Calefacción zona de pasajeros", "Radiadores, 2 m lado izquierdo"),
        ("Llaves", "2 unidades, control remoto plegable"),
        ("Faros de cortesía", "Función \"sígueme a casa\""),
        ("Desbloqueo automático", "Sí"),
        ("Bloqueo automático por velocidad", "Sí, a partir de 15 km/h"),
        ("Cierre centralizado", "Sí"),
    ]},
    {"type": "section", "idx": 8, "title": "Configuración Opcional — Motor y Chasis", "cols2": True,
     "note": "Las secciones 08 a 11 son configuración opcional adicional a la unidad base — no vienen de serie y están sujetas a cotización aparte.",
     "rows": [
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
    {"type": "section", "idx": 9, "title": "Configuración Opcional — Exterior e Interior", "cols2": True, "rows": [
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
        # "Jiulong Fuhua" — see the verification note by "Fuhao A" in §05;
        # confirmed as a distinct supplier name, not a duplicate/typo of it.
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
    {"type": "section", "idx": 10, "title": "Configuración Opcional — Seguridad", "rows": [
        ("Extintor automático en el compartimento del motor", "Opcional"),
        ("Retardador (freno auxiliar)", "Opcional"),
    ]},
    {"type": "section", "idx": 11, "title": "Configuración Opcional — Confort y Conveniencia", "rows": [
        ("Estribo eléctrico de bienvenida", "Opcional, excepto con puerta oscilante eléctrica"),
    ]},
]

# Closing gallery — kept separate from BLOCKS (rather than a "gallery" block
# type) so it can be wrapped together with the closing signature/footer in
# one fixed-height flex container on the last page (see .pdoc-last-page):
# that's what pins the footer to the physical bottom of the page instead of
# floating right under the gallery with dead space beneath it.
GALLERY_IMAGES = [
    ("chassis-3q", "Vista general — chasis cabinado"),
    ("engine-bay", "Compartimento del motor"),
    ("chassis-frame", "Vista del chasis"),
    ("grille-detail", "Detalle de parrilla"),
    ("cabin-dash", "Interior — cabina del conductor"),
    ("passenger-seats", "Interior — área de pasajeros"),
]


OPTIONAL_RE = re.compile(r"^Opcional\b", re.IGNORECASE)


def value_html(value: str) -> str:
    """Boolean specs get a check badge instead of plain 'Sí' text. Rows whose
    value starts with 'Opcional' show only the remaining detail (if any) with
    no badge or "Disponible"/"Opcional" label at all — every row in an
    optional-configuration section is available by definition (that's what
    the section note above says once), so tagging each row individually was
    redundant and, per feedback, must not come back."""
    if value.startswith("Sí"):
        rest = value[2:].lstrip(",").strip()
        detail = f' <span class="spec-detail">{rest}</span>' if rest else ""
        return f'<span class="spec-check" aria-hidden="true">✓</span><span class="spec-affirm">Sí</span>{detail}'
    m = OPTIONAL_RE.match(value)
    if m:
        rest = value[m.end():].strip(" ,").strip()
        if rest:
            # Capitalize the first letter of the first word, skipping a
            # leading "(" like in "(excepto versión de techo estándar)" —
            # but never hunting past a leading number ("8 vidrios grandes"
            # stays as-is; there's no letter to capitalize at position 0).
            prefix = "(" if rest.startswith("(") else ""
            body = rest[1:] if prefix else rest
            if body and body[0].isalpha():
                body = body[0].upper() + body[1:]
            rest = prefix + body
        return f'<span class="spec-detail">{rest}</span>' if rest else ""
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

    bar = f'<div class="pdoc-section-bar"><span class="pd-sec-index">{b["idx"]:02d}</span>{b["title"]}</div>'
    grid = rows_html(b["rows"])

    if b.get("side_img"):
        body = f"""
    <div class="pdoc-section-split">
      <div class="pdoc-side-img"><img src="{img_uri(b['side_img'])}" alt="" /></div>
      <div class="pdoc-spec-grid pdoc-spec-grid--narrow">{grid}</div>
    </div>"""
    elif b.get("cols2"):
        body = f'<div class="pdoc-spec-grid pdoc-spec-grid--cols2">{grid}</div>'
    else:
        body = f'<div class="pdoc-spec-grid">{grid}</div>'

    note = f'<p class="pdoc-section-note">{b["note"]}</p>' if b.get("note") else ""
    section_class = "pdoc-spec-section pdoc-break-before" if b.get("break_before") else "pdoc-spec-section"
    return f"""
  <div class="{section_class}">
    {bar}
    {note}
    {body}
  </div>"""


BLOCKS_HTML = "\n".join(block_html(b) for b in BLOCKS)

GALLERY_TILES_HTML = "\n    ".join(
    f'<figure class="pdoc-gallery-tile"><img src="{img_uri(img)}" alt="" />'
    f'<figcaption>{caption}</figcaption></figure>'
    for img, caption in GALLERY_IMAGES
)

# Table of contents: one row per numbered section. The page-number cell is a
# unique placeholder token ("•PN01•" etc.) left blank here on purpose —
# render_pdf.py finds each section's actual landing page in the rendered PDF
# (page numbers aren't known until Chromium paginates the content) and
# replaces each token with the real number, then adds a clickable jump link
# over the row.
TOC_SECTIONS = [(b["idx"], b["title"]) for b in BLOCKS if b["type"] == "section"]
TOC_ROWS_HTML = "\n    ".join(
    f'<div class="pdoc-toc-row">'
    f'<span class="pd-sec-index">{idx:02d}</span>'
    f'<span class="pdoc-toc-label">{title}</span>'
    f'<span class="pdoc-toc-dots"></span>'
    f'<span class="pdoc-toc-page">•PN{idx:02d}•</span>'
    f'</div>'
    for idx, title in TOC_SECTIONS
)

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
<title>Ficha Técnica · Wings Global Trade · {MODEL_NAME}</title>
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

  .pdoc-rule {{ position: relative; height: 3px; margin: 10px 0 14px; background: var(--pd-line); }}
  .pdoc-rule::before {{ content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 168px; background: var(--pd-ink); }}

  /* ── Cover: a single full-page photo (edge-to-edge, both directions) with
     the title/identity overlaid via top and bottom gradient scrims — its
     own dedicated first page; content starts fresh on page 2. ── */
  .pdoc-cover-photo {{
    position: relative; overflow: hidden; break-inside: avoid;
    margin: 0 calc(var(--pd-pad-x) * -1) 0; width: calc(100% + var(--pd-pad-x) * 2); height: 640px;
  }}
  .pdoc-cover-photo img {{ width: 100%; height: 100%; object-fit: cover; object-position: center 38%; display: block; }}
  .pdoc-cover-scrim-top {{
    position: absolute; top: 0; left: 0; right: 0; height: 34%;
    background: linear-gradient(to bottom, rgba(8,10,12,.85) 0%, rgba(8,10,12,0) 100%);
  }}
  .pdoc-cover-scrim-bottom {{
    position: absolute; bottom: 0; left: 0; right: 0; height: 56%;
    background: linear-gradient(to top, rgba(8,10,12,.95) 0%, rgba(8,10,12,.62) 55%, rgba(8,10,12,0) 100%);
  }}
  .pdoc-cover-topbar {{
    position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: flex-start;
    justify-content: space-between; padding: 30px 36px 0; color: #fff;
  }}
  .pdoc-cover-kicker {{ font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: #9fb3d9; font-weight: 700; }}
  .pdoc-cover-docnum {{ margin-top: 8px; font-family: var(--font-mono, monospace); font-size: 15px; letter-spacing: .02em; color: rgba(255,255,255,.85); }}
  .pdoc-cover-brand {{ display: flex; flex-direction: column; align-items: flex-end; text-align: right; gap: 9px; }}
  .pdoc-cover-brand .pdoc-logo {{ height: 64px; filter: brightness(0) invert(1); }}
  .pdoc-cover-tagline {{ font-size: 12px; letter-spacing: .02em; color: rgba(255,255,255,.78); text-transform: uppercase; }}
  .pdoc-cover-bottombar {{ position: absolute; left: 0; right: 0; bottom: 0; padding: 0 36px 30px; }}
  .pdoc-cover-dateline {{
    display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 16px; font-size: 12px; color: rgba(255,255,255,.78);
  }}
  .pdoc-cover-dateline span:not(:last-child)::after {{ content: '|'; margin-left: 14px; color: rgba(255,255,255,.3); }}

  /* ── Text-only identity block: a solid ink panel — reused inside the
     cover's bottom overlay, and elsewhere kept as a standalone header
     when a photo isn't in play. ── */
  .pdoc-identity {{
    background: var(--pd-ink); color: #fff; border-radius: 16px;
    padding: 26px 30px 24px; margin-bottom: 12px;
  }}
  .pdoc-identity-kicker {{ font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: #9fb3d9; font-weight: 700; margin-bottom: 5px; }}
  .pdoc-identity-name {{ font-size: 44px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; color: #fff; }}
  .pdoc-identity-trim {{ margin-top: 8px; font-size: 16px; color: rgba(255,255,255,.75); }}
  .pdoc-hero-stats {{ display: flex; margin-top: 18px; background: rgba(255,255,255,.08); border-radius: 12px; padding: 13px 10px; }}
  .pdoc-hero-stat {{ flex: 1; text-align: center; border-left: 1px solid rgba(255,255,255,.18); padding: 0 6px; }}
  .pdoc-hero-stat:first-child {{ border-left: none; }}
  .pd-hero-label {{ display: block; font-size: 10.5px; letter-spacing: .05em; text-transform: uppercase; color: rgba(255,255,255,.65); }}
  .pd-hero-value {{ display: block; margin-top: 4px; font-family: var(--font-mono, monospace); font-weight: 700; font-size: 20px; color: #fff; font-variant-numeric: tabular-nums; }}

  .pdoc-dateline {{ display: flex; flex-wrap: wrap; gap: 5px 16px; margin-bottom: 12px; font-size: 11.5px; color: var(--pd-muted); }}
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
  .pdoc-spec-section {{ margin-bottom: calc(5px + 2pt); }}
  .pdoc-break-before {{ break-before: page; }}
  .pdoc-spec-grid {{ display: flex; flex-direction: column; font-size: 11.5px; }}
  .spec-row {{
    display: grid; grid-template-columns: 270px 1fr; align-items: start; gap: 4.5px 16px;
    padding: 4.5px 8px; border-bottom: 1px solid var(--pd-line); break-inside: avoid;
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

  /* ── One-line explanation for a whole "optional configuration" block,
     instead of repeating the word on every row ── */
  .pdoc-section-note {{ margin: 6px 2px 8px; font-size: 10.5px; color: var(--pd-muted); font-style: italic; }}

  /* ── Mid-section full-bleed banner with caption pill ── */
  .pdoc-banner {{ position: relative; margin: 4px calc(var(--pd-pad-x) * -1) 11px; width: calc(100% + var(--pd-pad-x) * 2); break-inside: avoid; }}
  .pdoc-banner img {{ width: 100%; height: 145px; object-fit: cover; display: block; }}
  .pdoc-banner figcaption {{
    position: absolute; left: 16px; bottom: 10px; color: #fff; font-size: 10.5px; font-weight: 600;
    background: rgba(8,10,12,.55); padding: 4px 11px; border-radius: 999px; letter-spacing: 0.01em;
  }}

  /* ── Section with a side detail photo ── */
  .pdoc-section-split {{ display: flex; gap: 14px; align-items: flex-start; }}
  .pdoc-side-img {{ width: 155px; flex-shrink: 0; border-radius: 12px; overflow: hidden; break-inside: avoid; }}
  .pdoc-side-img img {{ width: 100%; height: 175px; object-fit: cover; display: block; }}
  .pdoc-spec-grid--narrow {{ flex: 1; min-width: 0; }}
  .pdoc-spec-grid--narrow .spec-row {{ grid-template-columns: 178px 1fr; }}

  /* ── Two-column layout for the long "Configuración Opcional" sections:
     each row stays an atomic flex item (never split mid-row) and just wraps
     two-per-line, roughly halving vertical length without relying on CSS
     multi-column balancing (which doesn't paginate reliably in Chromium's
     print engine). ── */
  .pdoc-spec-grid--cols2 {{ display: flex; flex-flow: row wrap; }}
  .pdoc-spec-grid--cols2 .spec-row {{
    flex: 0 0 50%; width: 50%; grid-template-columns: 150px 1fr; gap: 3px 10px;
  }}
  .pdoc-spec-grid--cols2 .spec-row:nth-child(odd) {{ padding-right: 12px; }}
  .pdoc-spec-grid--cols2 .spec-row:nth-child(even) {{ padding-left: 12px; }}

  /* ── Table of contents ── */
  .pdoc-toc-kicker {{ font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--pd-muted); font-weight: 700; margin-bottom: 6px; }}
  .pdoc-toc-title {{ font-size: 26px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 6px; }}
  .pdoc-toc-list {{ margin-top: 20px; }}
  .pdoc-toc-row {{ display: flex; align-items: baseline; gap: 10px; padding: 11px 2px; border-bottom: 1px solid var(--pd-line); }}
  .pdoc-toc-row .pd-sec-index {{ width: 24px; height: 24px; font-size: 11px; }}
  .pdoc-toc-label {{ font-size: 14px; font-weight: 600; }}
  .pdoc-toc-dots {{ flex: 1; border-bottom: 1px dotted var(--pd-line); margin: 0 2px 4px; }}
  .pdoc-toc-page {{ font-family: var(--font-mono, monospace); font-size: 13px; color: var(--pd-muted); font-variant-numeric: tabular-nums; }}

  /* ── The last page: gallery on top, closing signature/footer pinned to
     the physical bottom via flex (instead of floating right under the
     gallery with dead space beneath it). The min-height is one page's
     content area (297mm minus .pdoc's own cloned top/bottom padding). ── */
  .pdoc-last-page {{ display: flex; flex-direction: column; }}
  .pdoc-tail {{ margin-top: auto; padding-top: 4px; }}

  /* ── Closing image gallery: a 2x2 grid, kept off the spec tables entirely
     so the reference photos read as a gallery, not as claims about a
     specific row's spec. ── */
  .pdoc-gallery-kicker {{ font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--pd-muted); font-weight: 700; margin-bottom: 6px; }}
  .pdoc-gallery-title {{ font-size: 26px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 8px; }}
  .pdoc-gallery-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }}
  .pdoc-gallery-tile {{ position: relative; overflow: hidden; break-inside: avoid; }}
  .pdoc-gallery-tile img {{ width: 100%; height: 250px; object-fit: cover; display: block; }}
  .pdoc-gallery-tile figcaption {{
    position: absolute; left: 12px; bottom: 10px; color: #fff; font-size: 10.5px; font-weight: 600;
    background: rgba(8,10,12,.55); padding: 4px 11px; border-radius: 999px; letter-spacing: 0.01em;
  }}
  .pdoc-note {{ font-size: 10.5px; color: var(--pd-muted); font-style: italic; margin-bottom: 6px; }}
  .pdoc-close-row {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }}
  .pdoc-close-signoff {{ margin-top: 2px; font-weight: 600; }}

  .pdoc-footer {{ display: flex; justify-content: space-between; gap: 24px; margin-top: 4px; padding-top: 3px; border-top: 1px solid var(--pd-line); color: var(--pd-muted); font-size: 11.5px; break-inside: avoid; }}
  .pdoc-footer .pd-foot-right {{ text-align: right; }}

  @media (max-width: 640px) {{
    .pdoc {{ padding: 26px 20px 28px; }}
    .pdoc-title {{ font-size: 32px; }}
    .spec-row {{ grid-template-columns: 1fr; gap: 0; }}
    .pdoc-section-split {{ flex-direction: column; }}
    .pdoc-side-img {{ width: 100%; }}
    .pdoc-gallery-grid {{ grid-template-columns: 1fr; }}
    .pdoc-close-row {{ flex-direction: column; align-items: flex-start; gap: 16px; }}
    .pdoc-footer {{ flex-direction: column; gap: 12px; }}
  }}

  @media print {{
    /* Zero page margin so full-bleed photos (cover + banners) can reach the
       literal paper edge; --pd-pad-x is reintroduced here (instead of the
       old @page margin) so text content stays inset by the same amount.
       Margins are even and generous on all four sides (~9mm), with a touch
       of extra top/bottom room reserved for the running header/footer that
       render_pdf.py draws into that margin band after Chromium paginates. */
    @page {{ size: A4 portrait; margin: 0; }}
    body {{ background: #ffffff; }}
    .pdoc-page {{ min-height: 0; padding: 0; }}
    .pdoc-page .pdoc {{ box-shadow: none; }}
    /* box-decoration-break defaults to "slice": since .pdoc is a single
       block sliced across every printed page, its padding was only being
       applied at the very start and very end of that block — i.e. only on
       page 1 and the last page — leaving every interior page with ZERO
       top/bottom margin (content ran flush to the physical edge). "clone"
       reapplies the padding at each page fragment instead. */
    .pdoc {{
      --pd-pad-x: 34px; max-width: none; padding: 44px var(--pd-pad-x) 36px;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
      -webkit-box-decoration-break: clone; box-decoration-break: clone;
    }}
    .pdoc-close-row, .pdoc-footer {{ break-inside: avoid; }}
    /* The cover photo covers the entire first page: its negative top margin
       cancels .pdoc's own top padding so the image starts at the literal
       page edge, and its height is the full A4 page height. */
    .pdoc-cover-photo {{ height: 297mm; margin: -44px calc(var(--pd-pad-x) * -1) 0; }}
    /* Fill exactly one page's content area (297mm minus this page's own
       cloned top+bottom padding) so the flex layout has room to push
       .pdoc-tail all the way down to the bottom edge. */
    .pdoc-last-page {{ min-height: calc(297mm - 44px - 36px); }}
  }}
</style>
</head>
<body>
<div class="pdoc-page">
<article class="pdoc">

  <figure class="pdoc-cover-photo">
    <img src="{img_uri('cover-front')}" alt="{MODEL_NAME}" />
    <div class="pdoc-cover-scrim-top"></div>
    <div class="pdoc-cover-scrim-bottom"></div>
    <div class="pdoc-cover-topbar">
      <div>
        <div class="pdoc-cover-kicker">Ficha Técnica · Wings Global Trade</div>
        <div class="pdoc-cover-docnum">{DOC_NUMBER}</div>
      </div>
      <div class="pdoc-cover-brand">
        {LOGO}
        <span class="pdoc-cover-tagline">Soluciones integrales en importación</span>
      </div>
    </div>
    <div class="pdoc-cover-bottombar">
      <div class="pdoc-identity">
        <div class="pdoc-identity-name">{MODEL_NAME}</div>
        <div class="pdoc-identity-trim">{MODEL_TRIM}</div>
        <div class="pdoc-hero-stats">
        {HERO_STATS_HTML}
        </div>
      </div>
      <div class="pdoc-cover-dateline">
        <span>Preparado: {DOC_DATE}</span>
        <span>Origen: China</span>
        <span>Segmento: Van / minibús de pasajeros</span>
      </div>
    </div>
  </figure>

  <div class="pdoc-toc pdoc-break-before">
    <div class="pdoc-toc-kicker">Ficha Técnica · Wings Global Trade</div>
    <div class="pdoc-toc-title">Índice</div>
    <div class="pdoc-toc-list">
    {TOC_ROWS_HTML}
    </div>
  </div>

  {BLOCKS_HTML}

  <div class="pdoc-last-page pdoc-break-before">
    <div class="pdoc-gallery">
      <div class="pdoc-gallery-kicker">Ficha Técnica · Wings Global Trade</div>
      <div class="pdoc-gallery-title">Galería de Imágenes</div>
      <div class="pdoc-gallery-grid">
      {GALLERY_TILES_HTML}
      </div>
    </div>

    <div class="pdoc-tail">
    <div class="pdoc-close-row">
      <div class="pdoc-close">
        <div>Atentamente,</div>
        <div class="pdoc-close-signoff">WINGS GLOBAL TRADE</div>
      </div>
    </div>

    <footer class="pdoc-footer">
      <div>
        <div>¿Consultas? · importaciones@wingsglobaltrade.com</div>
        <div>Tel: +507 6025-07 · WhatsApp: +51 958 381 473</div>
      </div>
      <div class="pd-foot-right">
        <div>wingsglobaltrade.com</div>
      </div>
    </footer>
    </div>
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
    + [img for img, _ in GALLERY_IMAGES]
    + ["cover-front"]
))
print(f"wrote {out} ({len(HTMLDOC):,} bytes)")
print(f"sections={sum(1 for b in BLOCKS if b['type']=='section')} rows={n_rows} photos={n_photos}")
