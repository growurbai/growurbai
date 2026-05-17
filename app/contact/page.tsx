import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Growurb AI — Mr. Karan, team.growurb@gmail.com, Jodhpur, Rajasthan, India.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
