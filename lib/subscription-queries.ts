import type { SubscriptionPlanId } from "@/lib/stripe/plans";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type SubscriptionSnapshot = {
  plan: string;
  status: string;
} | null;

const PAID_PLANS: SubscriptionPlanId[] = ["growth_pro", "agency"];

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

export function isPaidSubscription(snapshot: SubscriptionSnapshot): boolean {
  if (!snapshot) return false;
  if (!PAID_PLANS.includes(snapshot.plan as SubscriptionPlanId)) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.has(snapshot.status);
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
      console.warn("subscriptions read failed", error.message);
      return null;
    }
    if (!data) return null;
    return { plan: String(data.plan), status: String(data.status) };
  } catch (err) {
    console.warn("subscriptions admin unavailable", err);
    return null;
  }
}
