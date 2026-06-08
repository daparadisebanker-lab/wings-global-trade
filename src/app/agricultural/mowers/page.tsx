import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Segadoras de Importación — Wings Global Trade",
  description: "Segadoras agrícolas nuevas desde fabricantes asiáticos verificados. Precio landed total con flete y aranceles incluidos.",
};

export default function MowersPage() {
  return (
    <ComingSoonCategory
      title="Mowers for Sale"
      filterTypes={["Disc Mower", "Drum Mower", "Flail Mower"]}
      categorySlug="agricultural"
      activeSlug="mowers"
    />
  );
}
