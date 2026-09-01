// data/automoviles-catalog.ts
//
// Canonical brand/model roster for the Automóviles category. The original
// 76 configured trims across 31 model lines and 11 brands were sourced from
// the fleet costing sheet (Costeo SUNAT — Wings Global Trade, 2026-08-14).
// Landed cost, FOB and margin figures live in Rowe, not here — this file
// carries only the specs a buyer needs to shortlist a model before
// requesting a quote.
//
// Specs are basic/reference-level (segment, engine, transmission, traction,
// seats) researched per nameplate. Exact configuration depends on the unit
// Wings has landed — confirm final spec at RFQ. Photography landed for 11
// nameplates 2026-08-31 (see programs/automobiles/SCOPE.md §0j/§0m) — each
// carries a two-image pair, `[heroUrl, cardCutoutUrl]`: index 0 is the
// white-background studio hero (ProductGallery, OG image, comparison tool),
// index 1 is the transparent-background cutout the automóviles card
// breakout treatment (MotionCard) requires. Four of those 11 (Changan New
// CS75 Plus, Changan CS75 Pro, Changan X5 Plus, Hyundai Sonata) were also
// new nameplates as of that date — not in the original 31-line Rowe sheet
// import, added from photography the account owner supplied plus specs
// researched from official importer sites / manufacturer sources (flagged
// per-entry where a name/spec is approximate) rather than fabricated; still
// pending confirmation against Rowe. The remaining lines still ship
// typography-and-spec-led, the same interim launch mode WGT/02 used.

export interface CarModel {
  id: string
  brand: string
  model: string
  segment: string
  engine: string
  fuel: ('gasolina' | 'hibrido')[]
  transmission: string
  traction: string
  seats: number
  trims: string[]
  description: string
  images: string[]
}

// ─── Toyota ────────────────────────────────────────────────────────────────

export const TOYOTA_MODELS: CarModel[] = [
  {
    id: "toyota-camry",
    brand: "Toyota",
    model: "Camry",
    segment: "Sedán ejecutivo",
    engine: "2.0 / 2.5 / 2.5 híbrido",
    fuel: ["gasolina", "hibrido"],
    transmission: "Automática / e-CVT",
    traction: "Delantera",
    seats: 5,
    trims: ["2.0 Elite", "2.0 Sport", "2.5 Flagship", "2.5 Premium", "Hybrid 2.5 Premium", "Hybrid 2.5 Sport PLUS"],
    description: "Sedán ejecutivo de referencia de Toyota, con versiones a gasolina 2.0/2.5 y versiones híbridas 2.5 de mayor eficiencia.",
    images: ["/images/listings/toyota-camry/hero.png", "/images/listings/toyota-camry/card.png"],
  },
  {
    id: "toyota-corolla",
    brand: "Toyota",
    model: "Corolla",
    segment: "Sedán compacto",
    engine: "1.2T / 1.8 híbrido",
    fuel: ["gasolina", "hibrido"],
    transmission: "CVT / E-CVT",
    traction: "Delantera",
    seats: 5,
    trims: ["1.2T S-CVT Pioneer Edition", "Smart Hybrid Dual Engine 1.8L E-CVT Elite Edition", "Smart Hybrid Dual Engine 1.8L E-CVT Pioneer Edition"],
    description: "Sedán compacto de mayor volumen de ventas de Toyota, con versión turbo 1.2T y versión híbrida de doble motor 1.8L.",
    images: ["/images/listings/toyota-corolla/hero.png", "/images/listings/toyota-corolla/card.png"],
  },
  {
    id: "toyota-corolla-cross",
    brand: "Toyota",
    model: "Corolla Cross",
    segment: "SUV compacto",
    engine: "2.0",
    fuel: ["gasolina", "hibrido"],
    transmission: "CVT",
    traction: "Delantera",
    seats: 5,
    trims: ["2.0L CVT Elite Edition", "2.0L CVT Luxury Edition", "2.0L CVT Pioneer Edition", "2.0L Intelligent Hybrid Elite Edition", "2.0L Intelligent Hybrid Pioneer Edition"],
    description: "SUV compacto basado en la plataforma Corolla, con versiones a gasolina y versiones Intelligent Hybrid.",
    images: [],
  },
  {
    id: "toyota-rav4",
    brand: "Toyota",
    model: "RAV4",
    segment: "SUV mediano",
    engine: "2.0 / 2.5 híbrido",
    fuel: ["gasolina", "hibrido"],
    transmission: "Automática / e-CVT",
    traction: "Integral AWD (2WD en versiones híbridas de entrada)",
    seats: 5,
    trims: ["2.0L AWD Luxury Edition", "Hybrid Dual Turbo 2.5L 4WD Flagship Edition", "Hybrid Twin Turbo 2.0L 2WD Deluxe Edition", "Hybrid Twin Turbo 2.0L 2WD Elite Edition", "Hybrid Twin Turbo 2.5L 4WD Deluxe Edition"],
    description: "SUV mediano insignia de Toyota, con versión a gasolina AWD y versiones híbridas de dos y cuatro ruedas motrices.",
    images: ["/images/listings/toyota-rav4/hero.png", "/images/listings/toyota-rav4/card.png"],
  },
  {
    id: "toyota-prado",
    brand: "Toyota",
    model: "Prado",
    segment: "SUV todoterreno grande",
    engine: "2.4T híbrido",
    fuel: ["hibrido"],
    transmission: "Automática",
    traction: "Integral 4x4",
    seats: 5,
    trims: ["2.4T Hybrid Flagship VX · 5 plazas"],
    description: "SUV todoterreno de chasis robusto, motor 2.4T híbrido y tracción integral 4x4, acabado tope de gama Flagship VX.",
    images: ["/images/listings/toyota-prado/hero.png", "/images/listings/toyota-prado/card.png"],
  },
]

