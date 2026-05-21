import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Harvesters for Sale — Wings Global Trade",
  description: "Browse new and used combine harvesters from verified dealers across Europe.",
};

export default function HarvestersPage() {
  return (
    <ComingSoonCategory
      title="Harvesters for Sale"
      filterTypes={["Combine Harvester", "Forage Harvester", "Sugarcane Harvester"]}
      categorySlug="agricultural"
      activeSlug="harvesters"
    />
  );
}
