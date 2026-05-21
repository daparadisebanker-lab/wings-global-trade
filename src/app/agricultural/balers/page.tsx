import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Balers for Sale — Wings Global Trade",
  description: "Browse new and used balers from verified dealers across Europe.",
};

export default function BalersPage() {
  return (
    <ComingSoonCategory
      title="Balers for Sale"
      filterTypes={["Round Baler", "Square Baler", "Mini Baler"]}
      categorySlug="agricultural"
      activeSlug="balers"
    />
  );
}
