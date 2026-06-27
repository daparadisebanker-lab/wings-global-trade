export interface CarModel {
  id: string;
  brand: string;
  model: string;
  images: string[];
  variants: string[];
}

// ─── Changan ────────────────────────────────────────────────────────────────

export const CHANGAN_MODELS: CarModel[] = [
  {
    id: "changan-cs75",
    brand: "Changan",
    model: "CS75 1.5DCT-Pro",
    images: [
      "/images/listings/automoviles/changan/page1_img0.jpeg",
      "/images/listings/automoviles/changan/page1_img1.jpeg",
    ],
    variants: [
      "Comfortable Gasoline · 5 plazas",
      "Comfortable Gasoline · 7 plazas",
    ],
  },
  {
    id: "changan-cs75plus",
    brand: "Changan",
    model: "CS75 Plus 1.5T",
    images: [
      "/images/listings/automoviles/changan/page2_img2.jpeg",
      "/images/listings/automoviles/changan/page2_img3.jpeg",
      "/images/listings/automoviles/changan/page3_img4.jpeg",
      "/images/listings/automoviles/changan/page3_img5.jpeg",
    ],
    variants: ["Champion", "Smart Deluxe"],
  },
  {
    id: "changan-x5",
    brand: "Changan",
    model: "X5",
    images: [
      "/images/listings/automoviles/changan/page4_img6.jpeg",
      "/images/listings/automoviles/changan/page4_img7.jpeg",
      "/images/listings/automoviles/changan/page5_img8.jpeg",
      "/images/listings/automoviles/changan/page5_img9.jpeg",
    ],
    variants: [
      "1.5 Manual",
      "1.5T DCT High Power PRO",
      "1.5T DCT Pioneer PRO",
      "1.5T DCT Beyond PRO",
      "1.5T DCT Excellent PRO",
    ],
  },
];

// ─── Toyota ─────────────────────────────────────────────────────────────────

export const TOYOTA_MODELS: CarModel[] = [
  {
    id: "toyota-corolla-hybrid",
    brand: "Toyota",
    model: "Corolla Hybrid 2026",
    images: [
      "/images/listings/automoviles/toyota/page1_img1.jpeg",
    ],
    variants: [
      "1.8T E-CVT Intelligent Electric Pioneer",
      "1.8T E-CVT Intelligent Electric Elite",
    ],
  },
  {
    id: "toyota-corolla-gasoline",
    brand: "Toyota",
    model: "Corolla Gasolina",
    images: [
      "/images/listings/automoviles/toyota/page2_img2.jpeg",
      "/images/listings/automoviles/toyota/page2_img3.jpeg",
    ],
    variants: [
      "2025 · 1.2T S-CVT Pioneer",
      "2026 · 1.2T S-CVT Pioneer",
      "2026 · 1.2T S-CVT Elite",
    ],
  },
  {
    id: "toyota-corolla-cross-gasoline",
    brand: "Toyota",
    model: "Corolla Cross Gasolina 2026",
    images: [
      "/images/listings/automoviles/toyota/page3_img4.jpeg",
      "/images/listings/automoviles/toyota/page3_img5.jpeg",
    ],
    variants: ["2.0L CVT Pioneer", "2.0L CVT Elite"],
  },
  {
    id: "toyota-corolla-cross-hybrid",
    brand: "Toyota",
    model: "Corolla Cross Hybrid 2026",
    images: [
      "/images/listings/automoviles/toyota/page4_img6.jpeg",
      "/images/listings/automoviles/toyota/page4_img7.jpeg",
    ],
    variants: [
      "2.0L Intelligent Electric Pioneer",
      "2.0L Intelligent Electric Dual Engine Elite",
    ],
  },
  {
    id: "toyota-rav4-hybrid",
    brand: "Toyota",
    model: "RAV4 Hybrid 2026",
    images: [
      "/images/listings/automoviles/toyota/page5_img8.jpeg",
      "/images/listings/automoviles/toyota/page5_img9.jpeg",
    ],
    variants: [
      "2.0L Twin Turbo 2WD Deluxe",
      "2.5L Twin Turbo 4WD Deluxe",
      "2.5L Dual Turbo 4WD Flagship",
    ],
  },
  {
    id: "toyota-rav4-gasoline",
    brand: "Toyota",
    model: "RAV4 Gasolina 2026",
    images: [
      "/images/listings/automoviles/toyota/page6_img10.jpeg",
      "/images/listings/automoviles/toyota/page6_img11.jpeg",
    ],
    variants: ["2.0L 2WD Luxury", "2.0L 4WD Luxury"],
  },
  {
    id: "toyota-camry",
    brand: "Toyota",
    model: "Camry 2026",
    images: [
      "/images/listings/automoviles/toyota/page7_img12.jpeg",
      "/images/listings/automoviles/toyota/page7_img13.jpeg",
    ],
    variants: [
      "2.0S Gasolina Sports Edition",
      "2.0HXS Hybrid Twin Turbo Sports PLUS",
    ],
  },
  {
    id: "toyota-prado",
    brand: "Toyota",
    model: "Prado 2026",
    images: [
      "/images/listings/automoviles/toyota/page8_img14.jpeg",
      "/images/listings/automoviles/toyota/page8_img15.jpeg",
    ],
    variants: [
      "2.4T Dual Engine Hanye WX · 6 plazas",
      "2.4T Twin Engine Flagship VX · 5 plazas",
    ],
  },
];

