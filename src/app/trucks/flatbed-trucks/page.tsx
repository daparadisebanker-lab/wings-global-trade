import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Flatbed Trucks for Sale — Euro Global Machinery",
  description: "Browse new and used flatbed trucks from verified dealers across Europe.",
};

export default function FlatbedTrucksPage() {
  return (
    <ComingSoonCategory
      title="Flatbed Trucks for Sale"
      filterTypes={["Standard Flatbed", "Drop Deck", "Extendable"]}
      categorySlug="trucks"
      activeSlug="flatbed-trucks"
    />
  );
}
