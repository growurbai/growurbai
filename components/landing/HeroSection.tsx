import Link from "next/link";
import { DashboardOrLoginLink } from "@/components/auth/DashboardOrLoginLink";
import { HeroStatsAnimated } from "@/components/landing/HeroStatsAnimated";

const HERO_HEADLINE_WORDS =
  "Transform Your Product Photo Into a High-End Brand Ad in 60 Seconds".split(
    " ",
  );

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
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

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          For D2C & Instagram sellers in India
        </p>

        <h1 className="relative z-20 isolate text-[2rem] font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-[1.1] lg:text-6xl">
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

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Shoot on your phone—we handle composition, luxury lighting motifs, and
          scroll-stopping ad copy tuned for reels, PDPs, and performance
          catalogues.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <div className="relative isolate inline-flex rounded-full">
            <span
              aria-hidden
              className="hero-cta-radiate absolute left-1/2 top-1/2 z-0 h-[calc(100%+36px)] w-[calc(100%+36px)] rounded-full sm:h-[calc(100%+44px)] sm:w-[calc(100%+44px)]"
            />
            <DashboardOrLoginLink
              className="group relative z-10 inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99]"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-electric via-violet-500 to-electric bg-[length:200%_100%] animate-shimmer transition-all duration-500 group-hover:opacity-95"
              />
              <span className="absolute inset-px rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-60" />
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload your product photo
              </span>
            </DashboardOrLoginLink>
          </div>

          <Link
            href="/#pricing"
            className="text-sm font-medium text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
          >
            View plans
          </Link>
        </div>

        <HeroStatsAnimated />
      </div>
    </section>
  );
}
