import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Double-Decker Buses for Sale — Wings Global Trade",
  description: "Browse new and used double-decker buses from verified dealers across Europe.",
};

export default function DoubleDeckerBusesPage() {
  return (
    <ComingSoonCategory
      title="Double-Decker Bus for Sale"
      filterTypes={["Open Top", "Closed Top"]}
      categorySlug="buses"
      activeSlug="double-decker-buses"
    />
  );
}
