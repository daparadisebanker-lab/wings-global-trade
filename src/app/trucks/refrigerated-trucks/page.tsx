import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Refrigerated Trucks for Sale — Wings Global Trade",
  description: "Browse new and used refrigerated trucks from verified dealers across Europe.",
};

export default function RefrigeratedTrucksPage() {
  return (
    <ComingSoonCategory
      title="Refrigerated Trucks for Sale"
      filterTypes={["Single Temp", "Multi Temp", "Small Van"]}
      categorySlug="trucks"
      activeSlug="refrigerated-trucks"
    />
  );
}
