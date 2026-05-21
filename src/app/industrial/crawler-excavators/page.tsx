import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Crawler Excavators for Sale — Wings Global Trade",
  description: "Browse new and used crawler excavators from verified dealers across Europe.",
};

export default function CrawlerExcavatorsPage() {
  return (
    <ComingSoonCategory
      title="Crawler Excavator for Sale"
      filterTypes={["Mini Excavator", "Midi Excavator", "Large Excavator"]}
      categorySlug="industrial"
      activeSlug="crawler-excavators"
    />
  );
}
