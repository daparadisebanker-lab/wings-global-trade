#!/usr/bin/env python3
"""Build the design-audit report as a self-contained HTML artifact.
Evidence crops (ev1/ev2/ev3) are annotated screenshots of the actual
ficha.pdf, generated separately. Run: python3 build_audit.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).resolve().parent


def img_uri(name: str) -> str:
    data = (HERE / name).read_bytes()
    return f"data:image/png;base64,{base64.b64encode(data).decode('ascii')}"


EV1 = img_uri("ev1_hero.png")
EV2 = img_uri("ev2_mismatch.png")
EV3 = img_uri("ev3_deadspace.png")

HTML = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Auditoría de diseño — Ficha Técnica Prado Flagship</title>
<style>
  :root {{
    --paper: #f4f5f2;
    --paper-2: #ffffff;
    --ink: #16181c;
    --ink-soft: #565b61;
    --rule: #d8dbd9;
    --red: #c22a2e;
    --red-ink: #ffffff;
    --cyan: #0e6b74;
    --cyan-ink: #ffffff;
    --ochre: #93690a;
    --ochre-ink: #ffffff;
    --mono: ui-monospace, 'SF Mono', 'Cascadia Code', Consolas, Menlo, monospace;
    --sans: -apple-system, 'Helvetica Neue', Arial, ui-sans-serif, sans-serif;
  }}
  @media (prefers-color-scheme: dark) {{
    :root:not([data-theme="light"]) {{
      --paper: #17181a; --paper-2: #1f2124; --ink: #eceeee; --ink-soft: #9aa0a6;
      --rule: #34373b; --red: #e5595c; --red-ink: #1a0708; --cyan: #4fb8c4; --cyan-ink: #062223;
      --ochre: #d6a53f; --ochre-ink: #241a03;
    }}
  }}
  :root[data-theme="dark"] {{
    --paper: #17181a; --paper-2: #1f2124; --ink: #eceeee; --ink-soft: #9aa0a6;
    --rule: #34373b; --red: #e5595c; --red-ink: #1a0708; --cyan: #4fb8c4; --cyan-ink: #062223;
    --ochre: #d6a53f; --ochre-ink: #241a03;
  }}

  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; padding: 0; }}
  body {{
    background: var(--paper); color: var(--ink); font-family: var(--sans);
    font-size: 15.5px; line-height: 1.55;
  }}
  ::selection {{ background: var(--red); color: var(--red-ink); }}

  .sheet {{ max-width: 860px; margin: 0 auto; padding: 56px 28px 90px; }}

  /* ── Masthead: styled like a print-proof header strip ── */
  .masthead {{
    border: 1.5px solid var(--ink); padding: 22px 24px; position: relative;
    background: var(--paper-2);
  }}
  .masthead::before, .masthead::after {{
    content: ''; position: absolute; width: 14px; height: 14px; border: 1.5px solid var(--ink);
    top: -8px;
  }}
  .masthead::before {{ left: -8px; border-right: none; border-bottom: none; }}
  .masthead::after {{ right: -8px; border-left: none; border-bottom: none; }}
  .eyebrow {{
    font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--ink-soft); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 16px;
    border-bottom: 1px solid var(--rule); padding-bottom: 12px; margin-bottom: 14px;
  }}
  h1 {{
    margin: 0 0 6px; font-size: clamp(28px, 4.6vw, 40px); font-weight: 800; letter-spacing: -0.015em;
    text-wrap: balance; line-height: 1.04;
  }}
  .subject {{ color: var(--ink-soft); font-size: 16px; margin: 0; }}
  .verdict-row {{ display: flex; align-items: center; gap: 14px; margin-top: 18px; flex-wrap: wrap; }}
  .score-badge {{
    font-family: var(--mono); font-weight: 700; font-size: 26px; color: var(--red);
    border: 2px solid var(--red); padding: 6px 14px; line-height: 1; font-variant-numeric: tabular-nums;
  }}
  .verdict-text {{ font-size: 13.5px; color: var(--ink-soft); max-width: 46ch; }}

  section {{ margin-top: 46px; }}
  .kicker {{
    font-family: var(--mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--red); margin: 0 0 6px; display: flex; align-items: center; gap: 8px;
  }}
  .kicker::before {{ content: ''; width: 18px; height: 1.5px; background: var(--red); display: inline-block; }}
  h2 {{ margin: 0 0 14px; font-size: 23px; font-weight: 800; letter-spacing: -0.01em; }}
  h3 {{ font-size: 16px; font-weight: 700; margin: 0 0 4px; }}
  p {{ margin: 0 0 12px; max-width: 68ch; }}
  .lede {{ font-size: 16.5px; color: var(--ink-soft); max-width: 66ch; }}

  /* ── Scorecard table ── */
  table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
  .scorecard th {{
    text-align: left; font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em;
    text-transform: uppercase; color: var(--ink-soft); padding: 0 10px 8px; border-bottom: 1.5px solid var(--ink);
  }}
  .scorecard td {{ padding: 9px 10px; border-bottom: 1px solid var(--rule); vertical-align: top; }}
  .scorecard td.num {{ font-family: var(--mono); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }}
  .scorecard tr.total td {{ border-top: 2px solid var(--ink); border-bottom: none; font-weight: 700; padding-top: 12px; }}
  .scorecard tr.total td.num {{ color: var(--red); font-size: 17px; }}
  .bar {{ display: inline-block; height: 6px; background: var(--rule); width: 64px; position: relative; margin-right: 8px; vertical-align: middle; }}
  .bar > span {{ position: absolute; inset: 0; background: var(--red); }}

  /* ── Findings ── */
  .finding {{ border-left: 3px solid var(--rule); padding: 4px 0 4px 18px; margin-bottom: 22px; }}
  .finding.sev-critical {{ border-left-color: var(--red); }}
  .finding.sev-medium {{ border-left-color: var(--cyan); }}
  .finding-head {{ display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }}
  .tag {{
    font-family: var(--mono); font-size: 10px; letter-spacing: .07em; text-transform: uppercase;
    padding: 2px 7px; border-radius: 3px; font-weight: 700; white-space: nowrap;
  }}
  .tag.critical {{ background: var(--red); color: var(--red-ink); }}
  .tag.medium {{ background: var(--cyan); color: var(--cyan-ink); }}
  .tag.low {{ background: var(--ochre); color: var(--ochre-ink); }}
  .pageref {{ font-family: var(--mono); font-size: 12px; color: var(--ink-soft); }}

  figure {{ margin: 14px 0 18px; }}
  figure img {{ display: block; max-width: 100%; height: auto; border: 1px solid var(--rule); }}
  figcaption {{ font-size: 12.5px; color: var(--ink-soft); margin-top: 6px; }}
  .evidence-row {{ display: flex; gap: 18px; flex-wrap: wrap; align-items: flex-start; }}
  .evidence-row figure {{ flex: 1 1 260px; margin: 14px 0 0; }}

  /* ── Photography brief callout ── */
  .brief {{
    background: var(--paper-2); border: 1.5px dashed var(--ink-soft); padding: 20px 22px; margin-top: 16px;
  }}
  .brief ol {{ margin: 10px 0 0; padding-left: 20px; }}
  .brief li {{ margin-bottom: 10px; }}
  .brief li::marker {{ font-family: var(--mono); color: var(--red); font-weight: 700; }}

  /* ── Roadmap table ── */
  .roadmap th {{
    text-align: left; font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em;
    text-transform: uppercase; color: var(--ink-soft); padding: 0 10px 8px; border-bottom: 1.5px solid var(--ink);
  }}
  .roadmap td {{ padding: 10px; border-bottom: 1px solid var(--rule); }}
  .roadmap td.rank {{ font-family: var(--mono); font-weight: 700; color: var(--red); }}
  .roadmap td.impact {{ font-weight: 700; }}
  .scroller {{ overflow-x: auto; }}

  /* ── Benchmarks ── */
  .bench-list {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-top: 10px; }}
  .bench {{ border: 1px solid var(--rule); padding: 14px 16px; background: var(--paper-2); }}
  .bench b {{ display: block; margin-bottom: 4px; }}
  .bench span {{ font-size: 13px; color: var(--ink-soft); }}

  blockquote {{
    margin: 0; padding: 20px 22px; border-left: 3px solid var(--red); background: var(--paper-2);
    font-size: 16.5px; font-weight: 500;
  }}

  footer {{ margin-top: 60px; padding-top: 16px; border-top: 1px solid var(--rule); font-family: var(--mono); font-size: 11.5px; color: var(--ink-soft); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }}

  @media (max-width: 620px) {{
    .sheet {{ padding: 36px 16px 60px; }}
    .verdict-row {{ flex-direction: column; align-items: flex-start; }}
  }}
</style>
</head>
<body>
<div class="sheet">

  <div class="masthead">
    <div class="eyebrow">
      <span>Auditoría de diseño · Documento de referencia FT-WGT-2026-0807</span>
      <span>Para: diseñador/a gráfico(a)</span>
    </div>
    <h1>Ficha Técnica — Prado 2026 Flagship</h1>
    <p class="subject">Estado actual: deliverables/ficha-tecnica-prado-flagship/ficha.pdf (v2, 5 páginas, 17 fotografías)</p>
    <div class="verdict-row">
      <span class="score-badge">37 / 100</span>
      <span class="verdict-text">Documento correcto, no distintivo. La arquitectura de datos y la grilla son sólidas; la fotografía es lo que hunde la percepción de calidad.</span>
    </div>
  </div>

  <section>
    <p class="kicker">Punto de partida</p>
    <h2>Dónde está parado el documento hoy</h2>
    <p class="lede">Este documento está bien construido pero no está diseñado. La grilla es limpia, los números son tabulares y correctos, y la lógica de emparejar cada foto con la sección que respalda funciona. Pero la fotografía —exactamente lo que se señaló como débil— es fotografía de lote de concesionario (reja, veredas, conos), no un sistema de producto coherente. Puesto junto a una ficha de Porsche, Polestar o Rivian, no sobrevive la comparación todavía.</p>
  </section>

  <section>
    <p class="kicker">Puntaje honesto</p>
    <h2>Scorecard</h2>
    <table class="scorecard">
      <thead><tr><th>Dimensión</th><th>Nota</th><th>Por qué</th></tr></thead>
      <tbody>
        <tr><td>Dirección creativa</td><td class="num">38</td><td>Sin tesis visual propia — podría ser cualquier ficha comercial B2B</td></tr>
        <tr><td>Tipografía</td><td class="num">52</td><td>Limpia y correcta; una sola familia/peso sostiene todo el documento</td></tr>
        <tr><td>Composición / grilla</td><td class="num">61</td><td>El activo más fuerte — el ritmo se pierde por las barras grises repetidas</td></tr>
        <tr><td>Fotografía y dirección de arte</td><td class="num">22</td><td>El problema central — fondos inconsistentes, unidades mezcladas, sin color grading</td></tr>
        <tr><td>Distintividad de marca</td><td class="num">30</td><td>Quitá el logo y nada más marca esto como Wings</td></tr>
        <tr><td>Percepción premium</td><td class="num">34</td><td>Los datos inspiran confianza; la fotografía se siente de marketplace</td></tr>
        <tr><td>Sistema de color</td><td class="num">45</td><td>El único acento azul es casi invisible — no hace ningún trabajo de marca</td></tr>
        <tr><td>Iconografía / data viz</td><td class="num">15</td><td>Cero — 40+ filas "Sí" en texto plano donde la categoría usa pictogramas</td></tr>
        <tr><td>Pulido de producción</td><td class="num">58</td><td>Sin marcas de agua ni fuga de proveedor; falta numeración de página</td></tr>
        <tr><td>Nivel de premio (Awwwards/D&amp;AD)</td><td class="num">20</td><td>No está cerca todavía — es "correcto", no "distintivo"</td></tr>
        <tr class="total"><td>Compuesto</td><td class="num">37</td><td>Arreglable sin rehacer el documento — es un problema de fotografía y dirección de arte, no de layout</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <p class="kicker">Hallazgo #1 — el más grave</p>
    <h2>Fotografía: dos unidades distintas conviven en un mismo documento</h2>
    <div class="finding sev-critical">
      <div class="finding-head"><span class="tag critical">Crítico</span><span class="pageref">pág. 1, 4–5</span></div>
      <p>Los banners exteriores usan una unidad <b>negra</b>. La galería de asientos (pág. 4) y de maletero (pág. 5) usa una unidad <b>blanca</b>. A pocos centímetros de distancia en la misma hoja, esto lee como fotos de inventario mezcladas, no "un vehículo, un folleto". Es la señal de "acá algo está mal" más visible del documento — corregir esto antes que cualquier otra cosa.</p>
    </div>
    <figure>
      <img src="{EV2}" alt="Comparación: banner exterior con unidad negra arriba, galería interior con unidad blanca abajo" />
      <figcaption>Evidencia — banner exterior (unidad negra, pág. 5) vs. galería interior/maletero (unidad blanca, pág. 4).</figcaption>
    </figure>
  </section>

  <section>
    <p class="kicker">Hallazgo #2</p>
    <h2>El crop del hero no respeta al sujeto</h2>
    <div class="finding sev-critical">
      <div class="finding-head"><span class="tag critical">Crítico</span><span class="pageref">pág. 1</span></div>
      <p>Tres problemas en la misma imagen: el techo y la antena quedan cortados por el crop superior (no hay una decisión de encuadre, es un "cover" automático); el ícono de la parrilla/emblema a 26px es ilegible — una foto de parrilla sucia no funciona como marca a escala de ícono; y la franja de estadísticas se apoya sobre una zona del degradado donde el contraste ya cayó, dejando que la parrilla oscura del auto se filtre detrás del texto.</p>
    </div>
    <figure>
      <img src="{EV1}" alt="Hero banner anotado mostrando los tres problemas de crop y contraste" />
      <figcaption>Evidencia — hero banner, página 1, con las tres fallas marcadas.</figcaption>
    </figure>
  </section>

  <section>
    <p class="kicker">Hallazgo #3</p>
    <h2>Crops sin criterio en las imágenes de detalle</h2>
    <div class="finding sev-medium">
      <div class="finding-head"><span class="tag medium">Medio</span><span class="pageref">pág. 5, sección Tecnología</span></div>
      <p>El recorte de pantalla usado junto a "Tecnología e Inteligencia Vehicular" deja cerca del 40% del cuadro como plástico de tablero vacío debajo de una pantalla pequeña. La proporción de la imagen (168×200px) no fue elegida en función de lo que hay que mostrar — fue heredada del mismo componente "imagen lateral" usado para la rueda en la página 3, donde sí funciona.</p>
    </div>
    <figure>
      <img src="{EV3}" alt="Recorte de pantalla mostrando espacio muerto debajo de la pantalla" />
      <figcaption>Evidencia — imagen lateral de la sección Tecnología, página 5.</figcaption>
    </figure>
  </section>

  <section>
    <p class="kicker">Hallazgo #4</p>
    <h2>Sin color grading — cada foto es su propia sesión</h2>
    <div class="finding sev-medium">
      <div class="finding-head"><span class="tag medium">Medio</span><span class="pageref">todo el documento</span></div>
      <p>Las fotos exteriores tienen luz de día fría; las interiores oscilan hacia un verde cálido (luz fluorescente de showroom). Nada unifica las 17 imágenes en "una sesión". Sumado al Hallazgo #1, el documento se siente como un volcado de capturas, no una sesión de producto dirigida.</p>
    </div>
  </section>

  <section>
    <p class="kicker">Hallazgo #5</p>
    <h2>Tipografía plana — sin drama de escala</h2>
    <div class="finding sev-medium">
      <div class="finding-head"><span class="tag medium">Medio</span><span class="pageref">todo el documento</span></div>
      <p>Una sola familia sans sostiene el masthead, el título del hero, las barras de sección y las 108 filas de specs. No hay una jerarquía real entre "esto es el título del documento" y "esto es un valor de ficha" — son cinco tamaños que en la práctica son todos "medium-bold, 11–14px". Un diseñador debería reservar peso/tamaño genuinamente mayor solo para el masthead y el nombre del modelo, no repetir la misma nota en toda la página.</p>
    </div>
  </section>

  <section>
    <p class="kicker">Hallazgo #6</p>
    <h2>Diez barras grises idénticas — sin ritmo</h2>
    <div class="finding sev-medium">
      <div class="finding-head"><span class="tag medium">Medio</span><span class="pageref">todo el documento</span></div>
      <p>Cada encabezado de sección es la misma barra gris plana <span style="font-family:var(--mono)">#ececec</span>, sin importar si la sección tiene 6 filas (Carrocería) o 17 (Seguridad). El numeral "01–10" es un buen instinto pero está subdimensionado — hoy es un detalle de implementación, no un dispositivo de orientación real.</p>
    </div>
  </section>

  <section>
    <p class="kicker">Hallazgo #7</p>
    <h2>Cero iconografía en un documento que la está pidiendo</h2>
    <div class="finding sev-medium">
      <div class="finding-head"><span class="tag medium">Medio</span><span class="pageref">todo el documento</span></div>
      <p>Cerca de 40 de las 108 filas de specs son booleanas ("Sí"). Toda ficha técnica premium de esta categoría (Porsche, Volvo, Rivian) reemplaza el texto "Sí" repetido por un glifo de check o un pictograma (airbag, cámara, asiento) al borde de la fila. Hoy la página es más densa y monótona de lo que necesita ser para información que es, por naturaleza, escaneable.</p>
    </div>
  </section>

  <section>
    <p class="kicker">Hallazgo #8</p>
    <h2>Sin pulido de producción para un impreso de varias páginas</h2>
    <div class="finding sev-medium">
      <div class="finding-head"><span class="tag low">Bajo</span><span class="pageref">pág. 2–5</span></div>
      <p>Sin numeración de página, sin encabezado/pie corrido que repita modelo + número de documento en páginas 2–5 — si alguien lee la página 3 suelta, no hay nada que identifique a qué vehículo o documento pertenece. Las filas con etiqueta de dos líneas (p. ej. "Capacidad del estanque de combustible (L)") no centran verticalmente su valor contra la etiqueta — se repite decenas de veces. El lenguaje "material" tipo macOS (vidrio esmerilado, elevación) que la marca ya autoriza no se usa en ningún panel superpuesto — son rellenos de opacidad plana, no el material elevado que el sistema de marca permite.</p>
    </div>
  </section>

  <section>
    <p class="kicker">Para entregar directo al fotógrafo/retocador</p>
    <h2>Brief de fotografía</h2>
    <div class="brief">
      <p>Si no hay presupuesto para una sesión nueva, un retocador puede recuperar la mayoría de lo anterior con el set de 18 imágenes existente:</p>
      <ol>
        <li><b>Elegí una sola unidad y sostenela.</b> La unidad negra tiene más ángulos utilizables (frontal, 3/4, perfil, trasera, motor, rueda); reconstruí la galería de interior/maletero solo con tomas de la unidad negra, o si las tomas de interior de la unidad blanca son las únicas disponibles, sacá el hero exterior negro y liderá todo el documento con la unidad blanca. Nunca mezclar dentro de un mismo documento.</li>
        <li><b>Unificá la temperatura de color.</b> Una sola pasada de grading (un LUT simple o balance de blancos manual) sobre las 17 imágenes antes de maquetar. Blanco neutro de luz de día como objetivo; corregir el tinte verde de las tomas de interior hacia neutro.</li>
        <li><b>Recortá con intención, no solo "cover".</b> Todo banner debería dejar espacio visible bajo las ruedas y sobre la línea de techo; nada debería tocar el borde del cuadro salvo que sea deliberado (p. ej. un detalle a sangre completa).</li>
        <li><b>Disciplina de fondo.</b> Donde no se pueda reemplazar el entorno (sin presupuesto de resesión), como mínimo aplicar keyline/viñeta a los bordes ruidosos (reja, autos estacionados) para que el ojo no se vaya al estacionamiento.</li>
        <li><b>Matá o reemplazá el "emblem" badge.</b> Cambiar el crop fotográfico de la parrilla por el isotipo real de Toyota en vectorial, o eliminarlo directamente; una foto sucia recortada a escala de ícono lee como error, no como marca.</li>
        <li><b>Reconstruí la imagen lateral de Tecnología.</b> O recortar más cerca, solo la pantalla táctil (sin plástico de tablero vacío debajo), o abandonar el tratamiento de imagen lateral para esa sección y usar un banner de ancho completo.</li>
      </ol>
    </div>
  </section>

  <section>
    <p class="kicker">Prioridades</p>
    <h2>Roadmap de implementación</h2>
    <div class="scroller">
    <table class="roadmap">
      <thead><tr><th>#</th><th>Arreglo</th><th>Esfuerzo</th><th>Impacto</th></tr></thead>
      <tbody>
        <tr><td class="rank">1</td><td>Resolver el desajuste de unidad negra/blanca entre galerías</td><td>Bajo (re-seleccionar del set existente)</td><td class="impact">Muy alto</td></tr>
        <tr><td class="rank">2</td><td>Color-gradear las 17 imágenes a un mismo balance de blancos</td><td>Medio</td><td class="impact">Muy alto</td></tr>
        <tr><td class="rank">3</td><td>Corregir crops de hero/banners (espacio bajo ruedas, línea de techo, sin espacio muerto)</td><td>Bajo–medio</td><td class="impact">Alto</td></tr>
        <tr><td class="rank">4</td><td>Reemplazar filas booleanas "Sí" por check/pictograma</td><td>Medio</td><td class="impact">Alto</td></tr>
        <tr><td class="rank">5</td><td>Introducir jerarquía tipográfica real (masthead ≠ hero ≠ sección ≠ fila)</td><td>Bajo</td><td class="impact">Alto</td></tr>
        <tr><td class="rank">6</td><td>Corregir contraste texto/foto en el hero (degradado más deliberado o panel sólido)</td><td>Bajo</td><td class="impact">Medio–alto</td></tr>
        <tr><td class="rank">7</td><td>Variar peso/tratamiento de barra de sección según relevancia</td><td>Medio</td><td class="impact">Medio</td></tr>
        <tr><td class="rank">8</td><td>Agregar encabezado/pie corrido (modelo + doc + página) en cada hoja</td><td>Bajo</td><td class="impact">Medio</td></tr>
        <tr><td class="rank">9</td><td>Reemplazar/rehacer el emblem badge</td><td>Bajo</td><td class="impact">Medio</td></tr>
        <tr><td class="rank">10</td><td>Centrar verticalmente etiquetas de fila envueltas contra su valor</td><td>Bajo</td><td class="impact">Bajo–medio</td></tr>
        <tr><td class="rank">11</td><td>Reconstruir el crop lateral de Tecnología</td><td>Bajo</td><td class="impact">Bajo–medio</td></tr>
        <tr><td class="rank">12</td><td>Aplicar material tipo vidrio esmerilado real a paneles superpuestos (ley de marca)</td><td>Medio</td><td class="impact">Medio</td></tr>
      </tbody>
    </table>
    </div>
  </section>

  <section>
    <p class="kicker">Referencias reales, no genéricas</p>
    <h2>Benchmarks de la categoría</h2>
    <p>Llevale al diseñador estas referencias en vez de "SaaS premium" genérico — son la categoría real:</p>
    <div class="bench-list">
      <div class="bench"><b>Rivian</b><span>PDFs de spec/configurador — tipografía contenida, fotografía consistente de estudio a entorno, specs booleanas con ícono.</span></div>
      <div class="bench"><b>Polestar</b><span>Fichas de producto — el drama de escala tipográfica que a este documento le falta.</span></div>
      <div class="bench"><b>Porsche</b><span>Impresos del configurador — el dispositivo de orientación por sección numerada, bien resuelto.</span></div>
      <div class="bench"><b>Leica</b><span>Hojas de datos de producto — prueba de que un documento denso en specs puede sentirse diseñado, no exportado de una base de datos.</span></div>
    </div>
  </section>

  <section>
    <p class="kicker">Conclusión</p>
    <blockquote>
      Esto no pasaría la vara de Awwwards/D&amp;AD hoy, y la razón es acotada y arreglable: la arquitectura de datos y la grilla son sólidas, pero la fotografía fue ensamblada, no dirigida, y no hay jerarquía de tipo/ícono que sostenga 108 filas de specs sin fatiga. Un diseñador con el set de 17 imágenes existente y medio día de retoque + una pasada de tipografía/iconografía puede mover esto de "documento comercial correcto" a genuinamente distintivo — la lista de arriba es exactamente ese alcance, no una reconstrucción.
    </blockquote>
  </section>

  <footer>
    <span>Wings Global Trade · Auditoría interna de diseño</span>
    <span>Preparado 07-08-2026</span>
  </footer>

</div>
</body>
</html>
"""

out = HERE / "audit.html"
out.write_text(HTML, encoding="utf-8")
print(f"wrote {out} ({len(HTML):,} bytes)")
