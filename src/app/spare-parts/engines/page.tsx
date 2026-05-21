import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Diesel Engine Blocks for Sale — Wings Global Trade",
  description: "Browse new and used diesel engine blocks from verified dealers across Europe.",
};

export default function EnginesPage() {
  return (
    <ComingSoonCategory
      title="Engine Block (Diesel) for Sale"
      filterTypes={["V6", "V8", "Straight-6"]}
      categorySlug="spare-parts"
      activeSlug="engines"
    />
  );
}
