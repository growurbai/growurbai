import type Stripe from "stripe";
import { planIdFromStripePriceId, type SubscriptionPlanId } from "@/lib/stripe/plans";
import { upsertUserSubscription } from "@/lib/supabase/admin";

function planFromSubscription(
  subscription: Stripe.Subscription,
): SubscriptionPlanId | null {
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return null;
  return planIdFromStripePriceId(priceId);
}

function periodEndIso(subscription: Stripe.Subscription): string | null {
  const end = subscription.current_period_end;
  if (!end) return null;
  return new Date(end * 1000).toISOString();
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackUserId?: string,
): Promise<void> {
  const userId =
    subscription.metadata?.supabase_user_id?.trim() || fallbackUserId?.trim();
  if (!userId) {
    console.warn("Stripe subscription missing supabase_user_id metadata", {
      subscriptionId: subscription.id,
    });
    return;
  }

  const plan = planFromSubscription(subscription);
  if (!plan) {
    console.warn("Unknown Stripe price on subscription", {
      subscriptionId: subscription.id,
      priceId: subscription.items.data[0]?.price?.id,
    });
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  await upsertUserSubscription({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan,
    status: subscription.status,
    current_period_end: periodEndIso(subscription),
  });
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.supabase_user_id?.trim();
  if (!userId) {
    console.warn("Checkout session missing supabase_user_id", { sessionId: session.id });
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) return;

  const stripe = (await import("@/lib/stripe/server")).getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscriptionFromStripe(subscription, userId);
}

export async function markSubscriptionCanceled(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.supabase_user_id?.trim();
  if (!userId) return;

  const plan = planFromSubscription(subscription) ?? "growth_pro";
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  await upsertUserSubscription({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan,
    status: "canceled",
    current_period_end: periodEndIso(subscription),
  });
}
