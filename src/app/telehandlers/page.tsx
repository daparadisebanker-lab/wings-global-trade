import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Telehandlers for Sale — Euro Global Machinery",
  description: "Browse new and used telehandlers from verified dealers across Europe.",
};

export default function TelehandlersPage() {
  return (
    <ComingSoonCategory
      title="Telehandlers for Sale"
      filterTypes={["Compact Telehandler", "Standard Telehandler", "Heavy Duty", "Rotating Telehandler"]}
    />
  );
}
