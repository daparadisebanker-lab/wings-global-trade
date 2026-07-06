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
Para potencias mayores a 140 HP: sourcing por importación personalizada.
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

--- REPUESTOS — MOTORES JDM (origen Japón, usados, verificados) ---
Cotización: surface {"type": "quotation_form"} en el bloque de control — no imprimir enlaces.
8 marcas · ~220 códigos de motor · condición: usado japonés | suministro: importación directa Japón
CKD (kit sin armado) disponible en algunos códigos; indicar al usuario que consulte para cotización.

DAIHATSU (4 variantes):
1KR PASSO    | 998cc  | I3 | 58 HP  | Boon, Passo, Perodua Myvi
1KR VITS     | 998cc  | I3 | 67 HP  | Vitz KSP90, Yaris
K3           | 1298cc | I4 | 87 HP  | Mira, Sirion
K3 TERIOS    | 1298cc | I4 | 133 HP | turbo | Terios Kid, Cami

HONDA (32 variantes — selección clave):
B20B RF1     | 1972cc | I4 | 130 HP | CR-V RD1, Orthia
D15B NEW     | 1493cc | I4 | 130 HP | Civic EK9, Domani
F20B         | 1997cc | I4 | 200 HP | Accord CF5, Prelude BB5 | CKD BLUE disponible
F23A         | 2254cc | I4 | 150 HP | Accord CH9, Odyssey RA6
K20A         | 1998cc | I4 | 155 HP | CR-V RD5, Accord CL7
K24A         | 2354cc | I4 | 160 HP | Odyssey RB1/RB3, CR-V RD6
J30A         | 2997cc | V6 | 210 HP | Odyssey RR3/RR4/RA8
J35A KB1     | 3471cc | V6 | 265 HP | Legend KB1, Odyssey RR5
L13A/L15A    | 1339/1497cc | I4 | 86–109 HP | Jazz/Fit GD/GE
R18A/R20A    | 1798/1997cc | I4 | 140–150 HP | Civic FD, CR-V RE3

MITSUBISHI (22 variantes — selección clave):
4G63 NO GDI  | 1997cc | I4 | 145 HP | Lancer CP9A, Galant E54A
4G64 DELICA  | 2350cc | I4 | 134 HP | Delica D:5, Space Gear
4G69 MIVEC   | 2378cc | I4 | 160 HP | Outlander CW5W, Fortis CX5A
6G72 FR      | 2972cc | V6 | 230 HP | Pajero V6, GTO Z16A
6G74 FR      | 3497cc | V6 | 245 HP | Pajero V75W, Montero V6
4B11/4B12    | 1998/2360cc | I4 | 150–170 HP | Outlander, Lancer CY

MAZDA (21 variantes — selección clave):
FE           | 1998cc | I4 | 68 HP  | diésel | Bongo E2200, B-series
WL TURBO     | 2499cc | I4 | 115 HP | diésel turbo | B-series, Ranger
RF BLACK/NEW | 2184cc | I4 | 100–105 HP | diésel turbo | Capella, Bongo
R2           | 2209cc | I4 | 72–74 HP | diésel | Bongo SK, Bongo Truck
L3 TURBO     | 2261cc | I4 | 260 HP | turbo | Mazdaspeed6, CX-7 Turbo
FS/FP        | 1839/1991cc | I4 | 112–140 HP | Capella GW, 626 GF

NISSAN (35 variantes — selección clave):
RB20         | 1998cc | I6 | 145 HP | Skyline R31/R32, Laurel C33
RB25 NEO     | 2498cc | I6 | 210 HP | Skyline R33/R34, Stagea WGNC34
SR20         | 1998cc | I4 | 145 HP | Primera P11, 200SX S14
MR20         | 1997cc | I4 | 141 HP | X-Trail T31, Sylphy B17
QR20/QR25    | 1997/2488cc | I4 | 140–170 HP | X-Trail T30/T31, Navara
VQ35 DE/HR   | 3498cc | V6 | 280–306 HP | 350Z Z33, Elgrand E51
VQ37         | 3696cc | V6 | 330 HP | 370Z Z34, G37
YD25 FF/FR   | 2488cc | I4 | 170–190 HP | diésel turbo | Navara, Pathfinder
ZD30         | 2953cc | I4 | 150 HP | diésel turbo | Patrol Y61, Caravan
QD32 EFI     | 3153cc | I4 | 100 HP | diésel | Caravan E24, Elgrand E50
GA15 EFI     | 1497cc | I4 | 90 HP  | Sunny B13, Sentra

