// src/lib/mister-knowledge.ts
// Authoritative Wings knowledge base — injected into Mister's system prompt.
// No AI hallucination: Mister reads facts from here, not from training data.
// Server-side only. Never import into client components.

// ---------------------------------------------------------------------------
// CATALOG — compact pipe-delimited format for token efficiency
// Format: slug | name | HP/kVA/capacity | key-spec | key-spec | url
// ---------------------------------------------------------------------------

export const WINGS_CATALOG_TEXT = `
== CATÁLOGO WINGS — INVENTARIO ACTIVO ==

--- MAQUINARIA AGRÍCOLA — TRACTORES (todos 4WD, origen China) ---

New Holland (serie SNH/SH/TM — 50 a 140 HP):
new-holland-sh504    | New Holland SH504    | 50 HP  | 4WD | Transm. 8+2   | Motor: 4100B-4a   | Peso: 2.370 kg
new-holland-snh504   | New Holland SNH504   | 50 HP  | 4WD | Transm. 10+2  | Motor: 4100B-3    | Peso: 2.370 kg
new-holland-snh554   | New Holland SNH554   | 55 HP  | 4WD | Transm. 10+2  | Motor: 4100B-2    | Peso: 2.370 kg
new-holland-snh704   | New Holland SNH704   | 70 HP  | 4WD | Transm. 10+2  | Motor: SNH4102    | Peso: 2.500 kg
new-holland-snh754   | New Holland SNH754   | 75 HP  | 4WD | Transm. 10+2  | Motor: SNH4102Z turbo | Peso: 2.520 kg
new-holland-snh804   | New Holland SNH804   | 80 HP  | 4WD | Transm. 10+2  | Motor: SNH4102Z   | Peso: 2.520 kg
new-holland-snh1004  | New Holland SNH1004  | 100 HP | 4WD | Transm. 12+12 | Motor: Weichai WP4T90E20 | Peso: 3.890 kg
new-holland-snh1104  | New Holland SNH1104  | 110 HP | 4WD | Transm. 12+12 | Motor: Weichai WP6T110E20 | Peso: 4.720 kg
new-holland-t1104    | New Holland T1104    | 110 HP | 4WD | Transm. 12+12 | Motor: IVECO 8045.25D (europeo) | Peso: 3.900 kg
new-holland-snh1204  | New Holland SNH1204  | 120 HP | 4WD | Transm. 12+12 | Motor: Weichai WP6T120E20 | Peso: 4.850 kg
new-holland-snh1304  | New Holland SNH1304  | 130 HP | 4WD | Transm. 12+12 | Motor: Weichai WP6T130E20 | Peso: 4.850 kg
new-holland-snh1354  | New Holland SNH1354  | 135 HP | 4WD | Transm. 12+12 | Motor: Weichai WP6T135E20 | Peso: 4.850 kg
new-holland-tm140    | New Holland TM140    | 140 HP | 4WD | Transm. 20×16 | Serie TM alta producción | Peso: 5.400 kg

John Deere (series 5B/5E/6B/6E — 55 a 140 HP):
john-deere-5055e  | John Deere 5055E   | 55 HP  | 4WD | Transm. 9+3   | Peso: 2.700 kg
john-deere-5b-704 | John Deere 5B-704  | 70 HP  | 4WD | Certificación China JD | Peso: 2.790 kg
john-deere-5e-854 | John Deere 5E-854  | 85 HP  | 4WD | Transm. 12+4  | Motor: JD 4045    | Peso: 3.488 kg
john-deere-5e-954 | John Deere 5E-954  | 95 HP  | 4WD | Transm. 12+4  | Motor: JD 4045    | Peso: 3.488 kg
john-deere-5e-1104| John Deere 5E-1104 | 110 HP | 4WD | Transm. 12+4  | Motor: JD 4045
john-deere-5e-1204| John Deere 5E-1204 | 120 HP | 4WD | Serie 5E máxima potencia | Peso: 3.198 kg
john-deere-6b1204 | John Deere 6B1204  | 120 HP | 4WD | Chasis serie 6 robusto | Peso: 4.640 kg
john-deere-6e1404 | John Deere 6E1404  | 140 HP | 4WD | Transm. 12+4  | Motor: JD 4045
john-deere-6b1404 | John Deere 6B1404  | 140 HP | 4WD | Transm. 12+4  | Peso: 4.860 kg (el más pesado)

Massey Ferguson (series MF/S — 100 a 120 HP, motor Perkins):
massey-ferguson-mf1004  | Massey Ferguson MF1004   | 100 HP | 4WD | Motor: Perkins | Transm. 12+4 | Peso: 3.950 kg
massey-ferguson-mf1104  | Massey Ferguson MF1104   | 110 HP | 4WD | Motor: Perkins | Transm. 12+4 | Peso: 4.050 kg
massey-ferguson-mf1204  | Massey Ferguson MF1204   | 120 HP | 4WD | Motor: Perkins | Transm. 12+4 | Peso: 4.150 kg
massey-ferguson-s1204c  | Massey Ferguson S1204-C  | 120 HP | 4WD | Cabina cerrada climatizada | Motor: Perkins | Peso: 4.150 kg

Kubota (serie M — 70 a 100 HP, ingeniería japonesa):
kubota-m704k  | Kubota M704K  | 70 HP  | Motor: Kubota V3800-DI-T-ET19 (4 cil. turbo) | Transm. 8+8  | Peso: 2.400 kg
kubota-m854k  | Kubota M854K  | 85 HP  | Motor: Kubota V3800-DI-T-ES16              | Transm. 12+12 | Peso: 3.060 kg
kubota-m954k  | Kubota M954K  | 95 HP  | Motor: Kubota V3800-DI-T                  | Transm. 12+12 | Peso: 2.995 kg
kubota-m954kq | Kubota M954KQ | 95 HP  | Motor: V3800-DI-T | Transm. 12+12 Quad-Shift (cambio bajo carga) | Peso: 3.245 kg
kubota-m1004q | Kubota M1004Q | 100 HP | Motor: Kubota V3800-DI-TI-ES02            | Transm. 12F+12R | Peso: 3.135 kg

Rango tractores: 50 HP (New Holland SH504) a 140 HP (New Holland TM140, JD 6E1404/6B1404).
Para potencias mayores a 140 HP: sourcing personalizado (flujo TPR).
URL base: /catalogo/maquinaria-agricola/{slug}

--- CAMIONES — KAMA (origen China, 12 series, +50 variantes) ---
Cada serie KAMA tiene múltiples variantes (modelos). Al mencionar KAMA, especifica la serie Y el modelo concreto.
Catálogo completo en: src/data/kama-trucks.json

MINI TRUCKS A GASOLINA / GNC / DIÉSEL:
kama-serie-w | KAMA W Series | Gasolina Euro-V/VI | 5 variantes: W11(1T,WB2700), W12(1T,WB2700), W15S(1.5T,doble cab,WB3300), W21(1T,91kW,WB3300), W25S(1.5T,doble,91kW,WB3600) | Cabina 1600mm | GVW 2.260–3.040 kg
kama-serie-x | KAMA X Series | Gas+GNC+Diésel | 5 variantes: X11(gas,2T), X12CNG(GNC,2T), XS1C(diésel Euro-III,2T), XS2D(diésel Euro-IV,2.5T), XS3E(diésel Euro-V,2.5T) | Cabina 1750mm | GVW hasta 4.600 kg
kama-serie-v | KAMA V Series | Gasolina+GNC | 5 variantes: V11(gas Euro-III,1T), V12(gas Euro-VI,1.2T), V13CNG(GNC,1.5T), V13SCNG(GNC doble,1.5T), V15(gas 110kW,1.5T) | Cabina 1715mm | GVW 2.465–3.400 kg
kama-serie-s | KAMA S Series | Gasolina+GNC | 4 variantes: S11(1.5T), S12(2T,2L), S31(GNC,1.5T), S32(GNC doble,2T) | Cabina 1750mm | Furgón cargo y doble cab | GVW hasta 4.000 kg

CAMIONES LIGEROS / MEDIANOS:
kama-serie-k  | KAMA K Series | Diésel+Gasolina | 5 variantes: GK56E(diésel Euro-V,2.5T,YUNNEI), K66A(diésel,2T,ISUZU), K67B(diésel,2.5T,ISUZU), K68B(diésel,2.5T,YUNNEI,cab1.5), K69B(gasolina,4T,YUCHAI) | Cabina 1680mm | GVW 4.280–6.520 kg
kama-serie-m1 | KAMA M1 Series | Diésel | 3 variantes: M11(2T,ISUZU), M15(2.5T,ISUZU Euro-V), M21(3.5T,ISUZU Euro-VI 4KH1-TC) | Cabina 1700mm | GVW 4.200–6.300 kg
kama-serie-m3 | KAMA M3 Series | Diésel | 4 variantes: M31(3T,ISUZU Euro-III), M33(4.5T,ISUZU Euro-V), M36F(4T,Weichai Euro-VI), M36(6.5T,YUCHAI) | Cabina 1900mm | GVW hasta 11.500 kg | Motor ISUZU 4KH1-TC opción
kama-serie-m6 | KAMA M6 Series | Diésel | 3 variantes: M61(4T), M62(6T,ISUZU), M63(10T,YUNNEI 125kW) | Cabina 2030mm | GVW hasta 16.800 kg

VOLQUETES (DUMPER):
kama-serie-gm | KAMA GM Series | Diésel | 4 variantes: GM36B(6.5T,YUCHAI Euro-II), GM37D(6.5T,YUCHAI Euro-IV), GM66B(12T,YUCHAI 96kW,GVW 18.300kg), GM67E(10T,YUNNEI 125kW,GVW 16.620kg) | Cabina 1900/2030mm | Frenos de aire | 8+2 velocidades

ELÉCTRICOS (BEV):
kama-serie-ew-ev | KAMA EW/EV Series | BEV | 5 variantes: EW1(1T,130km,GOTION 24kWh), EW2(1.5T,200km,EVE 38kWh), EV1(1.5T,220km,GOTION 42kWh), EV2(1.5T,280km,CATL 54kWh), EV3(1.5T,260km,GOTION 51kWh) | Motor 35/70kW | Cabina 1600mm | RHD disponible
kama-serie-es-esp | KAMA ES/ESP Series | BEV | 4 variantes: ES1(cargo,220km), ES2(cargo,280km), ESP1(pasajeros 1+8,220km), ESP2(pasajeros 1+5,280km) | Batería CATL LFP | CCS2 | Norma ECE
kama-serie-ex-em | KAMA EX/EM Series | BEV | 5 variantes: EX1(1.5T,230km,EVE 55kWh,INOVANCE), EX2(2T,280km,EVE 67kWh), EM31(2.5T,290km,EVE 81kWh,DANA 60/115kW), EM32(3T,350km,CATL 100kWh), EM61(4T,360km,GOTION 141kWh,DANA 70/140kW) | GVW hasta 8.000 kg

URL base: /catalogo/camiones/{slug}
Slugs válidos: kama-serie-w | kama-serie-x | kama-serie-v | kama-serie-s | kama-serie-k | kama-serie-m1 | kama-serie-m3 | kama-serie-m6 | kama-serie-gm | kama-serie-ew-ev | kama-serie-es-esp | kama-serie-ex-em

--- BUSES (en catálogo, cotización directa) ---
bus-urbano-12m      | Bus Urbano 12m       | 90 pasajeros | 12 m | 280 HP | piso bajo | Euro V
bus-interurbano-13m | Bus Interurbano 13m  | 49 asientos  | 13 m | 340 HP | bodega 9 m³ | A/C
minibus-7m          | Minibús 7m           | 25 pasajeros | 7 m  | 150 HP | transporte personal / turismo
URL base: /catalogo/buses/{slug}

--- EQUIPO INDUSTRIAL ---
generador-diesel-250kva | Generador Diésel 250 kVA | 380/220 V 60 Hz | 48 L/h | insonorizado
montacargas-3ton        | Montacargas 3 Toneladas   | 3 T | altura 3 m | diésel | hidrodinámica
compresor-tornillo-50hp | Compresor de Tornillo 50 HP | 7 m³/min | 8 bar | 380 V trifásico
URL base: /catalogo/equipo-industrial/{slug}

--- REPUESTOS (lotes de importación) ---
filtro-aceite-universal | Filtro de Aceite Universal | caja ×50 | diésel multimarca
kit-embrague-tractor    | Kit Embrague Tractor       | tractores 70–120 HP | disco+plato+rodamiento | cerámico reforzado
neumatico-agricola-r1   | Neumático Agrícola R1      | 18.4-30 | R1 | 12 PR | diagonal
URL base: /catalogo/repuestos/{slug}
`

