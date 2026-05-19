import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";

export type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlanId | "trial" | "free";
  status: string;
  current_period_end: string | null;
  updated_at?: string;
};

let adminClient: SupabaseClient | null = null;

/** Service-role client — server/webhooks only. Never expose to the browser. */
export function createAdminSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for billing webhooks",
    );
  }
  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export async function upsertUserSubscription(row: SubscriptionRow): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: row.user_id,
      stripe_customer_id: row.stripe_customer_id,
      stripe_subscription_id: row.stripe_subscription_id,
      plan: row.plan,
      status: row.status,
      current_period_end: row.current_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    throw new Error(`Failed to upsert subscription: ${error.message}`);
  }
}

export async function getSubscriptionByUserId(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load subscription: ${error.message}`);
  }
  return data;
}

/** Upsert generation credit balance (Stripe webhooks / renewals). */
export async function upsertUserCreditsBalance(
  userId: string,
  balance: number,
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("user_credits").upsert(
    {
      user_id: userId,
      balance: Math.max(0, Math.floor(balance)),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    throw new Error(`Failed to upsert user_credits: ${error.message}`);
  }
}

export async function upsertUserProfileBillingState(params: {
  userId: string;
  planType: string;
  subscriptionStatus: string;
}): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: params.userId,
      plan_type: params.planType,
      subscription_status: params.subscriptionStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    throw new Error(`Failed to upsert profile billing state: ${error.message}`);
  }
}
