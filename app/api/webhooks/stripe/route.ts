import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaymentSucceeded,
} from "@/lib/stripe/webhook-handlers";

export const runtime = "nodejs";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "invoice.payment_succeeded",
]);

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      console.error("[api/webhooks/stripe] STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.warn("[api/webhooks/stripe] Missing stripe-signature header");
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    const rawBody = await req.text();

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid signature";
      console.error("[api/webhooks/stripe] Signature verification failed:", message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!HANDLED_EVENTS.has(event.type)) {
      console.info("[api/webhooks/stripe] Unhandled event skipped", { type: event.type });
      return NextResponse.json({ received: true, skipped: event.type });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          await handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        }
        case "invoice.payment_succeeded": {
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        }
        default: {
          console.warn("[api/webhooks/stripe] Unsupported handled event", {
            type: event.type,
          });
          return NextResponse.json(
            { error: `Unsupported webhook event: ${event.type}` },
            { status: 501 },
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook handler failed";
      console.error(`[api/webhooks/stripe] ${event.type} handler error:`, message);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook route failed";
    console.error("[api/webhooks/stripe] Route failure:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
