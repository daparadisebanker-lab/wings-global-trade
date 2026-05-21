import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Radiators for Sale — Wings Global Trade",
  description: "Browse new and used radiators from verified dealers across Europe.",
};

export default function RadiatorsPage() {
  return (
    <ComingSoonCategory
      title="Radiator for Sale"
      filterTypes={["Aluminum", "Copper-Brass"]}
      categorySlug="spare-parts"
      activeSlug="radiators"
    />
  );
}
