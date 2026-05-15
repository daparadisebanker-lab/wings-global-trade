import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Grain Carts for Sale — Euro Global Machinery",
  description: "Browse new and used grain carts from verified dealers across Europe.",
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
