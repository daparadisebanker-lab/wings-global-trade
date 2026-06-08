import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Arados de Importación — Wings Global Trade",
  description: "Arados y equipos de labranza desde Asia. Importación directa con precio landed total y entrega en Latinoamérica.",
};

export default function PlowsPage() {
  return (
    <ComingSoonCategory
      title="Plows for Sale"
      filterTypes={["Mouldboard Plow", "Reversible Plow", "Disc Plow", "Subsoiler", "Chisel Plow"]}
      categorySlug="agricultural"
      activeSlug="plows"
    />
  );
}
