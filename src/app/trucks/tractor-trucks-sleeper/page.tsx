import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Sleeper Cab Tractor Trucks for Sale — Wings Global Trade",
  description: "Browse new and used sleeper cab tractor trucks from verified dealers across Europe.",
};

export default function SleeperCabTractorsPage() {
  return (
    <ComingSoonCategory
      title="Tractor Truck (Sleeper Cab) for Sale"
      filterTypes={["High Roof", "Flat Roof", "Double Sleeper"]}
      categorySlug="trucks"
      activeSlug="tractor-trucks-sleeper"
    />
  );
}
