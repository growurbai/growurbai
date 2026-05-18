"use client";

import type { TrialStatusPayload } from "@/lib/free-trial-constants";

type TrialCountdownBadgeProps = {
  trial: TrialStatusPayload | null;
  loading?: boolean;
};

export function TrialCountdownBadge({ trial, loading }: TrialCountdownBadgeProps) {
  if (loading) {
    return (
      <span
        className="inline-block h-6 w-24 animate-pulse rounded-full bg-white/10"
        aria-hidden
      />
    );
  }

  if (!trial) return null;

  if (trial.hasPaidPlan && trial.paidTier === "growth_pro") {
    return (
      <span
        className="inline-flex items-center rounded-full border border-cyan-400/50 bg-gradient-to-r from-violet-500/20 via-electric/25 to-cyan-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100 shadow-[0_0_24px_-6px_rgba(34,211,238,0.45)]"
        role="status"
      >
        Pro Member <span aria-hidden>💎</span>
      </span>
    );
  }

  if (trial.hasPaidPlan && trial.paidTier === "agency") {
    return (
      <span
        className="inline-flex items-center rounded-full border border-amber-400/45 bg-gradient-to-r from-amber-500/15 via-violet-600/25 to-fuchsia-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-100 shadow-[0_0_28px_-6px_rgba(251,191,36,0.4)]"
        role="status"
      >
        Agency Partner <span aria-hidden>👑</span>
      </span>
    );
  }

  if (trial.expired) {
    return (
      <span
        className="trial-badge-expired inline-flex items-center gap-1 rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-300 shadow-[0_0_20px_-6px_rgba(248,113,113,0.55)]"
        role="status"
      >
        Trial Expired <span aria-hidden>⚠️</span>
      </span>
    );
  }

  const dayLabel = trial.daysLeft === 1 ? "day" : "days";

  return (
    <span
      className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90"
      role="status"
    >
      Trial: {trial.daysLeft} {dayLabel} left
    </span>
  );
}
