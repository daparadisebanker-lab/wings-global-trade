import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Cosechadoras de Importación — Wings Global Trade",
  description: "Cosechadoras nuevas desde Asia con precio landed total. Importación directa desde fabricantes verificados con entrega en Latinoamérica.",
};

export default function HarvestersPage() {
  return (
    <ComingSoonCategory
      title="Harvesters for Sale"
      filterTypes={["Combine Harvester", "Forage Harvester", "Sugarcane Harvester"]}
      categorySlug="agricultural"
      activeSlug="harvesters"
    />
  );
}
