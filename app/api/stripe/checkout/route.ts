import { NextResponse } from "next/server";
import {
  getStripePriceId,
  isSubscriptionPlanId,
  planIdFromStripePriceId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";
import { getSiteUrl, getStripe } from "@/lib/stripe/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CheckoutBody = {
  plan?: string;
  planId?: string;
  priceId?: string;
};

function routeErrorResponse(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Checkout failed";
  console.error(`[api/stripe/checkout] ${context}:`, message);
  const status = message.includes("not configured") ? 503 : 500;
  return NextResponse.json({ error: message }, { status });
}

function resolvePlanId(body: CheckoutBody): SubscriptionPlanId | null {
  const candidates = [body.planId, body.plan, body.priceId]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (isSubscriptionPlanId(candidate)) {
      return candidate;
    }
    const fromPrice = planIdFromStripePriceId(candidate);
    if (fromPrice) {
      return fromPrice;
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[api/stripe/checkout] Unauthorized access blocked", authError?.message);
      return NextResponse.json({ error: "Unauthorized access blocked" }, { status: 401 });
    }

    let body: CheckoutBody;
    try {
      body = (await req.json()) as CheckoutBody;
    } catch (error) {
      console.warn("[api/stripe/checkout] Invalid JSON body", error);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const planId = resolvePlanId(body);
    if (!planId) {
      return NextResponse.json(
        { error: 'Invalid plan. Use planId "growth_pro" or "agency", or a configured Stripe priceId.' },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const priceId = getStripePriceId(planId);
    const siteUrl = getSiteUrl();

    const { data: existing, error: subLookupError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subLookupError) {
      console.warn("Stripe checkout subscription lookup failed", subLookupError.message);
    }

    let customerId =
      existing?.stripe_customer_id && String(existing.stripe_customer_id).trim().length > 0
        ? String(existing.stripe_customer_id)
        : undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      const { error: upsertError } = await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          plan: planId,
          status: "inactive",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (upsertError) {
        console.warn("Stripe checkout customer persistence failed", upsertError.message);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/#pricing?checkout=canceled`,
      metadata: {
        userId: user.id,
        supabase_user_id: user.id,
        plan: planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          supabase_user_id: user.id,
          plan: planId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return routeErrorResponse("Unhandled checkout failure", error);
  }
}
