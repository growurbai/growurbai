"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const quotes = [
  {
    quote:
      "We replaced ₹40k/month in Mumbai studio slots. GrowUrb gives us five PDP angles before our chai cools.",
    name: "Aisha Malik",
    title: "Founder · Kanvas Skincare • Mumbai",
    score: "4.9",
  },
  {
    quote:
      "Festive captions that actually sound Indian—not generic GPT fluff. Saves our performance team nights before Diwali pushes.",
    name: "Rohan Verma",
    title: "Head of Growth · Loom Threads • Ahmedabad",
    score: "4.8",
  },
  {
    quote:
      "Agency tier batching solved client approvals. Deliverables export in the ratios Meesho and Insta Shops expect.",
    name: "Meera Srinivasan",
    title: "Creative Director · Colaba Social Lab • Bengaluru",
    score: "5.0",
  },
];

export function TestimonialsSection() {
  const headingRef = useRevealOnScroll();
  const cardsRef = useRevealOnScroll();

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-t border-white/[0.06] bg-gradient-to-b from-black/60 to-midnight px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div
          ref={headingRef}
          className="scroll-reveal-heading mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Love letters
          </p>
          <h2 id="testimonials-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trusted across India&apos;s D2C map
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="scroll-reveal-from-left-stagger mt-14 grid gap-6 md:grid-cols-3"
        >
          {quotes.map((t) => (
            <blockquote
              key={t.name}
              className="glass-panel glass-panel-hover flex h-full flex-col p-8"
              cite="#"
            >
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 fill-current opacity-90"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="sr-only">{t.score} out of 5</span>
              </div>
              <p className="mt-6 flex-1 text-sm leading-relaxed text-zinc-300">
                “{t.quote}”
              </p>
              <footer className="mt-8 border-t border-white/[0.08] pt-6">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{t.title}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
