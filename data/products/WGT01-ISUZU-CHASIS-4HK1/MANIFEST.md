# MANIFEST — WGT01-ISUZU-CHASIS-4HK1

Pipeline: `spec/WINGS_INGESTA_PIPELINE.md` · Case 001 (corrida fundacional) ·
Branch V (PDF aplanado: 2 páginas, sin capa de texto, cada página un JPEG
2480×3508). Extracción por visión sobre los rásteres nativos; recortes desde
el ráster nativo (no desde el render 300 DPI reescalado).

## Registros

| Archivo | Tipo | Método | Verificación | Fecha |
|---|---|---|---|---|
| spec.source.json | extracción verbatim | visión sobre rásteres nativos, doble lectura de tabla a resolución completa | I6: todos los valores numéricos releídos contra los renders (bandas superior/inferior de la tabla + pie) | 2026-07-08 |
| spec.es.json | traducción por glosario | data/GLOSARIO.md (31 términos PROPUESTOS) | I1 trazado campo a campo contra spec.source.json; diacríticos verificados | 2026-07-08 |
| AMBIGUEDADES.md | protocolo de ambigüedad | 6 abiertas (a–d, f, g) · 1 resuelta por verificación (e) | correo borrador al contacto de Stage 0 incluido | 2026-07-08 |

## Activos — evidencia (`images/evidence/`)

Todos recortados de la página 1 nativa (2480×3508). Piso C-HERO ~1200 px lado largo.

| Archivo | Contenido | Región (p1) | Tamaño | Piso | Destino |
|---|---|---|---|---|---|
| ev-01-motor-caja-4HK1.png | Motor 4HK1 + caja MLD (par) | (60,2320)–(930,2692) | 870×372 | FALLA | lista solicitar-originales |
| ev-02-chasis-perfil.png | Chasis desnudo, perfil/tres cuartos, fondo estudio | (932,2320)–(1652,2692) | 720×372 | FALLA | lista solicitar-originales |
| ev-03-barra-estabilizadora-inferior.png | Bajos: barra estabilizadora + radiador | (1657,2320)–(2468,2692) | 811×372 | FALLA | lista solicitar-originales |
| ev-04-suspension-ballestas.png | Detalle suspensión / ballestas | (55,2985)–(608,3268) | 553×283 | FALLA | lista solicitar-originales |
| ev-05-neumatico-rueda.png | Neumático / rueda (235/75R17.5) | (612,2985)–(916,3268) | 304×283 | FALLA | lista solicitar-originales |

Ningún recorte entra al pipeline C-HERO hasta recibir originales del
proveedor (la ley: los recortes de baja resolución nunca se torturan con
upscale hacia el catálogo).

## Activos — referencia (`images/reference/`) — solo estudio, nunca republicar

| Archivo | Contenido | Clase |
|---|---|---|
| ref-01-ghost-bus-hero-composite.png | Composite de marketing del proveedor (bus fantasma en autopista) | Reference |
| ref-02-pagina1-layout.png | Página 1 completa (layout del proveedor) | Reference |
| ref-03-pagina2-layout.png | Página 2 completa (layout del proveedor) | Reference |
| diag-01-vista-lateral-FOH-WB-ROH-OAL-EH.png | Plano lateral, códigos de cota (sin valores numéricos) | Diagram — insumo del esquema Q-DIM |
| diag-02-vista-frontal-AW.png | Plano frontal, código AW | Diagram — insumo del esquema Q-DIM |
| diag-03-vista-posterior-OW-OH-HH-CW-BW.png | Plano posterior, códigos OW/OH/HH/CW/BW | Diagram — insumo del esquema Q-DIM |

El esquema Q-DIM «¿Entra este chasis en mi proyecto de carrocería?»
(patrón ESQ-MAQ-005) queda **bloqueado por la ambigüedad g** — el catálogo
no imprime valores de cota; un esquema de dimensiones sin valores del
registro de especificación violaría la ley "los valores son evidencia".

## Ficha técnica (Stage 6)

| Documento | Ubicación | Estado | Fecha |
|---|---|---|---|
| FICHA TÉCNICA — Master + composición r1 (WGT-FT-WGT01-ISUZU-CHASIS-4HK1-r1) | Figma `hmIA7gzNQbNZ677kVo2p6x` (P1 `2:2`, P2 `2:3`) — clave en `spec/COTIZADOR.env` | Compuesta con datos de spec.es.json; A4 @2x, 2 páginas. Slots `img:producto` e `img:esquema:dim` en placeholder (bloqueados por originales pendientes y ambigüedad g). Campos pendientes marcados en dorado. **Fuente Flexo no disponible en Figma — DM Sans como sustituto marcado; subir Flexo y reemplazar antes de exportar.** Export PDF pendiente. | 2026-07-08 |

## Visuales de la ficha (Stage 6 continuación, 2026-07-08 — segunda sesión)

| Slot | Asset | Estado |
|---|---|---|
| `img:esquema:dim` | Esquema Q-DIM construido nativo en Figma (nodo `8:2`) — ghost/ink/gold, valores WB del registro (4 175/4 475/5 200 mm), DM Mono, «Esquema ilustrativo». La ficha (5 líneas) está en la fila del MANIFEST de image-generation. Desbloqueado: responde con las cotas que SÍ son evidencia; las cotas pendientes (ambigüedad g) siguen fuera del dibujo — omitidas, no inventadas. | LISTO — gates X1–X3 machine ok; X4–X7 y J-gates: fallo del fundador |
| `img:producto` | `images/generated/gen-01-chasis-cutout-registroB-r1.png` — cutout B4 generado (recraftv3 + remove_background), compuesto sobre `#F8F6F0`. Leyenda impresa: «Representación ilustrativa generada — no constituye evidencia del producto.» | **CONDICIONAL — defecto J4** (rueda trasera asimétrica). 12 frames muertos en 4 lotes (ver REJECTED.md). Sustituir por fotografía original del proveedor cuando llegue (solicitud ya en AMBIGUEDADES.md). |

## Fuente

| Archivo | Derechos | Recepción | Fecha del documento |
|---|---|---|---|
| source/ISUZU_Bus_Chassis_Catalog.pdf | supplier_provided (GP Motors Technology, Chongqing) | 2026-07-08 | creación PDF 2025-04-29 |
