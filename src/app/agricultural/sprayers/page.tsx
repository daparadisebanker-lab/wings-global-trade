import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Pulverizadoras de Importación — Wings Global Trade",
  description: "Pulverizadoras agrícolas nuevas desde fabricantes asiáticos verificados. Precio landed total con entrega en Latinoamérica.",
};

export default function SprayersPage() {
  return (
    <ComingSoonCategory
      title="Sprayers for Sale"
      filterTypes={["Self-Propelled", "Trailed", "Mounted"]}
      categorySlug="agricultural"
      activeSlug="sprayers"
    />
  );
}