// ─── Jetour ────────────────────────────────────────────────────────────────

export const JETOUR_MODELS: CarModel[] = [
  {
    id: "jetour-dasheng",
    brand: "Jetour",
    model: "Dasheng",
    segment: "SUV compacto",
    engine: "1.5T DCT",
    fuel: ["gasolina"],
    transmission: "DCT",
    traction: "Delantera",
    seats: 5,
    trims: ["Black Warrior", "Flagship", "Luxury", "Youth Elite", "Youth Luxury"],
    description: "SUV compacto de Jetour (conocido internacionalmente como Jetour Dashing), motor 1.5T de 197 HP y caja DCT automática. Cinco acabados dentro de la línea.",
    images: [],
  },
  {
    id: "jetour-traveler",
    brand: "Jetour",
    model: "Traveler",
    segment: "SUV todoterreno mediano",
    engine: "1.5T / 2.0T",
    fuel: ["gasolina"],
    transmission: "Automática 8 velocidades",
    traction: "Integral (XWD) en versiones 2.0T",
    seats: 5,
    trims: ["1.5TD Explore+", "2.0TD XWD Conqueror", "2.0TD XWD Crossover", "2.0TD XWD Discovery", "Pony Edition 2.0TD XWD Crossover", "Pony Edition 2.0TD XWD Discovery"],
    description: "SUV todoterreno de diseño robusto tipo utilitario, con versiones 1.5T de tracción delantera y 2.0T con tracción integral XWD. Configuración de 5 o 7 plazas según mercado.",
    images: ["/images/listings/jetour-traveler/hero.png", "/images/listings/jetour-traveler/card.png"],
  },
  {
    id: "jetour-x70l",
    brand: "Jetour",
    model: "X70L",
    segment: "SUV mediano 7 plazas",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera",
    seats: 7,
    trims: ["Comfort · 7 plazas", "Luxury · 7 plazas"],
    description: "SUV mediano de tres filas, motor 1.5T con caja DCT de 7 velocidades.",
    images: ["/images/listings/jetour-x70l/hero.png", "/images/listings/jetour-x70l/card.png"],
  },
  {
    id: "jetour-x70plus",
    brand: "Jetour",
    model: "X70Plus",
    segment: "SUV mediano",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "DCT 6 velocidades",
    traction: "Delantera",
    seats: 5,
    trims: ["Comfort", "Luxury"],
    description: "SUV mediano de cinco plazas, motor 1.5T con caja DCT de 6 velocidades.",
    images: ["/images/listings/jetour-x70plus/hero.png", "/images/listings/jetour-x70plus/card.png"],
  },
]

