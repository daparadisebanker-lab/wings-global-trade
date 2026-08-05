# Líneas de negocio (lanes) — qué está activo y qué no

Wings organiza su oferta en "lanes" (divisiones), cada una con su propia
lógica de compra. Un asistente de WhatsApp debe distinguir entre lo que ya
está en operación y lo que todavía no — nunca afirmar que una línea vende
algo que aún no tiene catálogo ni contenido cargado.

## Catálogo general (oferta actual, forma pre-lane)

El sitio ya opera un catálogo curado en estas categorías, con inquiry por
formulario (sin precio en línea):

- Maquinaria agrícola (mercados de origen: China, Tailandia)
- Camiones y vehículos comerciales (China, Japón)
- Buses (China, Japón)
- Equipo industrial (China, Dubái)
- Repuestos (China, Dubái, Tailandia)

El catálogo no es un feed de stock en vivo: es un directorio estructurado con
especificaciones y precio de referencia curados por Wings. La disponibilidad
se confirma manualmente después de la consulta — un asistente de WhatsApp
nunca debe afirmar "en stock" ni una fecha de entrega concreta.

## WGT/02 — Interiores (estado: OPENING, activa)

- **Qué compra el cliente:** una entrega delimitada por proyecto (llave, m²,
  habitación) — arquetipo PROJECT.
- **Primer catálogo:** Azulejos (mosaico cerámico), en `/interiores/azulejos`.
  Ver `05-interiores-azulejos.md` para el detalle completo — cobertura,
  formato, cajas, acabado.
- El resto de la línea (mosaico, otras disciplinas de interiorismo) está en
  P2 y no debe mencionarse como disponible hoy.

## Líneas conceptuales, todavía no registradas como lane independiente

El framework define seis arquetipos de compra (root `CLAUDE.md` §3) —
EQUIPMENT, PROJECT, COMMODITY, PROGRAM, CREDENTIAL, ORIGIN — y usa nombres de
referencia (WGT/01 Maquinaria, WGT/03 Provisiones, WGT/04 Living, WGT/05
Representación, WGT/06 Export) como ejemplos del arquetipo, no como líneas ya
onboardeadas con su propio código registrado. Hoy solo **WGT/02 Interiores**
tiene código de lane, livery y catálogo ledgereados en
`packages/liveries/registry.md`. Un asistente de WhatsApp no debe usar
códigos "WGT/0N" frente al cliente ni prometer contenido de una línea que
todavía no abrió — si preguntan por una categoría que no está en esta lista,
la respuesta correcta es enrutar a un especialista, no inventar cobertura.

## Marcas representadas (RB/xx) — distinto de un lane

- **RB/01 — Áladín** (papel higiénico y facial de bambú): estado
  ONBOARDING. Wings representa la marca y vende por contenedor completo o
  cupo de contenedor — nunca por unidad suelta, nunca con precio en prosa.
  Vive en `/marcas/aladin` dentro del sitio, con ficha de crédito propia; no
  es un lane de Wings ni usa un asistente separado (comparte a Mister).

## Regla general para el asistente

Ante cualquier pregunta sobre una categoría o línea que no aparece arriba
como activa: no afirmar ni negar catálogo — enrutar a
**+507 6025 0735** con la pregunta tal cual la hizo el cliente.
