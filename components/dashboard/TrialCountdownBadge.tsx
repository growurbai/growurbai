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

  if (!trial || trial.hasPaidPlan) return null;

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
