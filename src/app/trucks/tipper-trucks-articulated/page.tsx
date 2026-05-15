import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Articulated Tipper Trucks for Sale — Euro Global Machinery",
  description: "Browse new and used articulated tipper trucks from verified dealers across Europe.",
};

export default function ArticulatedTipperTrucksPage() {
  return (
    <ComingSoonCategory
      title="Tipper Truck (Articulated) for Sale"
      filterTypes={["25 Ton", "30 Ton", "40 Ton"]}
      categorySlug="trucks"
      activeSlug="tipper-trucks-articulated"
    />
  );
}
