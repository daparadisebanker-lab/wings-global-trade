import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Wheeled Excavators for Sale — Euro Global Machinery",
  description: "Browse new and used wheeled excavators from verified dealers across Europe.",
};

export default function WheeledExcavatorsPage() {
  return (
    <ComingSoonCategory
      title="Wheeled Excavator for Sale"
      filterTypes={["City Excavator", "Heavy Duty"]}
      categorySlug="industrial"
      activeSlug="wheeled-excavators"
    />
  );
}
