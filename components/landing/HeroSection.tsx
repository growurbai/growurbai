import Link from "next/link";
import { DashboardOrLoginLink } from "@/components/auth/DashboardOrLoginLink";
import { HeroStatsAnimated } from "@/components/landing/HeroStatsAnimated";

const HERO_HEADLINE_WORDS =
  "Transform Your Product Photo Into a High-End Brand Ad in 60 Seconds".split(
    " ",
  );

export function HeroSection() {
  return (
    <section className="relative min-h-0 overflow-hidden px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:min-h-[min(100svh,880px)] lg:px-8 lg:pb-28 lg:pt-24 xl:pt-20">
      {/* Animated layered background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hero-gradient-shift animate-gradient-shift"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hero-mesh"
      />

      {/* Large blurred gradient orbs */}
      <div
        aria-hidden
        className="hero-gradient-orb hero-gradient-orb--delay-a pointer-events-none absolute -left-[18%] top-[12%] z-[1] h-[min(520px,55vw)] w-[min(520px,55vw)] bg-gradient-to-br from-electric/35 via-violet-600/25 to-blue-600/20 opacity-90"
      />
      <div
        aria-hidden
        className="hero-gradient-orb hero-gradient-orb--delay-b pointer-events-none absolute -right-[12%] top-[28%] z-[1] h-[min(440px,48vw)] w-[min(440px,48vw)] bg-gradient-to-bl from-blue-500/28 via-electric/25 to-purple-900/20 opacity-85"
      />
      <div
        aria-hidden
        className="hero-gradient-orb pointer-events-none absolute bottom-[-8%] left-[28%] z-[1] h-[min(400px,42vw)] w-[min(400px,42vw)] bg-gradient-to-t from-electric-dim/30 via-blue-600/15 to-transparent opacity-75"
      />

      {/* Spotlight / light beam behind headline */}
      <div
        aria-hidden
        className="hero-light-beam pointer-events-none absolute left-1/2 top-0 z-[4] h-[min(78vh,640px)] w-[min(115vw,920px)] max-w-none"
      />

      {/* Floating particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="hero-particle absolute"
            style={{
              left: `${((i * 47 + 11) % 92) + 4}%`,
              top: `${((i * 31 + 17) % 88) + 6}%`,
              animationDuration: `${14 + (i % 9)}s`,
              animationDelay: `${-(i * 0.42)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-0 text-center xl:max-w-6xl">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400 sm:mb-6 sm:text-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          For D2C & Instagram sellers in India
        </p>

        <h1 className="relative z-20 isolate max-w-[22rem] text-balance text-[1.65rem] font-semibold leading-[1.2] tracking-tight text-white sm:max-w-4xl sm:text-4xl sm:leading-[1.15] lg:text-[2.35rem] lg:leading-[1.18] xl:text-[2.5rem]">
          {HERO_HEADLINE_WORDS.map((word, i) => (
            <span key={i}>
              <span
                className="hero-word-reveal inline-block"
                style={{ animationDelay: `${0.06 + i * 0.065}s` }}
              >
                <span className="inline-block bg-gradient-to-b from-white via-violet-100 to-electric bg-clip-text text-transparent">
                  {word}
                </span>
              </span>
              {i < HERO_HEADLINE_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
          Shoot on your phone—we handle composition, luxury lighting motifs, and
          scroll-stopping ad copy tuned for reels, PDPs, and performance
          catalogues.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            Trusted by 500+ D2C Brands
          </p>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold sm:text-xs">
            Limited Early Access — Join Free Today
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-9 sm:flex-row sm:gap-5">
          <div className="relative isolate inline-flex rounded-full">
            <span
              aria-hidden
              className="hero-cta-radiate absolute left-1/2 top-1/2 z-0 h-[calc(100%+36px)] w-[calc(100%+36px)] rounded-full sm:h-[calc(100%+44px)] sm:w-[calc(100%+44px)]"
            />
            <DashboardOrLoginLink
              hrefWhenAuthed="/dashboard"
              hrefWhenGuest="/dashboard"
              className="group relative z-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#7c3aed] via-violet-600 to-[#7c3aed] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_-6px_rgba(124,58,237,0.65)] transition-transform duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-[0.99]"
            >
              <span className="relative flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Start Generating
              </span>
            </DashboardOrLoginLink>
          </div>

          <DashboardOrLoginLink
            hrefWhenAuthed="/dashboard"
            hrefWhenGuest="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:border-electric/40 hover:bg-electric/15 hover:shadow-[0_0_28px_-8px_rgba(124,58,237,0.45)] active:scale-[0.99]"
          >
            Get Started
          </DashboardOrLoginLink>

          <Link
            href="/#pricing"
            className="text-sm font-medium text-zinc-400 underline-offset-4 transition hover:text-white hover:underline sm:ml-1"
          >
            View plans
          </Link>
        </div>

        <HeroStatsAnimated />
      </div>
    </section>
  );
}
