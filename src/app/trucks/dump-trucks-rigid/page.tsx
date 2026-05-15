import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Rigid Dump Trucks for Sale — Euro Global Machinery",
  description: "Browse new and used rigid dump trucks from verified dealers across Europe.",
};

export default function RigidDumpTrucksPage() {
  return (
    <ComingSoonCategory
      title="Dump Truck (Rigid) for Sale"
      filterTypes={["4x2", "6x4", "8x4"]}
      categorySlug="trucks"
      activeSlug="dump-trucks-rigid"
    />
  );
}
