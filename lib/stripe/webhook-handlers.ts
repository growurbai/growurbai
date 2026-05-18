import type Stripe from "stripe";
import { hookPaymentSuccessEmail } from "@/lib/email-hooks";
import { getAuthUserContact } from "@/lib/email-user";
import { planIdFromStripePriceId, type SubscriptionPlanId } from "@/lib/stripe/plans";
import {
  creditCapForPaidPlan,
  isActivePaidStripeStatus,
} from "@/lib/subscription-tier";
import { upsertUserCreditsBalance, upsertUserSubscription } from "@/lib/supabase/admin";

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

/**
 * After a paid subscription is active/trialing/past_due, set user credit pool to tier cap
 * (500 Growth Pro, 5000 Agency). Idempotent on each sync / renewal.
 */
export async function provisionCreditsForStripeSubscription(
  subscription: Stripe.Subscription,
  userId: string,
): Promise<void> {
  const plan = planFromSubscription(subscription);
  if (!plan || !isActivePaidStripeStatus(subscription.status)) {
    return;
  }
  const cap = creditCapForPaidPlan(plan);
  await upsertUserCreditsBalance(userId, cap);
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

  await provisionCreditsForStripeSubscription(subscription, userId);
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

/** Renewals and successful subscription invoices — refresh DB + credit pool. */
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subRef = invoice.subscription;
  const subscriptionId =
    typeof subRef === "string" ? subRef : subRef?.id ?? null;
  if (!subscriptionId) return;

  const stripe = (await import("@/lib/stripe/server")).getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscriptionFromStripe(subscription);

  const userId = subscription.metadata?.supabase_user_id?.trim();
  const plan = planFromSubscription(subscription);
  if (!userId || !plan || !isActivePaidStripeStatus(subscription.status)) {
    return;
  }

  let userEmail = invoice.customer_email?.trim() ?? null;
  let userName: string | undefined;

  if (!userEmail) {
    const contact = await getAuthUserContact(userId);
    if (contact) {
      userEmail = contact.email;
      userName = contact.name;
    }
  }

  if (!userEmail) {
    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          userEmail = customer.email;
        }
      } catch (err) {
        console.warn("Could not load Stripe customer email for receipt", err);
      }
    }
  }

  if (!userEmail) return;

  hookPaymentSuccessEmail({
    userId,
    userEmail,
    userName,
    planId: plan,
    invoiceId: invoice.id,
  });
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
