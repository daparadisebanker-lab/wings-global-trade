import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "City Buses for Sale — Wings Global Trade",
  description: "Browse new and used city buses from verified dealers across Europe.",
};

export default function CityBusesPage() {
  return (
    <ComingSoonCategory
      title="City Bus (Low-Floor) for Sale"
      filterTypes={["Electric", "Diesel", "Hybrid"]}
      categorySlug="buses"
      activeSlug="city-buses"
    />
  );
}
