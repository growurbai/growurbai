"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const faqs = [
  {
    q: "Do I need design skills?",
    a: "No, just upload and generate.",
  },
  {
    q: "What image quality do I need?",
    a: "Any mobile photo works.",
  },
  {
    q: "Can I use it for multiple products?",
    a: "Yes, unlimited products.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, enterprise grade security.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, no contracts.",
  },
];

export function LandingFaqSection() {
  const headingRef = useRevealOnScroll();
  const listRef = useRevealOnScroll();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-24 border-t border-white/[0.06] bg-black/25 px-4 py-24 sm:px-6 lg:px-8"
    >
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
            Straight answers—no agency jargon.
          </p>
        </div>

        <div ref={listRef} className="scroll-reveal-fade-up-stagger mt-12 space-y-3" role="list">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                role="listitem"
                className="overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] transition hover:border-white/[0.14]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-white sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-zinc-500 transition ${isOpen ? "rotate-180 text-electric" : ""}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div className="border-t border-white/[0.06] px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
                    <p className="text-sm leading-relaxed text-zinc-400">{item.a}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
