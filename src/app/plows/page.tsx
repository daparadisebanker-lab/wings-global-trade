import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Plows for Sale — Euro Global Machinery",
  description: "Browse new and used plows from verified dealers across Europe.",
};

export default function PlowsPage() {
  return (
    <ComingSoonCategory
      title="Plows for Sale"
      filterTypes={["Mouldboard Plow", "Reversible Plow", "Disc Plow", "Subsoiler", "Chisel Plow"]}
    />
  );
}