// ---------------------------------------------------------------------------
// PROCESS — the 6-step importation flow (definitive, no hallucination)
// ---------------------------------------------------------------------------

export const WINGS_PROCESS_TEXT = `
== PROCESO DE IMPORTACIÓN WINGS (6 pasos) ==

01 CONSULTA TÉCNICA — El importador describe el producto vía catálogo, cotizador o Mister.
   Wings evalúa especificación, origen disponible y condiciones de mercado. Respuesta en < 24h.

02 VERIFICACIÓN DE FABRICANTE — Wings identifica fabricantes certificados (China, Japón, Tailandia, Dubai).
   Verifica homologaciones CE/ISO/EPA/EURO IV, certificados de origen y capacidad de producción.

03 COTIZACIÓN CIF — Wings entrega precio CIF desglosado: FOB + flete internacional + seguro + arancel estimado.
   Zonas francas: ZOFRATACNA (Perú/Bolivia) o ZOFRI (Chile/LATAM). Ahorro vs. importación directa: 15–40%.

04 GESTIÓN DOCUMENTAL — Wings abre carta de crédito, gestiona certificados de exportación, permisos
   sanitarios/fitosanitarios y prepara el expediente de importación. Documentos: LC, BL, Cert. Origen, Packing List.

05 ZONA FRANCA Y NACIONALIZACIÓN — Mercancía ingresa a zona franca asignada. Wings coordina el despacho
   aduanal y liquidación de impuestos. El comprador puede inspeccionar antes de nacionalizar.

06 ENTREGA EN DESTINO — Wings coordina transporte de último tramo desde zona franca al almacén o punto de
   recepción del importador. Monitoreo en tránsito y confirmación de entrega.

Tiempos referenciales:
- Tractores / maquinaria agrícola desde China: 60–90 días
- Camiones / buses desde China: 75–105 días
- Repuestos / equipo compacto: 45–70 días
- Incluye trámites documentales y despacho aduanal
`