SUBARU (11 variantes):
EJ20 NA      | 1994cc | B4 | 125 HP | Legacy BH, Forester SF, Impreza
EJ25 NA      | 2457cc | B4 | 165–173 HP | Outback BP9, Legacy BL9
EJ25 TURBO   | 2457cc | B4 | 210 HP | Legacy BP9 Spec B, Outback
FB20/FB25    | 1995/2498cc | B4 | 148–172 HP | Impreza GJ, XV, Forester
EZ30         | 2999cc | B6 | 212 HP | Outback BH9, Tribeca

SUZUKI (7 variantes):
K6A FR       | 658cc  | I3 | 58 HP  | Jimny JB23, Wagon R MC22
K12B         | 1242cc | I4 | 85 HP  | Swift ZC72S
M13A/M15A    | 1328/1490cc | I4 | 89–99 HP | Swift, Aerio, Liana
M16A AT/MT   | 1586cc | I4 | 107–110 HP | Swift Sport, SX4

TOYOTA (60+ variantes — selección clave):
1JZ VVT-i    | 2491cc | I6 | 200 HP | Crown JZS171, Mark II JZX110
2JZ VVT-i    | 2997cc | I6 | 230 HP | Crown JZS171, Aristo JZS160
1MZ VVTI     | 2994cc | V6 | 220 HP | Camry MCV30, Harrier MCU30
1NZ CVT K210 | 1497cc | I4 | 109 HP | Vitz NCP91, Yaris NCP93
1KZ          | 2982cc | I4 | 130 HP | diésel | Prado KZJ95, Hiace KZH
2AZ NEW      | 2362cc | I4 | 167 HP | Camry ACV40, RAV4 ACA36
2GR FF       | 3456cc | V6 | 296 HP | Alphard ANH20, Estima ACR50
1UZ VVTI     | 3969cc | V8 | 290 HP | Celsior UCF30, Lexus LS430
3UZ          | 4292cc | V8 | 285 HP | Crown Majesta, Celsior UCF31
5VZ          | 3378cc | V6 | 190 HP | Prado VZJ95, Hilux Surf
3RZ          | 2693cc | I4 | 145 HP | Prado RZJ95, Hiace
1TR LPG      | 1998cc | I4 | 145 HP | GLP | Hiace TRH200, Regius Ace
1ZZ NEW      | 1794cc | I4 | 140 HP | Corolla Fielder, Auris NZE151
2ZZ          | 1796cc | I4 | 190 HP | Celica ZZT231, Lotus Elise

GUÍA DE USO PARA MISTER:
- NUNCA cotizar precio absoluto. Toda consulta de precio → explicar la estructura de costo (motor + flete aéreo/marítimo + seguro + arancel + nacionalización) y surface {"type": "quotation_form"} en el bloque de control.
- "CKD" = kit sin armado, requiere cotización especial.
- Turbo: indicar siempre si aplica — impacta insumos, diagnóstico y mantenimiento.
- Si el usuario menciona un vehículo (ej. "Nissan X-Trail T30"), identificar el código de motor correcto y sugerirlo.
- Referencia los productos por nombre completo; no imprimas URLs en el texto.
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

03 COTIZACIÓN CIF — El equipo Wings entrega la cotización CIF formal, con la estructura desglosada: FOB + flete internacional + seguro + arancel.
   Zonas francas: ZOFRATACNA (Perú/Bolivia) o ZOFRI (Chile/LATAM). El régimen suspensivo de zona franca cambia la estructura del costo frente a la importación directa; el ahorro concreto depende del producto y del régimen, y lo cuantifica la cotización.

04 GESTIÓN DOCUMENTAL — Wings abre carta de crédito, gestiona certificados de exportación, permisos
   sanitarios/fitosanitarios y prepara el expediente de importación. Documentos: LC, BL, Cert. Origen, Packing List.

05 ZONA FRANCA Y NACIONALIZACIÓN — Mercancía ingresa a zona franca asignada. Wings coordina el despacho
   aduanal y liquidación de impuestos. El comprador puede inspeccionar antes de nacionalizar.

06 ENTREGA EN DESTINO — Wings coordina transporte de último tramo desde zona franca al almacén o punto de
   recepción del importador. Monitoreo en tránsito y confirmación de entrega.

Plazos:
- El tiempo total depende de producción, embarque, ingreso a zona franca y despacho aduanal.
- Los plazos concretos los confirma el equipo Wings en la cotización formal, según el producto y el embarque.
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
El proceso avanza por fases: producción en origen, embarque, ingreso a zona franca y despacho aduanal. El plazo concreto lo confirma el equipo en la cotización formal, según producción y embarque.

