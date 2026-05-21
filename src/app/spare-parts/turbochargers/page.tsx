import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Turbochargers for Sale — Wings Global Trade",
  description: "Browse new and used turbochargers from verified dealers across Europe.",
};

export default function TurbochargersPage() {
  return (
    <ComingSoonCategory
      title="Turbocharger for Sale"
      filterTypes={["Single Turbo", "Twin Turbo", "Variable Geometry"]}
      categorySlug="spare-parts"
      activeSlug="turbochargers"
    />
  );
}