// ---------------------------------------------------------------------------
// FAQ — authoritative answers, no inference required
// ---------------------------------------------------------------------------

export const WINGS_FAQ_TEXT = `
== PREGUNTAS FRECUENTES — RESPUESTAS DEFINITIVAS ==

¿Trabajan con marcas reconocidas?
Sí. En catálogo activo: New Holland, John Deere, Massey Ferguson, Kubota (maquinaria agrícola); KAMA (camiones, incluyendo eléctricos). También gestionamos cualquier marca por importación personalizada.

¿Hay pedido mínimo?
No hay mínimo absoluto. Las importaciones más eficientes en costo empiezan desde un contenedor de 20 pies (20GP) o una unidad de maquinaria pesada. Para repuestos se puede consolidar LCL (carga compartida).

¿Necesito agente de aduana propio?
No. Wings gestiona todo el proceso documental y aduanal. El importador necesita RUC activo (Perú) o número de identificación tributaria equivalente en el país destino.

¿Cuánto tarda una importación?
Maquinaria agrícola desde China: 60–90 días. Camiones: 75–105 días. Repuestos: 45–70 días. Los plazos incluyen producción, embarque, zona franca y despacho aduanal.

¿Qué garantía tiene la maquinaria?
Los tractores New Holland cuentan con garantía de fabricante de 12 meses o 1.000 horas (lo primero que ocurra). John Deere y Massey Ferguson aplican garantías similares según contrato. Wings documenta el expediente de garantía en el proceso de importación.

¿Importan productos fuera del catálogo?
Sí. Para cualquier especificación no listada, Mister recoge el Requisito Técnico de Producto (TPR) y Wings cotiza directamente con fabricantes en origen. El catálogo cubre los modelos más solicitados; el resto es importación personalizada.

¿Se pueden ver los productos antes de enviarlos?
Sí. La zona franca permite inspección de calidad antes de la nacionalización. El comprador puede rechazar la mercancía en zona franca sin haberla importado al territorio nacional.

¿Cuál es la diferencia entre ZOFRATACNA y ZOFRI?
ZOFRATACNA (Tacna, Perú): sirve a Perú y Bolivia. ZOFRI (Iquique, Chile): sirve a Chile, Colombia, Panamá, Paraguay y Argentina. Wings asigna automáticamente según el país de destino.
`

