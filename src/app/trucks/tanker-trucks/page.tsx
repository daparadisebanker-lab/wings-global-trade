import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Tanker Trucks for Sale — Wings Global Trade",
  description: "Browse new and used tanker trucks from verified dealers across Europe.",
};

export default function TankerTrucksPage() {
  return (
    <ComingSoonCategory
      title="Tanker Trucks for Sale"
      filterTypes={["Fuel Tanker", "Water Tanker", "Chemical Tanker"]}
      categorySlug="trucks"
      activeSlug="tanker-trucks"
    />
  );
}
