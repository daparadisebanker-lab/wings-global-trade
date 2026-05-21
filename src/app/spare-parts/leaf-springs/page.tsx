import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Leaf Spring Packs for Sale — Wings Global Trade",
  description: "Browse new and used leaf spring packs from verified dealers across Europe.",
};

export default function LeafSpringsPage() {
  return (
    <ComingSoonCategory
      title="Leaf Spring Pack for Sale"
      filterTypes={["Multi-Leaf", "Parabolic"]}
      categorySlug="spare-parts"
      activeSlug="leaf-springs"
    />
  );
}
