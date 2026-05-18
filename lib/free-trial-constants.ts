/** Account-age free trial length (auth.users.created_at). */
export const FREE_TRIAL_DURATION_DAYS = 7;

export const FREE_TRIAL_DURATION_MS = FREE_TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const TRIAL_EXPIRED_MESSAGE =
  "Your 7-day free trial has expired. Upgrade to GrowUrb Pro to resume 8K catalog generation.";

export type TrialStatusPayload = {
  /** User is on a paid Stripe plan — trial window does not apply. */
  hasPaidPlan: boolean;
  /** Trial window elapsed and user has no paid plan. */
  expired: boolean;
  /** Whole days remaining in the trial (0 when expired). */
  daysLeft: number;
  /** ISO timestamp when the account trial ends. */
  trialEndsAt: string;
  /** Account creation timestamp from Supabase auth. */
  accountCreatedAt: string;
};
