import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Articulated Buses for Sale — Euro Global Machinery",
  description: "Browse new and used articulated buses from verified dealers across Europe.",
};

export default function ArticulatedBusesPage() {
  return (
    <ComingSoonCategory
      title="Articulated Bus for Sale"
      filterTypes={["18m", "24m"]}
      categorySlug="buses"
      activeSlug="articulated-buses"
    />
  );
}
