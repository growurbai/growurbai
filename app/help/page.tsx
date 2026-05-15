import type { Metadata } from "next";
import { HelpPageContent } from "@/components/help/HelpPageContent";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "FAQs, contact options, and tutorials for GrowUrb AI.",
};

export default function HelpPage() {
  return <HelpPageContent />;
}
