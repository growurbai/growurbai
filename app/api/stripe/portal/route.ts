import { NextResponse } from "next/server";
import { getSiteUrl, getStripe } from "@/lib/stripe/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.warn("Stripe portal subscription lookup failed", subscriptionError.message);
    }

    const stripe = getStripe();
    let customerId =
      typeof subscription?.stripe_customer_id === "string" &&
      subscription.stripe_customer_id.trim().length > 0
        ? subscription.stripe_customer_id.trim()
        : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      try {
        const admin = createAdminSupabaseClient();
        const { error: upsertError } = await admin.from("subscriptions").upsert(
          {
            user_id: user.id,
            stripe_customer_id: customerId,
            plan: "free",
            status: "inactive",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (upsertError) {
          console.warn("Stripe portal customer persistence failed", upsertError.message);
        }
      } catch (persistErr) {
        console.warn("Stripe portal customer persistence unavailable", persistErr);
      }
    }

    const returnUrl =
      process.env.STRIPE_PORTAL_RETURN_URL?.trim() ||
      `${getSiteUrl()}/dashboard/settings`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create billing portal session.";
    console.error("Stripe portal error:", message);
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
