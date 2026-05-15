import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Differential Housings for Sale — Euro Global Machinery",
  description: "Browse new and used differential housings from verified dealers across Europe.",
};

export default function DifferentialsPage() {
  return (
    <ComingSoonCategory
      title="Differential Housing for Sale"
      filterTypes={["Standard", "Limited Slip", "Locking"]}
      categorySlug="spare-parts"
      activeSlug="differentials"
    />
  );
}
