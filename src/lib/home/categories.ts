// Category model + data for the homepage category windows.
// These are the site's REAL catalog categories with working routes — not
// abstract labels. Imagery: branded photography where it exists, the same
// production Unsplash set the previous homepage shipped with elsewhere.

export interface Category {
  id: string;
  label: string;      // es-PE display label
  description: string; // short mobile tagline — DM Mono style
  href: string;       // real catalog route
  image: string;
  alt: string;
}

export const categories: Category[] = [
  {
    id: "agricultural",
    label: "Agrícola",
    description: "Tractores · 50 a 140 hp",
    href: "/agricultural",
    image: "/images/categories/agricola.png",
    alt: "Tractor New Holland en campo al amanecer",
  },
  {
    id: "trucks",
    label: "Camiones",
    description: "Carga ligera a pesada",
    href: "/trucks",
    image: "/images/categories/camiones.png",
    alt: "Camión de carga pesada en carretera",
  },
  {
    id: "buses",
    label: "Buses",
    description: "Urbanos e interurbanos",
    href: "/buses",
    image: "/images/categories/buses.png",
    alt: "Bus interprovincial de pasajeros",
  },
  {
    id: "industrial",
    label: "Industrial",
    description: "Excavadoras y montacargas",
    href: "/industrial",
    image: "/images/categories/industrial.png",
    alt: "Maquinaria industrial pesada en obra",
  },
  {
    id: "spare-parts",
    label: "Repuestos",
    description: "Motores · cajas · turbo",
    href: "/spare-parts",
    image: "/images/categories/repuestos.png",
    alt: "Repuestos y componentes de maquinaria",
  },
];
