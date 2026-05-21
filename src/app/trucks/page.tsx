import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Camiones y Vehículos Pesados — Euro Global Machinery",
  description: "Camiones tractores, volquetes, plataformas, cisternas y refrigerados — nuevos y usados importados desde Asia.",
};

const cat = CATEGORIES.find((c) => c.slug === "trucks")!;

export default function TrucksPage() {
  return <CategoryHubPage category={cat} />;
}
