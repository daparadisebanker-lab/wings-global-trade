import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Bulldozers for Sale — Wings Global Trade",
  description: "Browse new and used bulldozers from verified dealers across Europe.",
};

export default function BulldozersPage() {
  return (
    <ComingSoonCategory
      title="Bulldozer for Sale"
      filterTypes={["LGP", "Standard", "Waste Handler"]}
      categorySlug="industrial"
      activeSlug="bulldozers"
    />
  );
}
