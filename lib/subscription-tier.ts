import type { TrialStatusPayload } from "@/lib/free-trial-constants";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";
import { DEFAULT_GENERATION_CREDITS } from "@/lib/user-credits-constants";

/** Credits provisioned when Growth Pro subscription is active (paid). */
export const GROWTH_PRO_CREDIT_CAP = 500;

/** Credits provisioned for Agency tier (high-volume pool; UI may show “unlimited”). */
export const AGENCY_CREDIT_CAP = 5000;

export type DbSubscriptionPlan = SubscriptionPlanId | "trial" | "free";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

export function isActivePaidStripeStatus(status: string): boolean {
  return ACTIVE.has(status);
}

export function creditCapForPaidPlan(plan: SubscriptionPlanId): number {
  return plan === "agency" ? AGENCY_CREDIT_CAP : GROWTH_PRO_CREDIT_CAP;
}

/** Active paid Agency: no per-generation credit deduction (priority / “unlimited” lane). */
export function agencySkipsPerGenerationCreditDeduction(
  plan: string,
  stripeStatus: string,
): boolean {
  return plan === "agency" && isActivePaidStripeStatus(stripeStatus);
}

export function trialOrFreeCreditCap(): number {
  return DEFAULT_GENERATION_CREDITS;
}

export function creditsCapForDashboard(trial: TrialStatusPayload): number {
  if (trial.hasPaidPlan && trial.paidTier === "growth_pro") {
    return GROWTH_PRO_CREDIT_CAP;
  }
  if (trial.hasPaidPlan && trial.paidTier === "agency") {
    return AGENCY_CREDIT_CAP;
  }
  return trialOrFreeCreditCap();
}
