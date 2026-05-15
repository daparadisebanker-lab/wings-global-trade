import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Reach Stackers for Sale — Euro Global Machinery",
  description: "Browse new and used reach stackers from verified dealers across Europe.",
};

export default function ReachStackersPage() {
  return (
    <ComingSoonCategory
      title="Reach Stacker for Sale"
      filterTypes={["Container Handler", "Log Handler"]}
      categorySlug="industrial"
      activeSlug="reach-stackers"
    />
  );
}
