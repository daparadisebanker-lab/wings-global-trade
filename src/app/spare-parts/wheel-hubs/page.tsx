import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Wheel Hubs & Brake Drums for Sale — Wings Global Trade",
  description: "Browse new and used wheel hubs and brake drums from verified dealers across Europe.",
};

export default function WheelHubsPage() {
  return (
    <ComingSoonCategory
      title="Wheel Hub & Brake Drum for Sale"
      filterTypes={["Front Hub", "Rear Hub"]}
      categorySlug="spare-parts"
      activeSlug="wheel-hubs"
    />
  );
}
