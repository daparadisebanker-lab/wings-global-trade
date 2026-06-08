import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Carros de Grano de Importación — Wings Global Trade",
  description: "Carros de grano y tolvas desde fabricantes asiáticos. Precio landed con flete, aranceles y entrega incluidos.",
};

export default function GrainCartsPage() {
  return (
    <ComingSoonCategory
      title="Grain Carts for Sale"
      filterTypes={["Auger Wagon", "Chaser Bin", "Gravity Wagon"]}
      categorySlug="agricultural"
      activeSlug="grain-carts"
    />
  );
}