// ─── KIA ───────────────────────────────────────────────────────────────────

export const KIA_MODELS: CarModel[] = [
  {
    id: "kia-k3",
    brand: "KIA",
    model: "K3",
    segment: "Sedán compacto",
    engine: "1.5L",
    fuel: ["gasolina"],
    transmission: "Automática / CVT",
    traction: "Delantera",
    seats: 5,
    trims: ["Comfort", "Luxury"],
    description: "Sedán compacto de volumen (Kia Yueda), motor 1.5L atmosférico.",
    images: [],
  },
  {
    id: "kia-kx1",
    brand: "KIA",
    model: "KX1",
    segment: "Crossover subcompacto",
    engine: "1.4L",
    fuel: ["gasolina"],
    transmission: "CVT",
    traction: "Delantera",
    seats: 5,
    trims: ["1.4L CVT Sunroof"],
    description: "Crossover urbano de entrada, motor 1.4L de 100 HP y caja CVT, exclusivo del mercado chino.",
    images: [],
  },
  {
    id: "kia-seltos",
    brand: "KIA",
    model: "Seltos",
    segment: "SUV compacto",
    engine: "1.5L",
    fuel: ["gasolina"],
    transmission: "CVT / Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["Comfort", "Luxury", "Luxury + techo negro", "Premium"],
    description: "SUV compacto de mayor volumen de la marca, motor 1.5L. Techo bicolor disponible en el acabado Luxury.",
    images: [],
  },
  {
    id: "kia-sportage",
    brand: "KIA",
    model: "Sportage",
    segment: "SUV compacto",
    engine: "1.5T / 2.0T",
    fuel: ["gasolina"],
    transmission: "DCT / Automática",
    traction: "Delantera (4WD en versión 2.0T)",
    seats: 5,
    trims: ["1.5T Smart Premium", "1.5T Two-wheels Luxury", "1.5T Two-wheels Luxury Comfort", "1.5T Two-wheels Premium", "2.0T Four-wheels Premium"],
    description: "SUV compacto insignia de KIA en el segmento C, con versiones 1.5T de tracción simple y 2.0T con tracción integral.",
    images: [],
  },
]

// ─── Audi ──────────────────────────────────────────────────────────────────

export const AUDI_MODELS: CarModel[] = [
  {
    id: "audi-a3-sportback",
    brand: "Audi",
    model: "A3 Sportback",
    segment: "Hatchback premium",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera",
    seats: 5,
    trims: ["35TFSI Sportback Premium", "35TFSI Sportback Prestige Luxury"],
    description: "Hatchback premium de acceso a la gama Audi, motor 1.5T y caja doble embrague. Producción de la joint venture china para el mercado de exportación.",
    images: [],
  },
  {
    id: "audi-a5l",
    brand: "Audi",
    model: "A5L",
    segment: "Sedán ejecutivo",
    engine: "2.0T EA888",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera (4WD quattro opcional)",
    seats: 5,
    trims: ["2.0 Sport"],
    description: "Versión sedán de batalla larga del A5, exclusiva del mercado chino (SAIC-Audi), sucesora del A4L. Motor 2.0 TFSI de 201 HP.",
    images: [],
  },
  {
    id: "audi-a7l",
    brand: "Audi",
    model: "A7L",
    segment: "Sedán ejecutivo grand tourer",
    engine: "2.0T",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera (quattro en versiones superiores)",
    seats: 5,
    trims: ["45TFSI Luxury"],
    description: "Berlina de cuatro puertas de techo fastback y batalla extendida, producción SAIC-Audi exclusiva para China. Versión 45TFSI con el 2.0T de 245 HP.",
    images: [],
  },
  {
    id: "audi-e5-sportback",
    brand: "Audi",
    model: "E5 Sportback",
    segment: "Fastback ejecutivo",
    engine: "2.0",
    fuel: ["gasolina"],
    transmission: "Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["Pioneer"],
    description: "Fastback de cuatro puertas de la gama AUDI para el mercado chino. Especificación registrada en el costeo como motor 2.0 a gasolina — confirmar contra la ficha del proveedor, dado que la nomenclatura E5 corresponde a la subserie eléctrica de Audi en otros catálogos.",
    images: [],
  },
  {
    id: "audi-e7x",
    brand: "Audi",
    model: "E7X",
    segment: "Sedán ejecutivo grand tourer",
    engine: "2.0",
    fuel: ["gasolina"],
    transmission: "Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["Pioneer Pro"],
    description: "Buque insignia de cuatro puertas de la gama AUDI para el mercado chino. Especificación registrada en el costeo como motor 2.0 a gasolina — confirmar contra la ficha del proveedor, misma nota que E5 Sportback.",
    images: [],
  },
  {
    id: "audi-q3",
    brand: "Audi",
    model: "Q3",
    segment: "SUV compacto premium",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera",
    seats: 5,
    trims: ["35TFSI Style"],
    description: "SUV compacto de entrada a la gama Audi, motor 1.5T y caja doble embrague.",
    images: [],
  },
  {
    id: "audi-q5",
    brand: "Audi",
    model: "Q5",
    segment: "SUV mediano premium",
    engine: "2.0T",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera (quattro disponible)",
    seats: 5,
    trims: ["40TFSI Commemorative Edition", "45 Anniversary Collectible Edition"],
    description: "SUV mediano de referencia de Audi, motor 2.0T. Ediciones conmemorativas de aniversario dentro de la gama.",
    images: [],
  },
]

