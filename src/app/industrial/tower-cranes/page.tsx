import type { Metadata }    from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Tower Cranes for Sale — Euro Global Machinery",
  description: "Browse new and used tower cranes from verified dealers across Europe.",
};

export default function TowerCranesPage() {
  return (
    <ComingSoonCategory
      title="Tower Crane (Base Unit) for Sale"
      filterTypes={["Flat Top", "Luffing Jib", "Self-Erecting"]}
      categorySlug="industrial"
      activeSlug="tower-cranes"
    />
  );
}
