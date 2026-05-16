"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const quotes = [
  {
    quote:
      "Hum log Indore se serum bechte hain—pehle studio ₹15k leta tha ek shoot. Ab phone se photo daal ke same din PDP aur Insta dono ready.",
    score: "4.9",
  },
  {
    quote:
      "Kurti drops ke liye captions pehle English-heavy lagte the. Yahan se nikla copy bilkul market jaise—Diwali push pe CTR clearly up mila.",
    score: "4.8",
  },
  {
    quote:
      "TWS aur power bank dono ke liye use kar rahe hain. Specs wali PDP bullets clean hain; Amazon-style structure bina agency ke.",
    score: "5.0",
  },
];

const ATTRIBUTION = "Beta User — Early Access Member";

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
          className="scroll-reveal-from-left-stagger mt-14 grid gap-7 md:grid-cols-3 md:gap-8"
        >
          {quotes.map((t, idx) => (
            <blockquote
              key={idx}
              className="glass-panel glass-panel-hover flex h-full min-h-[22rem] flex-col p-9 sm:min-h-[24rem] sm:p-10"
              cite="#"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  Verified Beta User
                  <span aria-hidden className="text-emerald-400">
                    ✓
                  </span>
                </span>
                <div className="flex items-center gap-1.5 text-gold">
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
                  <span className="text-xs font-semibold tabular-nums text-zinc-400">{t.score}</span>
                  <span className="sr-only">out of 5</span>
                </div>
              </div>
              <p className="mt-7 flex-1 text-[15px] leading-relaxed text-zinc-300 sm:text-base">
                “{t.quote}”
              </p>
              <footer className="mt-8 border-t border-white/[0.08] pt-7">
                <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">{ATTRIBUTION}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
