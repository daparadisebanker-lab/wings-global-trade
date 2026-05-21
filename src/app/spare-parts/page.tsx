import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Repuestos y Componentes — Wings Global Trade",
  description: "Motores usados de Japón, motores nuevos de China, cajas de cambio, ejes y componentes alternativos para camiones y maquinaria pesada.",
};

const cat = CATEGORIES.find((c) => c.slug === "spare-parts")!;

export default function SparePartsPage() {
  return <CategoryHubPage category={cat} />;
}
