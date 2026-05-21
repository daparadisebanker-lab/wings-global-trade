import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Car Carriers for Sale — Wings Global Trade",
  description: "Browse new and used car carriers from verified dealers across Europe.",
};

export default function CarCarriersPage() {
  return (
    <ComingSoonCategory
      title="Car Carriers for Sale"
      filterTypes={["2-Car Carrier", "Multi-Car Carrier", "Enclosed"]}
      categorySlug="trucks"
      activeSlug="car-carriers"
    />
  );
}
