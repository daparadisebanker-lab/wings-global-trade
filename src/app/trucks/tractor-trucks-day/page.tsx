import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Day Cab Tractor Trucks for Sale — Euro Global Machinery",
  description: "Browse new and used day cab tractor trucks from verified dealers across Europe.",
};

export default function DayCabTractorsPage() {
  return (
    <ComingSoonCategory
      title="Tractor Truck (Day Cab) for Sale"
      filterTypes={["4x2", "6x2", "6x4"]}
      categorySlug="trucks"
      activeSlug="tractor-trucks-day"
    />
  );
}
