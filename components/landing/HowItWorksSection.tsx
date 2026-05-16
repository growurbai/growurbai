"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const steps = [
  {
    step: 1,
    title: "Upload your product photo",
    description: "Any clear mobile shot works—no studio, no retouching prep.",
  },
  {
    step: 2,
    title: "AI analyzes & generates 4 luxury creatives",
    description: "Layouts, lighting, and channel-ready copy tuned for Indian shoppers.",
  },
  {
    step: 3,
    title: "Download & post — start selling",
    description: "Grab your kit and ship campaigns across Meta, PDPs, and reels the same day.",
  },
];

export function HowItWorksSection() {
  const headingRef = useRevealOnScroll();
  const stepsRef = useRevealOnScroll();

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 border-t border-white/[0.06] bg-gradient-to-b from-black/30 to-black/10 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/35 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl">
        <div
          ref={headingRef}
          className="scroll-reveal-heading mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-electric">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Three steps. One premium pipeline.
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            From raw SKU photo to scroll-stopping ads—without hiring a full creative team.
          </p>
        </div>

        <div
          ref={stepsRef}
          className="scroll-reveal-fade-up-stagger relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-10"
        >
          {/* connector line — desktop only */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[8%] right-[8%] top-[2.25rem] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block"
          />

          {steps.map((s) => (
            <article
              key={s.step}
              className="glass-panel glass-panel-hover relative flex flex-col items-center p-8 text-center md:items-start md:text-left"
            >
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-electric/40 bg-gradient-to-br from-electric/25 to-violet-900/40 text-lg font-bold text-white shadow-[0_0_32px_-8px_rgba(124,58,237,0.55)]">
                {s.step}
              </div>
              <h3 className="mt-6 text-lg font-semibold leading-snug text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
