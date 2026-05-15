import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Trolleybuses for Sale — Euro Global Machinery",
  description: "Browse new and used trolleybuses from verified dealers across Europe.",
};

export default function TrolleybusesPage() {
  return (
    <ComingSoonCategory
      title="Trolleybus for Sale"
      filterTypes={["Single Section", "Articulated"]}
      categorySlug="buses"
      activeSlug="trolleybuses"
    />
  );
}