// ─── BMW ───────────────────────────────────────────────────────────────────

export const BMW_MODELS: CarModel[] = [
  {
    id: "bmw-serie-3-325li",
    brand: "BMW",
    model: "Serie 3 (325Li)",
    segment: "Sedán ejecutivo de batalla larga",
    engine: "2.0T",
    fuel: ["gasolina"],
    transmission: "Automática 8 velocidades",
    traction: "Trasera",
    seats: 5,
    trims: ["325Li"],
    description: "Versión de batalla larga del Serie 3 (G20), exclusiva del mercado chino, producida por BMW Brilliance. Motor 2.0T de 184 HP con propulsión trasera.",
    images: [],
  },
  {
    id: "bmw-x1",
    brand: "BMW",
    model: "X1",
    segment: "SUV compacto premium",
    engine: "2.0T",
    fuel: ["gasolina"],
    transmission: "Automática",
    traction: "Delantera (xDrive disponible)",
    seats: 5,
    trims: ["Sport"],
    description: "SUV compacto de entrada a la gama BMW, motor 2.0T.",
    images: [],
  },
  {
    id: "bmw-x3",
    brand: "BMW",
    model: "X3",
    segment: "SUV mediano premium",
    engine: "2.0T",
    fuel: ["gasolina"],
    transmission: "Automática 8 velocidades",
    traction: "Integral xDrive",
    seats: 5,
    trims: ["30L Xdrive Leading SportNight Package", "30L Xdrive Premium SportNight Package"],
    description: "SUV mediano de batalla larga (30L) para el mercado chino, tracción integral xDrive y paquete estético SportNight.",
    images: [],
  },
]

// ─── Hyundai ───────────────────────────────────────────────────────────────

