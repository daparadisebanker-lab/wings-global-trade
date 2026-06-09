export type SubType = {
  label: string;
  href: string;
  count: string;
  unsplashId: string;
  icon?: string;
  comingSoon?: boolean;
};

export type Category = {
  label: string;
  shortLabel: string;
  slug: string;
  href: string;
  description: string;
  subtypes: SubType[];
};

export const CATEGORIES: Category[] = [
  // ─── 1. MAQUINARIA AGRÍCOLA ───────────────────────────────────────────────
  {
    label: "Maquinaria Agrícola",
    shortLabel: "Agrícola",
    slug: "agricultural",
    href: "/agricultural",
    description: "Tractores, cosechadoras, empacadoras, arados y segadoras de fabricantes verificados en Asia.",
    subtypes: [
      { label: "Tractores",         href: "/agricultural/tractors",         count: "34",     unsplashId: "photo-1598520106830-8c45c2035460", icon: "/icons/agricultural/row-crop-tractor.svg" },
      { label: "Cosechadoras",      href: "/agricultural/harvesters",       count: "6,200",  unsplashId: "photo-1464226184884-fa280b87c399", icon: "/icons/agricultural/combine-harvester.svg",   comingSoon: true },
      { label: "Empacadoras",       href: "/agricultural/balers",           count: "3,800",  unsplashId: "photo-1416879595882-3373a0480b5b", icon: "/icons/agricultural/round-baler.svg",          comingSoon: true },
      { label: "Arados",            href: "/agricultural/plows",            count: "2,900",  unsplashId: "photo-1500382017468-9049fed747ef", icon: "/icons/agricultural/disc-plough.svg",          comingSoon: true },
      { label: "Segadoras",         href: "/agricultural/mowers",           count: "3,200",  unsplashId: "photo-1416159090022-e9a4c6f0f35e", icon: "/icons/agricultural/mower.svg",                comingSoon: true },
      { label: "Carros de Grano",   href: "/agricultural/grain-carts",      count: "1,400",  unsplashId: "photo-1519003722824-194d4455a60c", icon: "/icons/agricultural/grain-cart.svg",           comingSoon: true },
      { label: "Sembradoras",       href: "/agricultural/seeder-planters",  count: "2,100",  unsplashId: "photo-1500382017468-9049fed747ef", icon: "/icons/agricultural/seeder-planter.svg",       comingSoon: true },
      { label: "Pulverizadoras",    href: "/agricultural/sprayers",         count: "1,800",  unsplashId: "photo-1541888946425-d81bb19240f5", icon: "/icons/agricultural/sprayer.svg",              comingSoon: true },
    ],
  },

  // ─── 2. CAMIONES Y VEHÍCULOS PESADOS ─────────────────────────────────────
  {
    label: "Camiones y Vehículos Pesados",
    shortLabel: "Camiones",
    slug: "trucks",
    href: "/trucks",
    description: "27 modelos KAMA disponibles — camiones de combustión y eléctricos (BEV) con precio landed total para toda Latinoamérica.",
    subtypes: [
      { label: "Camiones KAMA — Catálogo activo", href: "/camiones", count: "27", unsplashId: "photo-1601584115197-04ecc0da31d7", icon: "/icons/trucks/day-cab.svg" },
      { label: "Ver por serie (9 series)", href: "/brands/kama", count: "9 series", unsplashId: "photo-1601584115197-04ecc0da31d7", icon: "/icons/trucks/sleeper-cab.svg" },
      { label: "Camión Tractor (Cabina Simple)",     href: "/trucks/tractor-trucks-day",        count: "1,200", unsplashId: "photo-1601584115197-04ecc0da31d7", icon: "/icons/trucks/day-cab.svg",               comingSoon: true },
      { label: "Camión Tractor (Cabina Dormitorio)", href: "/trucks/tractor-trucks-sleeper",    count: "3,000", unsplashId: "photo-1601584115197-04ecc0da31d7", icon: "/icons/trucks/sleeper-cab.svg",            comingSoon: true },
      { label: "Volquete (Rígido)",                  href: "/trucks/dump-trucks-rigid",         count: "1,800", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/trucks/rigid-dump.svg",             comingSoon: true },
      { label: "Volquete (Articulado)",              href: "/trucks/tipper-trucks-articulated", count: "1,300", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/trucks/articulated-tipper.svg",     comingSoon: true },
      { label: "Camión Cisterna",                    href: "/trucks/tanker-trucks",             count: "1,400", unsplashId: "photo-1558618666-fcd25c85cd64", icon: "/icons/trucks/tanker.svg",                   comingSoon: true },
      { label: "Camión Plataforma",                  href: "/trucks/flatbed-trucks",            count: "2,200", unsplashId: "photo-1519003722824-194d4455a60c", icon: "/icons/trucks/flatbed.svg",                comingSoon: true },
      { label: "Camión Refrigerado",                 href: "/trucks/refrigerated-trucks",       count: "900",   unsplashId: "photo-1586528116311-ad8dd3c8310d", icon: "/icons/trucks/refrigerated.svg",           comingSoon: true },
      { label: "Transportador de Autos",             href: "/trucks/car-carriers",              count: "600",   unsplashId: "photo-1519003722824-194d4455a60c", icon: "/icons/trucks/car-carrier.svg",            comingSoon: true },
    ],
  },

  // ─── 3. BUSES Y AUTOCARES ─────────────────────────────────────────────────
  {
    label: "Buses y Autocares",
    shortLabel: "Buses",
    slug: "buses",
    href: "/buses",
    description: "Buses urbanos, autocares interurbanos, minibuses y buses escolares de fabricantes asiáticos.",
    subtypes: [
      { label: "Bus Urbano (Piso Bajo)",    href: "/buses/city-buses",          count: "2,100", unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/city-bus.svg",          comingSoon: true },
      { label: "Autocar (Larga Distancia)", href: "/buses/coach-buses",         count: "1,800", unsplashId: "photo-1570125909232-eb263c188f7e", icon: "/icons/buses/coach.svg",           comingSoon: true },
      { label: "Minibús",                   href: "/buses/minibuses",           count: "3,400", unsplashId: "photo-1464219789935-c2d9d9aba644", icon: "/icons/buses/minibus.svg",          comingSoon: true },
      { label: "Bus Escolar",               href: "/buses/school-buses",        count: "900",   unsplashId: "photo-1520340356584-f9917d1eea6f", icon: "/icons/buses/school-bus.svg",       comingSoon: true },
      { label: "Bus de Dos Pisos",          href: "/buses/double-decker-buses", count: "400",   unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/double-decker.svg",       comingSoon: true },
      { label: "Bus Articulado",            href: "/buses/articulated-buses",   count: "300",   unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/articulated-bus.svg",     comingSoon: true },
      { label: "Shuttle Aeropuerto",        href: "/buses/airport-shuttles",    count: "250",   unsplashId: "photo-1464219789935-c2d9d9aba644", icon: "/icons/buses/airport-shuttle.svg",  comingSoon: true },
      { label: "Trolebús",                 href: "/buses/trolleybuses",        count: "150",   unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/trolleybus.svg",           comingSoon: true },
    ],
  },

  // ─── 4. CONSTRUCCIÓN E INDUSTRIAL ─────────────────────────────────────────
  {
    label: "Construcción e Industrial",
    shortLabel: "Industrial",
    slug: "industrial",
    href: "/industrial",
    description: "Montacargas, excavadoras, cargadoras, grúas, topadoras y equipos de manejo de materiales.",
    subtypes: [
      { label: "Excavadora de Orugas",         href: "/industrial/crawler-excavators",  count: "5,200", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/industrial/crawler-excavator.svg",  comingSoon: true },
      { label: "Excavadora sobre Ruedas",      href: "/industrial/wheeled-excavators",  count: "4,500", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/industrial/wheeled-excavator.svg",  comingSoon: true },
      { label: "Manipulador Telescópico",      href: "/industrial/telehandlers",        count: "7,800", unsplashId: "photo-1574943320219-553eb213f72d", icon: "/icons/industrial/telehandler.svg",         comingSoon: true },
      { label: "Montacargas Contrapesado",     href: "/industrial/forklifts",           count: "3,200", unsplashId: "photo-1587293852726-70cdb56c2866", icon: "/icons/industrial/forklift.svg",            comingSoon: true },
      { label: "Reach Stacker",                href: "/industrial/reach-stackers",      count: "1,900", unsplashId: "photo-1587293852726-70cdb56c2866", icon: "/icons/industrial/reach-stacker.svg",       comingSoon: true },
      { label: "Topadora",                     href: "/industrial/bulldozers",          count: "2,400", unsplashId: "photo-1541888946425-d81bb19240f5", icon: "/icons/industrial/bulldozer.svg",           comingSoon: true },
      { label: "Motoniveladora",               href: "/industrial/motor-graders",       count: "800",   unsplashId: "photo-1541888946425-d81bb19240f5", icon: "/icons/industrial/motor-grader.svg",        comingSoon: true },
      { label: "Minicargadora",                href: "/industrial/skid-steers",         count: "1,200", unsplashId: "photo-1558618666-fcd25c85cd64", icon: "/icons/industrial/skid-steer.svg",             comingSoon: true },
      { label: "Retroexcavadora",              href: "/industrial/backhoe-loaders",     count: "950",   unsplashId: "photo-1558618666-fcd25c85cd64", icon: "/icons/industrial/backhoe-loader.svg",         comingSoon: true },
      { label: "Grúa Torre",                  href: "/industrial/tower-cranes",        count: "1,100", unsplashId: "photo-1496307653780-42ee777d4833", icon: "/icons/industrial/tower-crane.svg",           comingSoon: true },
    ],
  },

  // ─── 5. REPUESTOS Y COMPONENTES ───────────────────────────────────────────
  {
    label: "Repuestos y Componentes",
    shortLabel: "Repuestos",
    slug: "spare-parts",
    href: "/spare-parts",
    description: "Repuestos originales y alternativos — motores usados de Japón, nuevos de China, cajas, ejes y más.",
    subtypes: [
      { label: "Bloque de Motor (Diésel)",       href: "/spare-parts/engines",        count: "3,800", unsplashId: "photo-1615906655593-ad0386982a0f", icon: "/icons/parts/engine-block.svg",   comingSoon: true },
      { label: "Caja de Cambios / Transmisión",  href: "/spare-parts/transmissions",  count: "2,200", unsplashId: "photo-1503376780353-7e6692767b70", icon: "/icons/parts/transmission.svg",   comingSoon: true },
      { label: "Eje Motriz",                     href: "/spare-parts/axles",          count: "1,600", unsplashId: "photo-1517524285303-d6fc683dddf8", icon: "/icons/parts/drive-axle.svg",     comingSoon: true },
      { label: "Carcasa de Diferencial",         href: "/spare-parts/differentials",  count: "900",   unsplashId: "photo-1517524285303-d6fc683dddf8", icon: "/icons/parts/differential.svg",   comingSoon: true },
      { label: "Turbocompresor",                 href: "/spare-parts/turbochargers",  count: "1,200", unsplashId: "photo-1486262715619-67b85e0b08d3", icon: "/icons/parts/turbocharger.svg",   comingSoon: true },
      { label: "Radiador",                       href: "/spare-parts/radiators",      count: "850",   unsplashId: "photo-1486262715619-67b85e0b08d3", icon: "/icons/parts/radiator.svg",       comingSoon: true },
      { label: "Bomba de Inyección",             href: "/spare-parts/fuel-pumps",     count: "1,100", unsplashId: "photo-1486262715619-67b85e0b08d3", icon: "/icons/parts/fuel-pump.svg",      comingSoon: true },
      { label: "Juego de Ballesta",              href: "/spare-parts/leaf-springs",   count: "1,400", unsplashId: "photo-1517524285303-d6fc683dddf8", icon: "/icons/parts/leaf-spring.svg",    comingSoon: true },
      { label: "Cubo de Rueda y Tambor",         href: "/spare-parts/wheel-hubs",     count: "2,100", unsplashId: "photo-1503376780353-7e6692767b70", icon: "/icons/parts/wheel-hub.svg",      comingSoon: true },
    ],
  },
];

// ─── DERIVED HELPERS ─────────────────────────────────────────────────────────

/** Flat list of ALL active (non-coming-soon) sub-types across all categories */
export const ALL_SUBTYPES = CATEGORIES.flatMap((c) =>
  c.subtypes.filter((s) => !s.comingSoon)
);

/** Flat list of all active sub-types for homepage grid */
export const FEATURED_SUBTYPES = CATEGORIES.flatMap((c) =>
  c.subtypes.filter((s) => !s.comingSoon)
);
