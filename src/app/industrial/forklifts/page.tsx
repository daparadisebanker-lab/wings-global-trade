import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Forklifts for Sale — Euro Global Machinery",
  description: "Browse new and used forklifts from verified dealers across Europe.",
};

export default function ForkliftsPage() {
  return (
    <ComingSoonCategory
      title="Counterbalance Forklift for Sale"
      filterTypes={["Electric", "Diesel", "LPG"]}
      categorySlug="industrial"
      activeSlug="forklifts"
    />
  );
}
