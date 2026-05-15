import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Fuel Injection Pumps for Sale — Euro Global Machinery",
  description: "Browse new and used fuel injection pumps from verified dealers across Europe.",
};

export default function FuelPumpsPage() {
  return (
    <ComingSoonCategory
      title="Fuel Injection Pump for Sale"
      filterTypes={["Mechanical", "Electronic"]}
      categorySlug="spare-parts"
      activeSlug="fuel-pumps"
    />
  );
}
