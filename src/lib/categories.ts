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
  // ─── 1. AGRICULTURAL ──────────────────────────────────────────────────────
  {
    label: "Agricultural Machinery",
    shortLabel: "Agricultural",
    slug: "agricultural",
    href: "/agricultural",
    description: "Tractors, harvesters, balers, plows, and mowers from verified dealers across Europe.",
    subtypes: [
      { label: "Tractors",   href: "/agricultural/tractors",   count: "18,400", unsplashId: "photo-1598520106830-8c45c2035460", icon: "/icons/agricultural/row-crop-tractor.svg" },
      { label: "Harvesters", href: "/agricultural/harvesters", count: "6,200",  unsplashId: "photo-1464226184884-fa280b87c399", icon: "/icons/agricultural/combine-harvester.svg" },
      { label: "Balers",     href: "/agricultural/balers",     count: "3,800",  unsplashId: "photo-1416879595882-3373a0480b5b", icon: "/icons/agricultural/round-baler.svg" },
      { label: "Plows",      href: "/agricultural/plows",      count: "2,900",  unsplashId: "photo-1500382017468-9049fed747ef", icon: "/icons/agricultural/disc-plough.svg" },
      { label: "Mowers",     href: "/agricultural/mowers",     count: "3,200",  unsplashId: "photo-1416159090022-e9a4c6f0f35e", icon: "/icons/agricultural/mower.svg" },
      { label: "Grain Carts", href: "/agricultural/grain-carts", count: "1,400", unsplashId: "photo-1519003722824-194d4455a60c", icon: "/icons/agricultural/grain-cart.svg" },
      { label: "Seeder/Planters", href: "/agricultural/seeder-planters", count: "2,100", unsplashId: "photo-1500382017468-9049fed747ef", icon: "/icons/agricultural/seeder-planter.svg" },
      { label: "Sprayers",   href: "/agricultural/sprayers",   count: "1,800", unsplashId: "photo-1541888946425-d81bb19240f5", icon: "/icons/agricultural/sprayer.svg" },
    ],
  },

  // ─── 2. TRUCKS ────────────────────────────────────────────────────────────
  {
    label: "Trucks & Heavy Vehicles",
    shortLabel: "Trucks",
    slug: "trucks",
    href: "/trucks",
    description: "Tractor trucks, dump trucks, cargo, tanker, and refrigerated vehicles — new and used.",
    subtypes: [
      { label: "Tractor Truck (Day Cab)",     href: "/trucks/tractor-trucks-day",     count: "1,200", unsplashId: "photo-1601584115197-04ecc0da31d7", icon: "/icons/trucks/day-cab.svg" },
      { label: "Tractor Truck (Sleeper Cab)", href: "/trucks/tractor-trucks-sleeper", count: "3,000", unsplashId: "photo-1601584115197-04ecc0da31d7", icon: "/icons/trucks/sleeper-cab.svg" },
      { label: "Dump Truck (Rigid)",          href: "/trucks/dump-trucks-rigid",      count: "1,800", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/trucks/rigid-dump.svg" },
      { label: "Tipper Truck (Articulated)",  href: "/trucks/tipper-trucks-articulated", count: "1,300", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/trucks/articulated-tipper.svg" },
      { label: "Tanker Truck",                href: "/trucks/tanker-trucks",          count: "1,400", unsplashId: "photo-1558618666-fcd25c85cd64", icon: "/icons/trucks/tanker.svg" },
      { label: "Flatbed Truck",               href: "/trucks/flatbed-trucks",         count: "2,200", unsplashId: "photo-1519003722824-194d4455a60c", icon: "/icons/trucks/flatbed.svg" },
      { label: "Refrigerated Truck",          href: "/trucks/refrigerated-trucks",    count: "900",   unsplashId: "photo-1586528116311-ad8dd3c8310d", icon: "/icons/trucks/refrigerated.svg" },
      { label: "Car Carrier",                 href: "/trucks/car-carriers",           count: "600",   unsplashId: "photo-1519003722824-194d4455a60c", icon: "/icons/trucks/car-carrier.svg" },
    ],
  },

  // ─── 3. BUSES ─────────────────────────────────────────────────────────────
  {
    label: "Buses & Coaches",
    shortLabel: "Buses",
    slug: "buses",
    href: "/buses",
    description: "City buses, intercity coaches, minibuses, and school buses from European and Asian manufacturers.",
    subtypes: [
      { label: "City Bus (Low-Floor)",  href: "/buses/city-buses",          count: "2,100", unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/city-bus.svg" },
      { label: "Coach (Long Distance)", href: "/buses/coach-buses",         count: "1,800", unsplashId: "photo-1570125909232-eb263c188f7e", icon: "/icons/buses/coach.svg" },
      { label: "Minibus",               href: "/buses/minibuses",           count: "3,400", unsplashId: "photo-1464219789935-c2d9d9aba644", icon: "/icons/buses/minibus.svg" },
      { label: "School Bus",            href: "/buses/school-buses",        count: "900",   unsplashId: "photo-1520340356584-f9917d1eea6f", icon: "/icons/buses/school-bus.svg" },
      { label: "Double-Decker Bus",     href: "/buses/double-decker-buses", count: "400",   unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/double-decker.svg" },
      { label: "Articulated Bus",       href: "/buses/articulated-buses",   count: "300",   unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/articulated-bus.svg" },
      { label: "Airport Shuttle",       href: "/buses/airport-shuttles",     count: "250",   unsplashId: "photo-1464219789935-c2d9d9aba644", icon: "/icons/buses/airport-shuttle.svg" },
      { label: "Trolleybus",            href: "/buses/trolleybuses",        count: "150",   unsplashId: "photo-1544620347-c4fd4a3d5957", icon: "/icons/buses/trolleybus.svg" },
    ],
  },

  // ─── 4. CONSTRUCTION & INDUSTRIAL ─────────────────────────────────────────
  {
    label: "Construction & Industrial",
    shortLabel: "Industrial",
    slug: "industrial",
    href: "/industrial",
    description: "Forklifts, excavators, wheel loaders, cranes, bulldozers, and material-handling equipment.",
    subtypes: [
      { label: "Crawler Excavator",     href: "/industrial/crawler-excavators",     count: "5,200", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/industrial/crawler-excavator.svg" },
      { label: "Wheeled Excavator",     href: "/industrial/wheeled-excavators",     count: "4,500", unsplashId: "photo-1504307651254-35680f356dfd", icon: "/icons/industrial/wheeled-excavator.svg" },
      { label: "Telescopic Handler",    href: "/industrial/telehandlers",           count: "7,800", unsplashId: "photo-1574943320219-553eb213f72d", icon: "/icons/industrial/telehandler.svg" },
      { label: "Counterbalance Forklift", href: "/industrial/forklifts",           count: "3,200", unsplashId: "photo-1587293852726-70cdb56c2866", icon: "/icons/industrial/forklift.svg" },
      { label: "Reach Stacker",          href: "/industrial/reach-stackers",         count: "1,900", unsplashId: "photo-1587293852726-70cdb56c2866", icon: "/icons/industrial/reach-stacker.svg" },
      { label: "Bulldozer",              href: "/industrial/bulldozers",             count: "2,400", unsplashId: "photo-1541888946425-d81bb19240f5", icon: "/icons/industrial/bulldozer.svg" },
      { label: "Motor Grader",           href: "/industrial/motor-graders",          count: "800",   unsplashId: "photo-1541888946425-d81bb19240f5", icon: "/icons/industrial/motor-grader.svg" },
      { label: "Skid Steer Loader",      href: "/industrial/skid-steers",            count: "1,200", unsplashId: "photo-1558618666-fcd25c85cd64", icon: "/icons/industrial/skid-steer.svg" },
      { label: "Backhoe Loader",         href: "/industrial/backhoe-loaders",        count: "950",   unsplashId: "photo-1558618666-fcd25c85cd64", icon: "/icons/industrial/backhoe-loader.svg" },
      { label: "Tower Crane (Base Unit)", href: "/industrial/tower-cranes",          count: "1,100", unsplashId: "photo-1496307653780-42ee777d4833", icon: "/icons/industrial/tower-crane.svg" },
    ],
  },

  // ─── 5. SPARE PARTS ───────────────────────────────────────────────────────
  {
    label: "Spare Parts & Components",
    shortLabel: "Parts",
    slug: "spare-parts",
    href: "/spare-parts",
    description: "Genuine and aftermarket spare parts — used engines from Japan, new engines from China, transmissions, axles, and more.",
    subtypes: [
      { label: "Engine Block (Diesel)",   href: "/spare-parts/engines",        count: "3,800", unsplashId: "photo-1615906655593-ad0386982a0f", icon: "/icons/parts/engine-block.svg" },
      { label: "Gearbox/Transmission",    href: "/spare-parts/transmissions",  count: "2,200", unsplashId: "photo-1503376780353-7e6692767b70", icon: "/icons/parts/transmission.svg" },
      { label: "Drive Axle",              href: "/spare-parts/axles",          count: "1,600", unsplashId: "photo-1517524285303-d6fc683dddf8", icon: "/icons/parts/drive-axle.svg" },
      { label: "Differential Housing",    href: "/spare-parts/differentials",  count: "900",   unsplashId: "photo-1517524285303-d6fc683dddf8", icon: "/icons/parts/differential.svg" },
      { label: "Turbocharger",            href: "/spare-parts/turbochargers",  count: "1,200", unsplashId: "photo-1486262715619-67b85e0b08d3", icon: "/icons/parts/turbocharger.svg" },
      { label: "Radiator",                href: "/spare-parts/radiators",      count: "850",   unsplashId: "photo-1486262715619-67b85e0b08d3", icon: "/icons/parts/radiator.svg" },
      { label: "Fuel Injection Pump",     href: "/spare-parts/fuel-pumps",     count: "1,100", unsplashId: "photo-1486262715619-67b85e0b08d3", icon: "/icons/parts/fuel-pump.svg" },
      { label: "Leaf Spring Pack",        href: "/spare-parts/leaf-springs",    count: "1,400", unsplashId: "photo-1517524285303-d6fc683dddf8", icon: "/icons/parts/leaf-spring.svg" },
      { label: "Wheel Hub & Brake Drum",  href: "/spare-parts/wheel-hubs",     count: "2,100", unsplashId: "photo-1503376780353-7e6692767b70", icon: "/icons/parts/wheel-hub.svg" },
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
