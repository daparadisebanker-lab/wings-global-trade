import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Mowers for Sale — Wings Global Trade",
  description: "Browse new and used agricultural mowers from verified dealers across Europe.",
};

export default function MowersPage() {
  return (
    <ComingSoonCategory
      title="Mowers for Sale"
      filterTypes={["Disc Mower", "Drum Mower", "Flail Mower"]}
      categorySlug="agricultural"
      activeSlug="mowers"
    />
  );
}
