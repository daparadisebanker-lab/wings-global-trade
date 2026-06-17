-- ============================================================
-- Wings Global Trade — Seed Data
-- 5 categories + sample products. Idempotent via ON CONFLICT.
-- ============================================================

INSERT INTO categories (slug, name_es, name_en, description_es, icon_key, sort_order) VALUES
  ('maquinaria-agricola', 'Maquinaria Agrícola', 'Agricultural Machinery', 'Tractores, cosechadoras y equipos de labranza de origen certificado.', 'tractor', 1),
  ('camiones', 'Camiones', 'Trucks', 'Camiones de carga, volquetes y furgones para transporte pesado.', 'truck', 2),
  ('buses', 'Buses', 'Buses', 'Buses urbanos, interurbanos y minibuses para transporte de pasajeros.', 'bus', 3),
  ('equipo-industrial', 'Equipo Industrial', 'Industrial Equipment', 'Generadores, compresores, montacargas y maquinaria de planta.', 'gear', 4),
  ('repuestos', 'Repuestos', 'Spare Parts', 'Repuestos originales y compatibles para maquinaria y vehículos.', 'part', 5)
ON CONFLICT (slug) DO NOTHING;

-- ---------- Agricultural Machinery ----------
INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'tractor-snh504', 'Tractor SNH504', 'SNH504 Tractor',
  'Tractor agrícola profesional con motor de 50 HP y tracción 4WD, ideal para operaciones de campo intensivas. Transmisión 8+2 y peso operativo de 2.370 kg.',
  '{"Potencia del motor":"50 HP","Tipo de tracción":"4WD","Transmisión":"8+2","Peso operativo":"2370 kg","Toma de fuerza":"766 RPM","Norma de emisiones":"Stage II"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Agricola Desktop.png'], 1
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'tractor-snh704', 'Tractor SNH704', 'SNH704 Tractor',
  'Tractor de potencia media con motor de 70 HP, diseñado para labranza y transporte agrícola. Tracción 4WD y cabina opcional.',
  '{"Potencia del motor":"70 HP","Tipo de tracción":"4WD","Transmisión":"8+2","Peso operativo":"2980 kg","Norma de emisiones":"Stage II"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Agricola Desktop.png'], 2
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'tractor-jd-5e1104', 'Tractor John Deere 5E-1104', 'John Deere 5E-1104 Tractor',
  'Tractor de alta potencia con motor de 110 HP para uso agrícola intensivo. Tracción 4WD y elevada capacidad de levante hidráulico.',
  '{"Potencia del motor":"110 HP","Tipo de tracción":"4WD","Capacidad de levante":"3200 kg","Peso operativo":"4100 kg","Norma de emisiones":"Stage III"}'::jsonb,
  ARRAY['China','Japón'], ARRAY['/Desktop Home/Agricola Desktop.png'], 3
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, models, sort_order)
SELECT id, 'cosechadora-grano-4lz', 'Cosechadora de Grano 4LZ', '4LZ Grain Harvester',
  'Cosechadora de grano autopropulsada con cabezal de corte de 2,75 m y tanque de grano de 1.800 L. Apta para arroz, trigo y maíz.',
  '{"Potencia del motor":"102 HP","Ancho de corte":"2.75 m","Capacidad del tanque":"1800 L","Tipo de trilla":"Flujo axial","Peso operativo":"5200 kg"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Agricola Desktop.png'],
  '[{"name":"4LZ Estándar","specs_override":{}},{"name":"4LZ Cabinado","specs_override":{"Cabina":"Cerrada con A/C"}}]'::jsonb, 4
FROM categories WHERE slug = 'maquinaria-agricola'
ON CONFLICT (slug) DO NOTHING;

-- ---------- Trucks ----------
INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'volquete-howo-8x4', 'Volquete HOWO 8x4', 'HOWO 8x4 Dump Truck',
  'Volquete minero de servicio pesado con configuración 8x4 y capacidad de tolva de 30 m³. Motor diésel de 400 HP.',
  '{"Potencia del motor":"400 HP","Configuración":"8x4","Capacidad de tolva":"30 m³","Carga útil":"40 toneladas","Transmisión":"Manual 12 velocidades"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Camiones Desktop.png'], 1
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'camion-carga-6x4', 'Camión de Carga 6x4', '6x4 Cargo Truck',
  'Camión de carga 6x4 para transporte de larga distancia. Cabina con litera y motor diésel de 380 HP con norma Euro V.',
  '{"Potencia del motor":"380 HP","Configuración":"6x4","Norma de emisiones":"Euro V","Capacidad de carga":"25 toneladas","Tanque de combustible":"400 L"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Camiones Desktop.png'], 2
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'furgon-refrigerado-4x2', 'Furgón Refrigerado 4x2', '4x2 Refrigerated Van',
  'Furgón refrigerado para cadena de frío con unidad de refrigeración de -18 °C. Caja de 6,2 m y motor diésel de 180 HP.',
  '{"Potencia del motor":"180 HP","Configuración":"4x2","Temperatura mínima":"-18 °C","Volumen de caja":"34 m³","Largo de caja":"6.2 m"}'::jsonb,
  ARRAY['China','Tailandia'], ARRAY['/Desktop Home/Camiones Desktop.png'], 3