export const HYUNDAI_MODELS: CarModel[] = [
  {
    id: "hyundai-sonata",
    brand: "Hyundai",
    model: "Sonata",
    segment: "Sedán ejecutivo",
    engine: "1.5T / 2.0T",
    fuel: ["gasolina"],
    transmission: "Automática 8 velocidades",
    traction: "Delantera",
    seats: 5,
    trims: ["1.5T GLX Elite Edition", "2.0T GLX Premium Edition"],
    description: "Sedán ejecutivo de 11ª generación de Beijing-Hyundai (mercado chino), motor 1.5T o 2.0T y caja automática de 8 velocidades. Nomenclatura de versiones aproximada — confirmar contra la ficha del proveedor antes de RFQ, mismo criterio ya usado en este catálogo para Audi E5 Sportback / E7X.",
    images: ["/images/listings/hyundai-sonata/hero.png", "/images/listings/hyundai-sonata/card.png"],
  },
  {
    id: "hyundai-elantra",
    brand: "Hyundai",
    model: "Elantra",
    segment: "Sedán compacto",
    engine: "1.5L",
    fuel: ["gasolina"],
    transmission: "CVT",
    traction: "Delantera",
    seats: 5,
    trims: ["1.5L CVT GLX Elite Edition", "1.5L CVT GLX Luxury Edition"],
    description: "Sedán compacto de volumen, motor 1.5L atmosférico y caja CVT.",
    images: [],
  },
  {
    id: "hyundai-ix35",
    brand: "Hyundai",
    model: "ix35",
    segment: "SUV compacto",
    engine: "2.0L",
    fuel: ["gasolina"],
    transmission: "Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["2.0L Luxury Edition DLX"],
    description: "SUV compacto de producción China (Beijing-Hyundai), nameplate que se mantiene en el mercado chino en paralelo al Tucson.",
    images: [],
  },
  {
    id: "hyundai-tucson",
    brand: "Hyundai",
    model: "Tucson",
    segment: "SUV compacto",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "DCT / Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["L 1.5T GLX Elite Edition N-Line"],
    description: "SUV compacto de batalla larga (L) para el mercado chino, motor 1.5T y acabado deportivo N-Line.",
    images: [],
  },
]

// ─── Mercedes-Benz ─────────────────────────────────────────────────────────

export const MERCEDES_BENZ_MODELS: CarModel[] = [
  {
    id: "mercedes-benz-clase-c",
    brand: "Mercedes-Benz",
    model: "Clase C",
    segment: "Sedán ejecutivo de batalla larga",
    engine: "1.5T / 2.0T",
    fuel: ["gasolina"],
    transmission: "Automática 9G-Tronic",
    traction: "Trasera",
    seats: 5,
    trims: ["C200L Sport Sedan", "C260L Classical Sport Sedan", "C260L Sedan"],
    description: "Sedán ejecutivo de batalla larga (L) para el mercado chino (BBAC), motor 1.5T mild-hybrid en C200L y 2.0T en C260L.",
    images: [],
  },
]

// ─── Star 5 ────────────────────────────────────────────────────────────────

export const STAR_5_MODELS: CarModel[] = [
  {
    id: "star-5-star-5",
    brand: "Star 5",
    model: "Star 5",
    segment: "Compacto urbano",
    engine: "1.5L",
    fuel: ["gasolina"],
    transmission: "Manual / Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["Classic Edition", "Classic Edition (A/C)", "Value Edition"],
    description: "Nameplate compacto urbano del grupo Changan (Star 5), motor 1.5L de acceso, orientado a flotas y uso urbano intensivo.",
    images: [],
  },
]

// ─── MG ────────────────────────────────────────────────────────────────────

export const MG_MODELS: CarModel[] = [
  {
    id: "mg-mg5",
    brand: "MG",
    model: "MG5",
    segment: "Sedán deportivo compacto",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["Flagship", "Flagship Max"],
    description: "Sedán compacto de posicionamiento deportivo, motor 1.5T turboalimentado.",
    images: [],
  },
]

// ─── Changan ───────────────────────────────────────────────────────────────

