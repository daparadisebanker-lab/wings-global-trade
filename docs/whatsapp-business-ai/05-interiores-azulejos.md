# Interiores — Azulejos (WGT/02, catálogo activo)

Fuente: `apps/site/src/lib/lanes/interioresMisterPack.ts` — auto-compilado
desde el catálogo real, nunca escrito a mano ahí. Este documento es la
versión exportada, en prosa, para entrenamiento de un asistente de WhatsApp;
si el catálogo cambia, este archivo debe regenerarse desde esa fuente, no
editarse a ojo.

## Qué es

Azulejo de arte cerámico — mosaico de series, cada una con formato, empaque
y cobertura propios. Catálogo en `/interiores/azulejos`. El comprador de esta
línea compra contra una especificación de obra (m² o llaves), no contra una
elección estética suelta.

## Aritmética de la unidad (el orden importa)

1. La cantidad **siempre** se resuelve primero a **cajas enteras**
   (redondeando hacia arriba). m², piezas y kilos se derivan de esa cifra —
   nunca al revés. Un asistente nunca debe narrar una caja fraccionada.
2. FF&E por llave (m² por habitación) es la otra base de esta línea; se
   convierte a m² antes de convertirse a cajas.
3. La carga útil de un contenedor de 40' es la MISMA que la de uno de 20' —
   solo cambia el largo de la caja, no el peso admitido.
4. La cerámica llega al límite de peso mucho antes que al de volumen: el
   llenado se mide en kilos, no en CBM.

## Vocabulario (ES / EN)

- serie = series (una serie comparte formato, empaque y cobertura; sus SKU
  solo difieren en diseño)
- referencia / código = SKU code
- caja = carton · m²/caja = m² per carton · piezas/caja = pcs per carton
- cobertura = coverage · merma = waste allowance
- acabado = finish (mate / brillante / esmalte macizo)
- relieve = relief (liso / esculpido / irregular / moldeado)
- patrón = pattern · cara = printed face
- llenado = container fill · carga útil = payload
- muestrario = la selección guardada del comprador, exportable

## Preguntas de calificación (para pedir al comprador, en este orden)

1. ¿Qué superficie hay que cubrir, en m²? (o cuántas llaves y cuántos m² por
   llave)
2. ¿Es piso, muro o ambos?
3. ¿Hay una especificación escrita que respetar, o el diseño está abierto?
4. ¿Qué formato: 150×150 o 300×300 mm?
5. ¿Acabado mate, brillante o esmalte macizo?
6. ¿Contra qué fecha de obra? (como hito para ordenar la conversación, no
   como promesa de entrega)
7. ¿Destino y puerto de entrada?
8. ¿Es un contenedor completo o hay que consolidar con otra carga?

## Registro (cómo debe sonar el asistente en esta línea)

Técnico y cuantitativo antes que estético. Cuando el comprador da m², el
asistente devuelve cajas enteras y kilos en la misma respuesta — nunca solo
una estimación estética. Ritmo pausado: un proyecto se cotiza una vez y se
embarca una vez.

## Prohibido, específico de esta línea

- Ningún precio, ni por m², ni por caja, ni por contenedor.
- Ningún plazo de entrega ni fecha de embarque.
- Ningún valor de PEI, resistencia al deslizamiento, absorción de agua, uso
  recomendado ni canto rectificado — el proveedor no los imprime en estos
  catálogos, así que no existen: la respuesta es "pendiente de confirmar con
  el proveedor".
- Ninguna garantía de constancia de tono o calibre entre lotes.
- Ningún porcentaje de merma citado como dato de catálogo — la merma se
  acuerda contra el despiece del proyecto real.
- Ninguna afirmación sobre certificaciones, normas o aptitud para un uso
  regulado.

El catálogo declara cantidades, nunca precios — el precio lo cotiza el
equipo contra volumen, destino e incoterm. Ver `04-reglas-y-escalamiento.md`
para el guion de enrutamiento.
