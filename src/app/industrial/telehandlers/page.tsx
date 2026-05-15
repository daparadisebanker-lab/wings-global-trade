import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Telescopic Handlers for Sale — Euro Global Machinery",
  description: "Browse new and used telehandlers from verified dealers across Europe.",
};

export default function TelehandlersPage() {
  return (
    <ComingSoonCategory
      title="Telescopic Handler (Telehandler) for Sale"
      filterTypes={["Compact", "High Reach", "Heavy Lift"]}
      categorySlug="industrial"
      activeSlug="telehandlers"
    />
  );
}
