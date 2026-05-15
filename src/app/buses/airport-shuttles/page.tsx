import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Airport Shuttles for Sale — Euro Global Machinery",
  description: "Browse new and used airport shuttles from verified dealers across Europe.",
};

export default function AirportShuttlesPage() {
  return (
    <ComingSoonCategory
      title="Airport Shuttle for Sale"
      filterTypes={["Terminal Bus", "Hotel Shuttle"]}
      categorySlug="buses"
      activeSlug="airport-shuttles"
    />
  );
}
