import type { User } from "@supabase/supabase-js";
import { GenerateApiError } from "@/lib/generate-api-errors";
import {
  FREE_TRIAL_DURATION_MS,
  TRIAL_EXPIRED_MESSAGE,
  type TrialStatusPayload,
} from "@/lib/free-trial-constants";
import {
  fetchSubscriptionSnapshot,
  isPaidSubscription,
  type SubscriptionSnapshot,
} from "@/lib/subscription-queries";
import { hookTrialExpiredEmail } from "@/lib/email-hooks";
import type { GenerationActor } from "@/lib/user-credits";

export function evaluateAccountTrial(
  accountCreatedAt: string | Date,
  hasPaidPlan: boolean,
  nowMs: number = Date.now(),
): Omit<TrialStatusPayload, "accountCreatedAt" | "hasPaidPlan" | "paidTier"> & {
  hasPaidPlan: boolean;
} {
  if (hasPaidPlan) {
    return {
      hasPaidPlan: true,
      expired: false,
      daysLeft: FREE_TRIAL_DURATION_MS / (24 * 60 * 60 * 1000),
      trialEndsAt: new Date(nowMs).toISOString(),
    };
  }

  const startMs = new Date(accountCreatedAt).getTime();
  const trialEndsAtMs = startMs + FREE_TRIAL_DURATION_MS;
  const elapsedMs = nowMs - startMs;
  const expired = elapsedMs > FREE_TRIAL_DURATION_MS;
  const remainingMs = trialEndsAtMs - nowMs;
  const daysLeft = expired
    ? 0
    : Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  return {
    hasPaidPlan: false,
    expired,
    daysLeft,
    trialEndsAt: new Date(trialEndsAtMs).toISOString(),
  };
}

export function buildTrialStatus(
  accountCreatedAt: string,
  subscription: SubscriptionSnapshot,
): TrialStatusPayload {
  const hasPaidPlan = isPaidSubscription(subscription);
  const evaluated = evaluateAccountTrial(accountCreatedAt, hasPaidPlan);
  const paidTier =
    hasPaidPlan &&
    subscription &&
    (subscription.plan === "growth_pro" || subscription.plan === "agency")
      ? (subscription.plan as "growth_pro" | "agency")
      : null;
  return {
    accountCreatedAt,
    hasPaidPlan: evaluated.hasPaidPlan,
    paidTier,
    expired: evaluated.expired,
    daysLeft: evaluated.daysLeft,
    trialEndsAt: evaluated.trialEndsAt,
  };
}

export async function getTrialStatusForUser(
  userId: string,
  accountCreatedAt: string,
): Promise<TrialStatusPayload> {
  const subscription = await fetchSubscriptionSnapshot(userId);
  return buildTrialStatus(accountCreatedAt, subscription);
}

export async function getTrialStatusForAuthUser(
  user: Pick<User, "id" | "created_at">,
): Promise<TrialStatusPayload> {
  const createdAt = user.created_at ?? new Date().toISOString();
  return getTrialStatusForUser(user.id, createdAt);
}

export function assertFreeTrialAllowsGeneration(
  trial: Pick<TrialStatusPayload, "hasPaidPlan" | "expired">,
): void {
  if (trial.hasPaidPlan || !trial.expired) return;
  throw new GenerateApiError("TRIAL_EXPIRED", TRIAL_EXPIRED_MESSAGE, 403);
}

/** Enforce 7-day account trial before generation (paid plans bypass). */
export async function assertGenerationTrialAllowed(
  actor: GenerationActor,
  accountCreatedAt: string,
): Promise<TrialStatusPayload> {
  if (actor.useMockLedger) {
    return buildTrialStatus(accountCreatedAt, null);
  }

  const trial = await getTrialStatusForUser(actor.userId, accountCreatedAt);
  if (!trial.hasPaidPlan && trial.expired) {
    hookTrialExpiredEmail(actor.userId);
  }
  assertFreeTrialAllowsGeneration(trial);
  return trial;
}
