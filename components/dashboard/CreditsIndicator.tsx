"use client";

import { useMemo } from "react";

type CreditsIndicatorProps = {
  creditsRemaining: number;
  /** Max credits for progress bar (500 Pro, 5000 Agency pool, 47 trial default). */
  creditsCap: number;
  /** Agency paid: show unlimited-style headline and full bar. */
  unlimitedMeter?: boolean;
  /** Short plan name for dropdown header. */
  tierLabel: string;
  /** Secondary line under plan (trial end or billing note). */
  subtitle: string;
};

export function CreditsIndicator({
  creditsRemaining,
  creditsCap,
  unlimitedMeter = false,
  tierLabel,
  subtitle,
}: CreditsIndicatorProps) {
  const remainingPercent = useMemo(() => {
    if (unlimitedMeter || creditsCap <= 0) return 100;
    return Math.min(100, Math.round((creditsRemaining / creditsCap) * 100));
  }, [creditsRemaining, creditsCap, unlimitedMeter]);

  const buttonLabel = unlimitedMeter
    ? "Unlimited access"
    : `${creditsRemaining} / ${creditsCap} credits left`;

  return (
    <div className="group/credits relative">
      <button
        type="button"
        className="inline-flex cursor-default items-center rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium tabular-nums text-zinc-300 backdrop-blur-md transition hover:border-electric/35 hover:bg-white/[0.08] hover:text-white"
        aria-haspopup="true"
        aria-label={
          unlimitedMeter
            ? "Unlimited catalogue generation on Agency plan."
            : `${creditsRemaining} of ${creditsCap} credits remaining. Hover for plan details.`
        }
      >
        {buttonLabel}
      </button>

      <div
        className="credits-dropdown pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 translate-y-1 rounded-xl border border-white/10 bg-black/80 p-4 opacity-0 shadow-2xl backdrop-blur-md transition-[opacity,transform] duration-300 ease-out group-hover/credits:pointer-events-auto group-hover/credits:translate-y-0 group-hover/credits:opacity-100 group-focus-within/credits:pointer-events-auto group-focus-within/credits:translate-y-0 group-focus-within/credits:opacity-100"
        role="region"
        aria-label="Credit balance details"
      >
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Current plan
            </p>
            <span className="credits-plan-tag inline-flex max-w-full items-center rounded-lg border border-gold/30 bg-gradient-to-r from-gold/15 via-electric/20 to-electric/10 px-2.5 py-1 text-[11px] font-semibold leading-snug">
              {tierLabel}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-zinc-500">
            <span className="font-medium text-zinc-400">Billing / trial:</span> {subtitle}
          </p>

          <div className="space-y-2 pt-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Credits
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-zinc-200">
                {unlimitedMeter ? (
                  <>
                    <span className="text-violet-200">Unlimited</span>
                    <span className="ml-1 text-[10px] font-medium text-zinc-500">Agency lane</span>
                  </>
                ) : (
                  <>
                    {creditsRemaining}
                    <span className="font-normal text-zinc-500">/{creditsCap}</span>
                    <span className="ml-1 text-[10px] font-medium text-zinc-500">left</span>
                  </>
                )}
              </span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/[0.06]"
              role="progressbar"
              aria-valuenow={unlimitedMeter ? 100 : creditsRemaining}
              aria-valuemin={0}
              aria-valuemax={unlimitedMeter ? 100 : creditsCap}
              aria-label={
                unlimitedMeter
                  ? "Unlimited Agency generation"
                  : `${creditsRemaining} of ${creditsCap} credits remaining`
              }
            >
              <div
                className="credits-progress-fill h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-[width] duration-500"
                style={{ width: `${remainingPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-600">
              {unlimitedMeter
                ? "Priority throughput — no per-run credit decrement."
                : `${remainingPercent}% of plan allowance remaining`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