// ─── Hyundai ─────────────────────────────────────────────────────────────────

export const HYUNDAI_MODELS: CarModel[] = [
  {
    id: "hyundai-tucson-2025",
    brand: "Hyundai",
    model: "Tucson 2025",
    images: [
      "/images/listings/automoviles/hyundai/page1_img0.jpeg",
      "/images/listings/automoviles/hyundai/page1_img1.jpeg",
    ],
    variants: ["1.5T GLX Elite", "1.5T Luxury"],
  },
  {
    id: "hyundai-elantra-2023",
    brand: "Hyundai",
    model: "Elantra 2023",
    images: [
      "/images/listings/automoviles/hyundai/page2_img2.jpeg",
      "/images/listings/automoviles/hyundai/page2_img3.jpeg",
    ],
    variants: ["1.5L CVT GLX Elite", "1.5L CVT GLX Luxury"],
  },
  {
    id: "hyundai-sonata-2024",
    brand: "Hyundai",
    model: "Sonata 2024",
    images: [
      "/images/listings/automoviles/hyundai/page3_img4.jpeg",
      "/images/listings/automoviles/hyundai/page3_img5.jpeg",
    ],
    variants: ["1.5T Pro"],
  },
];

// ─── Jetour ──────────────────────────────────────────────────────────────────

export const JETOUR_MODELS: CarModel[] = [
  {
    id: "jetour-dasheng",
    brand: "Jetour",
    model: "Dasheng 1.5DCT",
    images: [
      "/images/listings/automoviles/jetour/page1_img0.jpeg",
      "/images/listings/automoviles/jetour/page1_img1.jpeg",
      "/images/listings/automoviles/jetour/page2_img2.jpeg",
      "/images/listings/automoviles/jetour/page2_img3.jpeg",
      "/images/listings/automoviles/jetour/page3_img4.jpeg",
      "/images/listings/automoviles/jetour/page3_img5.jpeg",
      "/images/listings/automoviles/jetour/page4_img6.jpeg",
      "/images/listings/automoviles/jetour/page4_img7.jpeg",
    ],
    variants: ["Youth Elite", "Youth Luxury", "Luxury", "Black Warrior", "Flagship"],
  },
  {
    id: "jetour-x70l",
    brand: "Jetour",
    model: "X70L 1.5 7DCT",
    images: [
      "/images/listings/automoviles/jetour/page5_img8.jpeg",
      "/images/listings/automoviles/jetour/page5_img9.jpeg",
    ],
    variants: ["Comfort · 7 plazas", "Luxury · 7 plazas"],
  },
  {
    id: "jetour-x70plus",
    brand: "Jetour",
    model: "X70Plus 1.5T 6DCT",
    images: [
      "/images/listings/automoviles/jetour/page6_img10.jpeg",
      "/images/listings/automoviles/jetour/page6_img11.jpeg",
    ],
    variants: ["Comfort", "Luxury"],
  },
];

// ─── Aggregates ──────────────────────────────────────────────────────────────

export const MODELS_BY_BRAND: Record<string, CarModel[]> = {
  Changan: CHANGAN_MODELS,
  Toyota: TOYOTA_MODELS,
  Hyundai: HYUNDAI_MODELS,
  Jetour: JETOUR_MODELS,
};

export const ALL_MODELS: CarModel[] = [
  ...CHANGAN_MODELS,
  ...TOYOTA_MODELS,
  ...HYUNDAI_MODELS,
  ...JETOUR_MODELS,
];