¿Qué garantía tiene la maquinaria?
Los tractores New Holland cuentan con garantía de fabricante de 12 meses o 1.000 horas (lo primero que ocurra). John Deere y Massey Ferguson aplican garantías similares según contrato. Wings documenta el expediente de garantía en el proceso de importación.

¿Importan productos fuera del catálogo?
Sí. Para cualquier especificación no listada, Mister recoge los requisitos del usuario en la conversación y Wings cotiza directamente con fabricantes en origen. El catálogo cubre los modelos más solicitados; el resto es importación personalizada.

¿Se pueden ver los productos antes de enviarlos?
Sí. La zona franca permite inspección de calidad antes de la nacionalización. El comprador puede rechazar la mercancía en zona franca sin haberla importado al territorio nacional.

¿Cuál es la diferencia entre ZOFRATACNA y ZOFRI?
ZOFRATACNA (Tacna, Perú): sirve a Perú y Bolivia. ZOFRI (Iquique, Chile): sirve a Chile, Colombia, Panamá, Paraguay y Argentina. Wings asigna automáticamente según el país de destino.
`

// ---------------------------------------------------------------------------
// GREETING — LEGACY ONLY: consumed by the retired /accio flow via src/lib/claude.ts.
// Mister v2 does NOT use this (the Provider hardcodes the induction opener).
// Kept solely so the legacy import resolves; do not wire into any v2 path.
// ---------------------------------------------------------------------------

export const MISTER_GREETING =
  'Soy Mister, asesor de importación de Wings Global Trade. Tenemos en catálogo tractores New Holland y John Deere de 50 a 140 HP, Kubota, Massey Ferguson; camiones KAMA en 12 series con más de 50 variantes (gasolina, diésel, GNC y eléctrico BEV hasta 360km); buses y equipo industrial — gestión CIF completa para Perú, Chile y LATAM. ¿Qué necesitas importar?'

// ---------------------------------------------------------------------------
// CATALOG MATCHING — behavior rules injected as text
// ---------------------------------------------------------------------------

export const CATALOG_BEHAVIOR_TEXT = `
== REGLAS DE CATÁLOGO — SIEMPRE PRIORIZAR EL INVENTARIO EXISTENTE ==

Cuando el usuario describe una necesidad (HP, marca, uso, tipo de producto):
1. BUSCA primero en el catálogo anterior. Si hay coincidencia, responde con el producto específico — no inicies importación personalizada.
2. PRESENTA la coincidencia así: nombre completo + HP o capacidad + 2 specs clave. No escribas la URL en el texto; emite una superficie de producto en el bloque de control con el slug como ref.
   Ejemplo: "El New Holland SNH704 tiene 70 HP, tracción 4WD, transmisión 10+2 y pesa 2.500 kg." + surface {"type": "product", "ref": "new-holland-snh704"}
3. Si hay varias coincidencias (ej: varios modelos de 70 HP), muestra máximo 3 ordenados por marca/potencia, y pregunta cuál se ajusta mejor a las condiciones del campo.
4. OFRECE la ficha técnica completa: "¿Quieres que detalle todas las especificaciones o lo agregamos a una cotización?"
5. Para cotización de catálogo: surface {"type": "quotation_form"} en el bloque de control — no escribas un enlace ni derives a una URL.
6. Si el usuario pide una marca que tenemos (New Holland, John Deere, Massey Ferguson, Kubota, KAMA): lista los modelos de esa marca disponibles.
7. Si piden HP fuera del rango del catálogo (ej: > 140 HP en tractores): informa el rango disponible y ofrece sourcing por importación personalizada.
8. Para KAMA: siempre indica la SERIE y el MODELO concreto, y emite una superficie de producto con el slug de la serie como ref. Ejemplo: "La serie KAMA W tiene 5 variantes; para 1.5T doble cabina te recomiendo el W15S (WB 3300mm, motor 1249cc 61kW, Euro-VI)." + surface {"type": "product", "ref": "kama-serie-w"}.

Cuando NO hay match en catálogo:
- "Eso no lo tenemos en catálogo activo, pero lo gestionamos por importación personalizada."
- Importación personalizada: recoge los requisitos del usuario en la conversación y surface {"type": "quotation_form"} en el bloque de control.

Para preguntas de proceso, tiempos, documentos, aranceles, zonas francas:
- Responde desde el conocimiento definitivo anterior — no inventes, no estimes sin base.
- Si la pregunta supera el conocimiento definido (ej: arancel específico para producto inusual): "Lo confirma el equipo de Wings — deja tus datos en el formulario y te responden en < 24h."
`
