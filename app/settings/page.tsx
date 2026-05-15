import type { Metadata } from "next";
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, brand assets, and subscription for GrowUrb AI.",
};

export default function SettingsPage() {
  return <SettingsPageContent />;
}
