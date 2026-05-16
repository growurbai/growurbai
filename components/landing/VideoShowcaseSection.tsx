"use client";

import { DemoAdHeroPanel, DemoBeforePanel } from "@/components/landing/DemoPanels";

const HIGHLIGHTS = [
  "⚡ Real-time Processing",
  "🎨 4 Luxury Backgrounds",
  "✍️ AI Ad Copy Included",
] as const;

const PANEL_SIZES = "(max-width: 1024px) 100vw, 420px";

export function VideoShowcaseSection() {
  return (
    <section
      className="relative scroll-mt-24 border-t border-white/[0.06] bg-black/30 px-4 py-24 sm:px-6 lg:px-8"
      aria-labelledby="video-showcase-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/30 to-transparent"
      />

      <div className="mx-auto max-w-5xl">
        <h2
          id="video-showcase-heading"
          className="mb-10 text-center text-3xl font-semibold tracking-tight text-white sm:mb-12 sm:text-4xl"
        >
          Watch The{" "}
          <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
            Magic
          </span>{" "}
          Happen
        </h2>

        <div className="transition-transform duration-500 ease-out hover:scale-[1.01] sm:hover:scale-[1.015]">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.14] bg-white/[0.05] p-4 shadow-[0_0_0_1px_rgba(124,58,237,0.12),0_0_48px_-12px_rgba(124,58,237,0.42),0_24px_64px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl ring-1 ring-white/[0.08] sm:p-6 lg:p-8">
            <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-stretch lg:gap-4">
              <DemoBeforePanel
                sizes={PANEL_SIZES}
                label="Your Product Photo"
                className="min-h-[220px] flex-1 rounded-2xl border border-white/[0.1] lg:min-h-[300px]"
              />

              <div
                className="mockup-arrow-animate flex shrink-0 items-center justify-center self-center text-electric lg:flex-col"
                aria-hidden
              >
                <span className="text-3xl font-light leading-none sm:text-4xl lg:rotate-90">
                  →
                </span>
              </div>

              <DemoAdHeroPanel
                sizes={PANEL_SIZES}
                className="min-h-[220px] flex-1 lg:min-h-[300px]"
              />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-zinc-400 sm:mt-10 sm:text-base">
          Upload any mobile photo → Get agency-level ad in 60 seconds
        </p>

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
          {HIGHLIGHTS.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:text-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
