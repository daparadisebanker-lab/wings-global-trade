import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Coach Buses for Sale — Euro Global Machinery",
  description: "Browse new and used coach buses from verified dealers across Europe.",
};

export default function CoachBusesPage() {
  return (
    <ComingSoonCategory
      title="Coach (Long Distance) for Sale"
      filterTypes={["Luxury", "Standard", "VIP"]}
      categorySlug="buses"
      activeSlug="coach-buses"
    />
  );
}
