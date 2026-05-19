"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const FAQ_ITEMS = [
  {
    value: "design-skills",
    question: "Do I need design skills?",
    answer:
      "No. Upload a clear product photo from your phone—our studio handles lighting, composition, and channel-native copy. You focus on merchandising and launches, not Photoshop.",
  },
  {
    value: "image-quality",
    question: "What image quality do I need?",
    answer:
      "Any mobile photo works. Higher resolution helps, but you do not need a studio setup. We optimize for catalog and social placements automatically.",
  },
  {
    value: "multiple-products",
    question: "Can I use it for multiple products?",
    answer:
      "Yes. Run unlimited SKUs under one account. Each generation consumes credits according to your plan, and your history is saved in the studio gallery.",
  },
  {
    value: "data-security",
    question: "Is my data secure?",
    answer:
      "Yes. We use enterprise-grade infrastructure with encrypted transport, access controls, and row-level security in Supabase. Your uploads are used only to generate your creatives unless you delete them.",
  },
  {
    value: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Manage billing in the customer portal—no long-term contracts. Cancel before renewal to avoid the next charge. See our refund policy for trial and billing details.",
  },
  {
    value: "languages",
    question: "Does it support Hindi or regional languages?",
    answer:
      "Yes. Choose English, Hindi, Hinglish, Spanish, or German for ad copy. Visual layouts work globally; copy is tuned for your selected language and market.",
  },
] as const;

export function LandingFaqSection() {
  const headingRef = useRevealOnScroll();
  const accordionRef = useRevealOnScroll();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-24 border-t border-white/[0.06] bg-black/25 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/25 to-transparent"
      />

      <div className="mx-auto max-w-3xl">
        <div ref={headingRef} className="scroll-reveal-heading text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Questions founders ask before they ship
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Straight answers—no agency jargon. Expand any item for details.
          </p>
        </div>

        <div ref={accordionRef} className="scroll-reveal-fade-up-stagger mt-12">
          <Accordion type="single" collapsible className="space-y-3 w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-left text-sm font-medium text-white hover:text-electric sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-zinc-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
