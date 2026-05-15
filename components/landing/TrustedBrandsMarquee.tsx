const BRANDS = [
  "Kanvas Skincare",
  "Loom Threads",
  "Colaba Social Lab",
  "Zara Dupes",
  "Glow Republic",
  "Bombay Botanics",
  "Delhi Drops",
  "Meesho Sellers",
  "Insta Commerce",
  "D2C Founders Club",
] as const;

const pillClassName =
  "inline-flex shrink-0 items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.09]";

export function TrustedBrandsMarquee() {
  return (
    <section
      className="relative border-t border-white/[0.06] bg-gradient-to-b from-black/40 to-black/25 py-12 sm:py-14"
      aria-labelledby="trusted-brands-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />

      <h2
        id="trusted-brands-heading"
        className="mb-10 text-center text-sm font-semibold tracking-[0.28em] text-gold [font-variant:small-caps] sm:mb-11 sm:text-[0.8125rem]"
      >
        Trusted by 500+ Growing Brands
      </h2>

      <div className="trusted-marquee-mask relative mx-auto w-full max-w-6xl px-0 sm:px-2">
        <div className="trusted-marquee-track flex w-max gap-4 will-change-transform">
          <div className="flex shrink-0 items-center gap-4 pr-4" role="list">
            {BRANDS.map((name) => (
              <span key={`a-${name}`} role="listitem" className={pillClassName}>
                {name}
              </span>
            ))}
          </div>
          <div
            className="flex shrink-0 items-center gap-4 pr-4"
            aria-hidden
            role="presentation"
          >
            {BRANDS.map((name) => (
              <span key={`b-${name}`} className={pillClassName}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
