import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Balers for Sale — Euro Global Machinery",
  description: "Browse new and used balers from verified dealers across Europe.",
};

export default function BalersPage() {
  return (
    <ComingSoonCategory
      title="Balers for Sale"
      filterTypes={["Round Baler", "Square Baler", "Big Baler", "Mini Baler"]}
    />
  );
}
