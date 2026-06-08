import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Empacadoras de Importación — Wings Global Trade",
  description: "Empacadoras agrícolas nuevas desde Asia. Importación directa con precio landed total y entrega en Perú, Bolivia, Chile y más.",
};

export default function BalersPage() {
  return (
    <ComingSoonCategory
      title="Balers for Sale"
      filterTypes={["Round Baler", "Square Baler", "Mini Baler"]}
      categorySlug="agricultural"
      activeSlug="balers"
    />
  );
}