FROM categories WHERE slug = 'camiones'
ON CONFLICT (slug) DO NOTHING;

-- ---------- Buses ----------
INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'bus-urbano-12m', 'Bus Urbano 12m', '12m City Bus',
  'Bus urbano de piso bajo de 12 metros con capacidad para 90 pasajeros. Motor diésel de 280 HP y accesibilidad universal.',
  '{"Longitud":"12 m","Capacidad":"90 pasajeros","Potencia del motor":"280 HP","Tipo de piso":"Bajo","Norma de emisiones":"Euro V"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Bueses Desktop.png'], 1
FROM categories WHERE slug = 'buses'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'bus-interurbano-13m', 'Bus Interurbano 13m', '13m Coach Bus',
  'Bus interurbano de 13 metros con 49 asientos reclinables, aire acondicionado y bodega de equipaje de gran volumen.',
  '{"Longitud":"13 m","Capacidad":"49 asientos","Potencia del motor":"340 HP","Aire acondicionado":"Sí","Volumen de bodega":"9 m³"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Bueses Desktop.png'], 2
FROM categories WHERE slug = 'buses'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'minibus-7m', 'Minibús 7m', '7m Minibus',
  'Minibús de 7 metros para 25 pasajeros, ideal para transporte de personal y turismo. Motor diésel de 150 HP.',
  '{"Longitud":"7 m","Capacidad":"25 pasajeros","Potencia del motor":"150 HP","Transmisión":"Manual 6 velocidades"}'::jsonb,
  ARRAY['China','Japón'], ARRAY['/Desktop Home/Bueses Desktop.png'], 3
FROM categories WHERE slug = 'buses'
ON CONFLICT (slug) DO NOTHING;

-- ---------- Industrial Equipment ----------
INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'generador-diesel-250kva', 'Generador Diésel 250 kVA', '250 kVA Diesel Generator',
  'Grupo electrógeno diésel de 250 kVA con tablero de transferencia automática y cabina insonorizada.',
  '{"Potencia":"250 kVA","Voltaje":"380/220 V","Frecuencia":"60 Hz","Consumo":"48 L/h","Nivel de ruido":"75 dB"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Indutrial Desktop.png'], 1
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'montacargas-3ton', 'Montacargas 3 Toneladas', '3 Ton Forklift',
  'Montacargas diésel de 3 toneladas con torre de elevación de 3 m y desplazador lateral. Apto para operación en almacén y patio.',
  '{"Capacidad de carga":"3000 kg","Altura de elevación":"3 m","Tipo de motor":"Diésel","Tipo de transmisión":"Hidrodinámica","Peso operativo":"4200 kg"}'::jsonb,
  ARRAY['China','Japón'], ARRAY['/Desktop Home/Indutrial Desktop.png'], 2
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'compresor-tornillo-50hp', 'Compresor de Tornillo 50 HP', '50 HP Screw Compressor',
  'Compresor de tornillo rotativo de 50 HP con caudal de 7 m³/min y presión de 8 bar. Operación continua de bajo mantenimiento.',
  '{"Potencia":"50 HP","Caudal":"7 m³/min","Presión máxima":"8 bar","Voltaje":"380 V trifásico","Certificación IP":"IP54"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Indutrial Desktop.png'], 3
FROM categories WHERE slug = 'equipo-industrial'
ON CONFLICT (slug) DO NOTHING;

-- ---------- Spare Parts ----------
INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'filtro-aceite-universal', 'Filtro de Aceite Universal', 'Universal Oil Filter',
  'Filtro de aceite de alto flujo compatible con motores diésel de maquinaria agrícola y camiones. Vendido por lote.',
  '{"Tipo":"Roscado","Compatibilidad":"Diésel multimarca","Material":"Acero estampado","Presentación":"Caja x 50 unidades"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Repuestos Desktop.png'], 1
FROM categories WHERE slug = 'repuestos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'kit-embrague-tractor', 'Kit de Embrague para Tractor', 'Tractor Clutch Kit',
  'Kit de embrague completo para tractores de 70 a 120 HP. Incluye disco, plato y rodamiento de empuje.',
  '{"Aplicación":"Tractores 70-120 HP","Diámetro del disco":"310 mm","Incluye":"Disco, plato, rodamiento","Material":"Cerámico reforzado"}'::jsonb,
  ARRAY['China'], ARRAY['/Desktop Home/Repuestos Desktop.png'], 2
FROM categories WHERE slug = 'repuestos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, slug, name_es, name_en, description_es, specs, source_markets, images, sort_order)
SELECT id, 'neumatico-agricola-r1', 'Neumático Agrícola R1', 'R1 Agricultural Tire',
  'Neumático agrícola con dibujo R1 para alta tracción en campo. Medida 18.4-30, construcción diagonal.',
  '{"Medida":"18.4-30","Dibujo":"R1","Construcción":"Diagonal","Capas":"12 PR","Aplicación":"Tractores agrícolas"}'::jsonb,
  ARRAY['China','Tailandia'], ARRAY['/Desktop Home/Repuestos Desktop.png'], 3
FROM categories WHERE slug = 'repuestos'
ON CONFLICT (slug) DO NOTHING;