export const CHANGAN_MODELS: CarModel[] = [
  {
    id: "changan-new-cs75-plus",
    brand: "Changan",
    model: "New CS75 Plus",
    segment: "SUV compacto",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "Automática",
    traction: "Delantera",
    seats: 5,
    trims: ["Flagship 1.5 AT", "Signature 1.5 AT"],
    description: "SUV compacto insignia de la gama Changan, motor 1.5T Blue Whale (178 HP / 280 N·m) y caja automática. Nombre y especificaciones confirmados contra el sitio oficial del importador Changan en Perú (changan.com.pe).",
    images: ["/images/listings/changan-new-cs75-plus/hero.png", "/images/listings/changan-new-cs75-plus/card.png"],
  },
  {
    id: "changan-cs75-pro",
    brand: "Changan",
    model: "CS75 Pro",
    segment: "SUV mediano 7 plazas",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "Manual 6 velocidades / DCT 7 velocidades",
    traction: "Delantera (4x2)",
    seats: 7,
    trims: ["Luxury 1.5 MT 4x2", "Luxury 1.5 AT 4x2", "Limited 1.5 MT 4x2", "Limited 1.5 AT 4x2"],
    description: "SUV de tres filas y 7 plazas, motor 1.5T (185 HP / 300 N·m), disponible con caja manual de 6 velocidades o DCT de 7 velocidades. La nomenclatura \"CS75 Pro\" corresponde al mercado de exportación; el importador oficial de Changan en Perú comercializa la misma plataforma como \"X7 Plus\" — confirmar la correspondencia exacta contra la ficha del proveedor antes de RFQ.",
    images: ["/images/listings/changan-cs75-pro/hero.png", "/images/listings/changan-cs75-pro/card.png"],
  },
  {
    id: "changan-x5-plus",
    brand: "Changan",
    model: "X5 Plus",
    segment: "SUV compacto",
    engine: "1.5T",
    fuel: ["gasolina"],
    transmission: "DCT 7 velocidades",
    traction: "Delantera",
    seats: 5,
    trims: ["1.5T DCT 188 HP"],
    description: "SUV compacto de la familia Changan X, motor Blue Whale NE1.5T (188 HP / 300 N·m) y caja DCT húmeda de 7 velocidades. No comercializado por el importador oficial de Changan en Perú — unidad de abastecimiento directo desde China; nomenclatura de versión pendiente de confirmar contra la ficha del proveedor.",
    images: ["/images/listings/changan-x5-plus/hero.png", "/images/listings/changan-x5-plus/card.png"],
  },
  {
    id: "changan-m60",
    brand: "Changan",
    model: "M60",
    segment: "Furgoneta / MPV comercial",
    engine: "1.5L",
    fuel: ["gasolina"],
    transmission: "Manual 5 velocidades",
    traction: "Trasera (motor central)",
    seats: 11,
    trims: ["11 plazas"],
    description: "MPV comercial de configuración flexible (Changan Ruixing/Kaicene M60), motor 1.5L. Versión de la ficha de costeo con capacidad de 11 plazas.",
    images: [],
  },
]

// ─── Wuling ────────────────────────────────────────────────────────────────

export const WULING_MODELS: CarModel[] = [
  {
    id: "wuling-hongguang-v",
    brand: "Wuling",
    model: "Hongguang V",
    segment: "Furgoneta / minivan comercial",
    engine: "1.5L",
    fuel: ["gasolina"],
    transmission: "Manual 5 velocidades",
    traction: "Trasera",
    seats: 8,
    trims: ["Panel Van 1.5L · 8 plazas"],
    description: "Furgoneta comercial de puertas correderas, motor 1.5L, configurable como van de carga o minivan de hasta 8 plazas.",
    images: [],
  },
]

// ─── Aggregates ────────────────────────────────────────────────────────────

export const MODELS_BY_BRAND: Record<string, CarModel[]> = {
  "Toyota": TOYOTA_MODELS,
  "Jetour": JETOUR_MODELS,
  "KIA": KIA_MODELS,
  "Audi": AUDI_MODELS,
  "BMW": BMW_MODELS,
  "Hyundai": HYUNDAI_MODELS,
  "Mercedes-Benz": MERCEDES_BENZ_MODELS,
  "Star 5": STAR_5_MODELS,
  "MG": MG_MODELS,
  "Changan": CHANGAN_MODELS,
  "Wuling": WULING_MODELS,
}

export const BRAND_ORDER: string[] = [
  "Toyota",
  "Jetour",
  "KIA",
  "Audi",
  "BMW",
  "Hyundai",
  "Mercedes-Benz",
  "Star 5",
  "MG",
  "Changan",
  "Wuling",
]

export const ALL_MODELS: CarModel[] = [
  ...TOYOTA_MODELS,
  ...JETOUR_MODELS,
  ...KIA_MODELS,
  ...AUDI_MODELS,
  ...BMW_MODELS,
  ...HYUNDAI_MODELS,
  ...MERCEDES_BENZ_MODELS,
  ...STAR_5_MODELS,
  ...MG_MODELS,
  ...CHANGAN_MODELS,
  ...WULING_MODELS,
]