// ---------------------------------------------------------------------------
// GREETING — updated to reflect catalog depth
// ---------------------------------------------------------------------------

export const MISTER_GREETING =
  'Soy Mister, asesor de importación de Wings Global Trade. Tenemos en catálogo tractores New Holland y John Deere de 50 a 140 HP, Kubota, Massey Ferguson; camiones KAMA en 12 series con más de 50 variantes (gasolina, diésel, GNC y eléctrico BEV hasta 360km); buses y equipo industrial — gestión CIF completa para Perú, Chile y LATAM. ¿Qué necesitas importar?'

// ---------------------------------------------------------------------------
// CATALOG MATCHING — behavior rules injected as text
// ---------------------------------------------------------------------------

export const CATALOG_BEHAVIOR_TEXT = `
== REGLAS DE CATÁLOGO — SIEMPRE PRIORIZAR EL INVENTARIO EXISTENTE ==

Cuando el usuario describe una necesidad (HP, marca, uso, tipo de producto):
1. BUSCA primero en el catálogo anterior. Si hay coincidencia, responde con el producto específico — no inicies flujo TPR.
2. PRESENTA la coincidencia así: nombre completo + HP o capacidad + 2 specs clave + URL.
   Ejemplo: "El New Holland SNH704 tiene 70 HP, tracción 4WD, transmisión 10+2 y pesa 2.500 kg — /catalogo/maquinaria-agricola/new-holland-snh704"
3. Si hay varias coincidencias (ej: varios modelos de 70 HP), muestra máximo 3 ordenados por marca/precio estimado, y pregunta cuál se ajusta mejor a las condiciones del campo.
4. OFRECE la ficha técnica completa: "¿Quieres que detalle todas las especificaciones o lo agregamos a una cotización?"
5. Para cotización de catálogo: dirige a /cotizar — NO al flujo Accio TPR.
6. Si el usuario pide una marca que tenemos (New Holland, John Deere, Massey Ferguson, Kubota, KAMA): lista los modelos de esa marca disponibles.
7. Si piden HP fuera del rango del catálogo (ej: > 140 HP en tractores): informa el rango disponible y ofrece sourcing personalizado (flujo TPR).
8. Para KAMA: siempre indica la SERIE y el MODELO concreto. Ejemplo: "La serie KAMA W tiene 5 variantes — para 1.5T doble cabina te recomiendo el W15S (WB 3300mm, motor 1249cc 61kW, Euro-VI) — /catalogo/camiones/kama-serie-w".

Cuando NO hay match en catálogo:
- "Eso no lo tenemos en catálogo activo, pero lo gestionamos por importación personalizada."
- Inicia flujo TPR normal.

Para preguntas de proceso, tiempos, documentos, aranceles, zonas francas:
- Responde desde el conocimiento definitivo anterior — no inventes, no estimes sin base.
- Si la pregunta supera el conocimiento definido (ej: arancel específico para producto inusual): "Lo confirma el equipo de Wings — deja tus datos en el formulario y te responden en < 24h."
`
