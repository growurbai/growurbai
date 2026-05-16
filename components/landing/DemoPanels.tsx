"use client";

import Image from "next/image";
import {
  DEMO_AD_MARBLE_SRC,
  DEMO_BEFORE_SRC,
  DEMO_BRAND,
  DEMO_TAGLINE,
} from "@/components/landing/demo-product";

type PanelProps = {
  sizes: string;
  className?: string;
};

type BeforePanelProps = PanelProps & {
  label?: string;
};

/** Image D — plain raw product photo, full bleed */
export function DemoBeforePanel({
  sizes,
  label,
  className = "",
}: BeforePanelProps) {
  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      <Image
        src={DEMO_BEFORE_SRC}
        alt="Raw mobile product photo — cactus and skincare tube on a plain background"
        fill
        className="object-cover object-center"
        sizes={sizes}
        priority
      />
      {label ? (
        <p className="absolute bottom-3 left-3 z-10 rounded-md border border-zinc-400/40 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-800 backdrop-blur-sm">
          {label}
        </p>
      ) : null}
    </div>
  );
}

type AdFillProps = PanelProps & {
  src: string;
  alt: string;
  priority?: boolean;
};

/** Premium ad image — full bleed, object-cover */
export function DemoAdFill({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: AdFillProps) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}

/** Watch The Magic — right panel: full ad + brand overlay on image */
export function DemoAdHeroPanel({ sizes, className = "" }: PanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#7c3aed]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
    >
      <Image
        src={DEMO_AD_MARBLE_SRC}
        alt="AI generated luxury marble studio skincare advertisement"
        fill
        className="object-cover object-center"
        sizes={sizes}
        priority
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/10"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-4 pb-5 pt-16 text-center sm:gap-2.5 sm:pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold sm:text-xs">
          {DEMO_BRAND}
        </p>
        <p className="max-w-[16rem] text-base font-semibold leading-snug tracking-tight text-white sm:max-w-xs sm:text-lg">
          {DEMO_TAGLINE}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#7c3aed] to-violet-700 px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_28px_rgba(124,58,237,0.55)] sm:text-sm">
          Shop Now
          <span aria-hidden>→</span>
        </span>
      </div>

      <p className="absolute right-3 top-3 z-10 rounded-md border border-[#7c3aed]/40 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-100 backdrop-blur-md">
        AI Generated Ad
      </p>
    </div>
  );
}
