export interface KamaSeries {
  slug: string;
  label: string;
  subtitle: string;
  description: string;
  modelIds: string[];
  fuel: string;
  payload: string;
  hpRange: string;
  badge?: string;
  gvwRange: string;
  accent: string;
}

export const KAMA_SERIES: KamaSeries[] = [
  {
    slug: "w",
    label: "W Series",
    subtitle: "Cabina doble · Gasolina Euro-VI",
    description: "Camión ligero de doble cabina con motor de gasolina LJ4A16QG Euro-VI. Carga útil 1.5T, GVW 3,040 kg, caja de carga 3050×1750mm.",
    modelIds: ["kama-w23s"],
    fuel: "Gasolina",
    payload: "1.5T",
    hpRange: "122 hp",
    badge: "Euro-VI",
    gvwRange: "3,040 kg",
    accent: "#C4933F",
  },
  {
    slug: "x",
    label: "X Series",
    subtitle: "Cabina 1750mm · Gas / GNC / Diésel",
    description: "Serie versátil de cabina sencilla 1750mm con variantes de gasolina, gas natural comprimido (CNG) y diésel Euro-IV/V. Eje trasero de 2.5T.",
    modelIds: ["kama-x11","kama-x12cng","kama-x32d","kama-x33e"],
    fuel: "Gas / GNC / Diésel",
    payload: "2–2.5T",
    hpRange: "107–131 hp",
    gvwRange: "hasta 4,600 kg",
    accent: "#C4933F",
  },
  {
    slug: "v",
    label: "V Series",
    subtitle: "Mini Truck · 1715mm · Euro-VI",
    description: "Mini camión compacto de cabina 1715mm para distribución urbana y rural. Motor DAE hasta 110 kW para rutas exigentes.",
    modelIds: ["kama-v12","kama-v15"],
    fuel: "Gasolina",
    payload: "1.2–1.5T",
    hpRange: "103–148 hp",
    badge: "Euro-VI",
    gvwRange: "2,700–3,250 kg",
    accent: "#C4933F",
  },
  {
    slug: "m3",
    label: "M3 Series",
    subtitle: "Cabina 1900mm · Diésel Euro-VI",
    description: "El M36F es el único modelo diésel Euro-VI de la serie M3. Motor Weichai WP2.3 de 110 kW, freno de aire, carga útil 4T.",
    modelIds: ["kama-m36f"],
    fuel: "Diésel",
    payload: "4T",
    hpRange: "148 hp",
    badge: "Euro-VI",
    gvwRange: "5,580 kg",
    accent: "#C4933F",
  },
  {
    slug: "m6",
    label: "M6 Series",
    subtitle: "Cabina 2030mm · Gas / Diésel · Carga pesada",
    description: "Cabina extra-ancha de 2030mm para carga media-pesada. Del M61 de gasolina al M69E Isuzu de 201 hp con 10T de carga útil.",
    modelIds: ["kama-m61","kama-m69e"],
    fuel: "Gas / Diésel",
    payload: "3.5–10T",
    hpRange: "148–201 hp",
    gvwRange: "6,320–14,870 kg",
    accent: "#C4933F",
  },
  {
    slug: "gm",
    label: "GM Series",
    subtitle: "Carga pesada · Diésel Euro-V",
    description: "El GM67E con motor Yunnei YNF40E1 de 125 kW (168 hp), GVW 16,620 kg y caja de alta pared 800mm. Máxima capacidad para cargas voluminosas.",
    modelIds: ["kama-gm67e"],
    fuel: "Diésel",
    payload: "10T",
    hpRange: "168 hp",
    badge: "Euro-V",
    gvwRange: "16,620 kg",
    accent: "#C4933F",
  },
  {
    slug: "ew-ev",
    label: "EW/EV Series",
    subtitle: "Mini truck eléctrico · BEV · 130–280 km",
    description: "5 modelos de mini camión eléctrico con baterías LFP de GOTION, EVE o CATL. Autonomía de 130 a 280 km WLTP. Carga rápida/lenta.",
    modelIds: ["kama-ew1","kama-ew2","kama-ev1","kama-ev2","kama-ev3"],
    fuel: "Eléctrico (BEV)",
    payload: "1–1.5T",
    hpRange: "35 kW / 70 kW pico",
    badge: "BEV",
    gvwRange: "2,100–3,390 kg",
    accent: "#2DD4BF",
  },
  {
    slug: "es-esp",
    label: "ES/ESP Series",
    subtitle: "Furgoneta eléctrica · BEV · Carga y pasajeros",
    description: "6 modelos de furgoneta BEV: ES (carga) y ESP (pasajeros). Carrocería unitaria, puertas corredizas, compuertas 270°. Conforme ECE.",
    modelIds: ["kama-es6","kama-esp6","kama-es7","kama-esp7","kama-es8","kama-esp8"],
    fuel: "Eléctrico (BEV)",
    payload: "1–1.5T / 11–18 pasajeros",
    hpRange: "35 kW / 70 kW pico",
    badge: "BEV",
    gvwRange: "3,050–3,350 kg",
    accent: "#2DD4BF",
  },
  {
    slug: "ex-em",
    label: "EX/EM Series",
    subtitle: "Camión eléctrico · BEV · 1750–1900mm · EHB",
    description: "5 camiones BEV de cabina 1750mm (EX) y 1900mm (EM). Motores INOVANCE/DANA. Baterías de hasta 141 kWh. Sistema de freno EHB.",
    modelIds: ["kama-ex1","kama-ex2","kama-em31","kama-em32","kama-em61"],
    fuel: "Eléctrico (BEV)",
    payload: "GVW hasta 8T",
    hpRange: "35–70 kW / hasta 140 kW pico",
    badge: "BEV",
    gvwRange: "3,510–8,000 kg",
    accent: "#3B82F6",
  },
];

export function getSeriesBySlug(slug: string): KamaSeries | undefined {
  return KAMA_SERIES.find((s) => s.slug === slug);
}

// Groups: used in /camiones landing
export const KAMA_GROUPS = [
  {
    id: "combustion",
    label: "Camiones a combustión",
    description: "Gasolina, GNC y diésel Euro-IV a Euro-VI. Del mini truck urbano al camión pesado de 16.6T GVW.",
    series: ["w","x","v","m3","m6","gm"],
  },
  {
    id: "bev-trucks",
    label: "Camiones eléctricos",
    description: "Mini trucks y camiones de carga BEV con baterías LFP de primera línea. Autonomía hasta 360 km WLTP.",
    series: ["ew-ev","ex-em"],
  },
  {
    id: "bev-vans",
    label: "Furgonetas eléctricas",
    description: "Furgonetas BEV de carga y pasajeros con carrocería unitaria y homologación ECE.",
    series: ["es-esp"],
  },
] as const;
