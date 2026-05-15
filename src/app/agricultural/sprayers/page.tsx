import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Sprayers for Sale — Euro Global Machinery",
  description: "Browse new and used sprayers from verified dealers across Europe.",
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
