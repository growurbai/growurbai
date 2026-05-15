"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const features = [
  {
    title: "AI Photo Studio",
    description:
      "Premium lighting, contextual props, and platform-native crops—from catalogue tiles to reel-first verticals—all from a single flat shot.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
      </svg>
    ),
    accent: "from-electric/30 to-purple-900/40",
  },
  {
    title: "Magic Ad Copy",
    description:
      "Headlines and body copy grounded in Hindi-English shopper language: benefit-led hooks for Meta, PDP bullets, and festive campaign drops.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 14.626l4.746-5.001-4.747-5a.75.75 0 00-1.064 1.058l3.943 4.157H3a.75.75 0 000 1.5h10.604l-3.91 4.157a.75.75 0 101.09 1.034zM21 21H9" />
      </svg>
    ),
    accent: "from-gold/25 to-amber-900/30",
  },
  {
    title: "Brand Strategy",
    description:
      "Palette extraction, tonal guardrails, and positioning lines so every creative feels cohesive—whether you're indie or omnichannel-ready.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM9 9.75h6m-6 4.5h3" />
      </svg>
    ),
    accent: "from-blue-500/20 to-electric-dim/30",
  },
];

export function FeaturesSection() {
  const headingRef = useRevealOnScroll();
  const cardsRef = useRevealOnScroll();

  return (
    <section id="features" className="relative scroll-mt-24 border-t border-white/[0.06] bg-black/20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div
          ref={headingRef}
          className="scroll-reveal-heading mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Capability stack
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you wish your studio retainer covered
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            One pipeline from raw phone photo to ready-to-publish brand assets—with
            the polish buyers expect when they swipe your PDP.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="scroll-reveal-fade-up-stagger mt-14 grid gap-6 md:grid-cols-3"
        >
          {features.map((f) => (
            <article
              key={f.title}
              className="glass-panel glass-panel-hover group relative overflow-hidden p-7"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-gold shadow-inner">
                {f.icon}
              </div>
              <h3 className="relative mt-5 text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-zinc-400">
                {f.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
