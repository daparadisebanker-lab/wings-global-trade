import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Harvesters for Sale — Euro Global Machinery",
  description: "Browse new and used combine harvesters from verified dealers across Europe.",
};

export default function HarvestersPage() {
  return (
    <ComingSoonCategory
      title="Harvesters for Sale"
      filterTypes={["Combine Harvester", "Forage Harvester", "Beet Harvester", "Potato Harvester", "Cotton Harvester"]}
    />
  );
}
