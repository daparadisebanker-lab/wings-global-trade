import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Gearboxes & Transmissions for Sale — Wings Global Trade",
  description: "Browse new and used gearboxes and transmissions from verified dealers across Europe.",
};

export default function TransmissionsPage() {
  return (
    <ComingSoonCategory
      title="Gearbox/Transmission for Sale"
      filterTypes={["Manual", "Automatic", "Semi-Auto"]}
      categorySlug="spare-parts"
      activeSlug="transmissions"
    />
  );
}
