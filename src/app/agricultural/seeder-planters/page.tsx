import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Seeder & Planters for Sale — Euro Global Machinery",
  description: "Browse new and used seeders and planters from verified dealers across Europe.",
};

export default function SeederPlantersPage() {
  return (
    <ComingSoonCategory
      title="Seeders & Planters for Sale"
      filterTypes={["Air Seeder", "Precision Planter", "Seed Drill"]}
      categorySlug="agricultural"
      activeSlug="seeder-planters"
    />
  );
}
