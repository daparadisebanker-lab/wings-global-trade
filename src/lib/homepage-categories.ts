export type HomepageCategory = {
  id: string;
  label: string;
  image: string;
  alt: string;
};

export const categories: HomepageCategory[] = [
  { id: "agricolas",    label: "Agrícolas",    image: "/images/categories/agricolas.jpg",    alt: "Tractores y maquinaria agrícola" },
  { id: "pesadas",      label: "Pesadas",      image: "/images/categories/pesadas.jpg",      alt: "Maquinaria pesada de construcción" },
  { id: "industriales", label: "Industriales", image: "/images/categories/industriales.jpg", alt: "Equipos industriales" },
  { id: "pesca",        label: "Pesca",        image: "/images/categories/pesca.jpg",        alt: "Equipos para pesca" },
  { id: "mineria",      label: "Minería",      image: "/images/categories/mineria.jpg",      alt: "Maquinaria para minería" },
];
