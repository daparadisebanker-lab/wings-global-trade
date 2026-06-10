// Category model + data (WINGS_HOME_SPEC.md §6.3)

export interface Category {
  id: string;
  label: string; // es-PE display label
  image: string; // /images/categories/{id}.jpg, 3:4, min 1600px tall
  alt: string;   // descriptive Spanish alt text
  /** Placeholder gradient (§8) — used until real photography is supplied.
   *  Derived exclusively from --color-harbor and --color-graphite. */
  placeholder: string;
}

export const categories: Category[] = [
  {
    id: "agricolas",
    label: "Agrícolas",
    image: "/images/categories/agricolas.jpg",
    alt: "Tractor agrícola trabajando un campo de cultivo en el valle",
    placeholder:
      "linear-gradient(135deg, var(--color-harbor) 0%, var(--color-graphite) 100%)",
  },
  {
    id: "pesadas",
    label: "Pesadas",
    image: "/images/categories/pesadas.jpg",
    alt: "Excavadora de orugas en obra de movimiento de tierras",
    placeholder:
      "linear-gradient(160deg, var(--color-graphite) 0%, var(--color-harbor) 85%)",
  },
  {
    id: "industriales",
    label: "Industriales",
    image: "/images/categories/industriales.jpg",
    alt: "Montacargas operando en almacén industrial",
    placeholder:
      "linear-gradient(115deg, var(--color-graphite) 10%, var(--color-harbor) 60%, var(--color-graphite) 100%)",
  },
  {
    id: "pesca",
    label: "Pesca",
    image: "/images/categories/pesca.jpg",
    alt: "Equipamiento de cubierta para embarcación pesquera",
    placeholder:
      "linear-gradient(200deg, var(--color-harbor) 0%, var(--color-graphite) 70%)",
  },
  {
    id: "mineria",
    label: "Minería",
    image: "/images/categories/mineria.jpg",
    alt: "Camión minero de gran tonelaje en tajo abierto",
    placeholder:
      "linear-gradient(145deg, var(--color-graphite) 0%, var(--color-graphite) 40%, var(--color-harbor) 100%)",
  },
];
