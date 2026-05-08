import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Agricultural Trucks for Sale — Euro Global Machinery",
  description: "Browse new and used agricultural and farm trucks from verified dealers across Europe.",
};

export default function TrucksPage() {
  return (
    <ComingSoonCategory
      title="Trucks for Sale"
      filterTypes={["Tipper", "Flatbed", "Livestock Carrier", "Grain Carrier", "Refrigerated"]}
    />
  );
}
