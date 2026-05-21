import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Minibuses for Sale — Wings Global Trade",
  description: "Browse new and used minibuses from verified dealers across Europe.",
};

export default function MinibusesPage() {
  return (
    <ComingSoonCategory
      title="Minibus for Sale"
      filterTypes={["9-Seater", "12-Seater", "16-Seater"]}
      categorySlug="buses"
      activeSlug="minibuses"
    />
  );
}
