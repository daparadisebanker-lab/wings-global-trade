import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Sembradoras de Importación — Wings Global Trade",
  description: "Sembradoras y plantadoras desde Asia. Importación directa con precio landed y entrega en Perú, Bolivia, Chile y más.",
};

export default function SeederPlantersPage() {
  return (
    <ComingSoonCategory
      title="Seeders & Planters for Sale"
      filterTypes={["Air Seeder", "Precision Planter", "Seed Drill"]}
      categorySlug="agricultural"
      activeSlug="seeder-planters"
    />
  );
}
