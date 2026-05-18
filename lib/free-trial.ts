import type { User } from "@supabase/supabase-js";
import { GenerateApiError } from "@/lib/generate-api-errors";
import {
  FREE_TRIAL_DURATION_MS,
  TRIAL_EXPIRED_MESSAGE,
  type TrialStatusPayload,
} from "@/lib/free-trial-constants";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";
import type { GenerationActor } from "@/lib/user-credits";

const PAID_PLANS: SubscriptionPlanId[] = ["growth_pro", "agency"];

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

type SubscriptionSnapshot = {
  plan: string;
  status: string;
} | null;

export function isPaidSubscription(snapshot: SubscriptionSnapshot): boolean {
  if (!snapshot) return false;
  if (!PAID_PLANS.includes(snapshot.plan as SubscriptionPlanId)) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.has(snapshot.status);
}

export function evaluateAccountTrial(
  accountCreatedAt: string | Date,
  hasPaidPlan: boolean,
  nowMs: number = Date.now(),
): Omit<TrialStatusPayload, "accountCreatedAt" | "hasPaidPlan"> & {
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
  return {
    accountCreatedAt,
    hasPaidPlan: evaluated.hasPaidPlan,
    expired: evaluated.expired,
    daysLeft: evaluated.daysLeft,
    trialEndsAt: evaluated.trialEndsAt,
  };
}

export async function fetchSubscriptionSnapshot(
  userId: string,
): Promise<SubscriptionSnapshot> {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("subscriptions read failed for trial check", error.message);
      return null;
    }
    if (!data) return null;
    return { plan: String(data.plan), status: String(data.status) };
  } catch (err) {
    console.warn("subscriptions admin unavailable for trial check", err);
    return null;
  }
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
  assertFreeTrialAllowsGeneration(trial);
  return trial;
}
