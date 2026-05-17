import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalSection } from "@/components/legal/LegalSection";
import {
  BRAND_NAME,
  FOUNDER_NAME,
  LEGAL_ENTITY_NAME,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
  supportEmail,
} from "@/lib/site-legal";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "How to cancel your Growurb AI subscription and our non-refundable payment policy for AI generation services.",
};

export default function RefundPage() {
  const email = supportEmail();

  return (
    <LegalPageShell
      title="Cancellation & Refund Policy"
      subtitle={`Clear rules for canceling your ${BRAND_NAME} subscription and how we handle payments for AI-powered generation services.`}
    >
      <LegalSection title="1. Overview">
        <p>
          This policy applies to subscriptions purchased through {BRAND_NAME} and processed by{" "}
          <strong className="text-zinc-300">Stripe</strong>. It supplements our{" "}
          <Link href="/terms" className="text-electric hover:underline">
            Terms of Service
          </Link>
          .
        </p>
        <p>
          {BRAND_NAME} is operated by <strong className="text-zinc-200">{FOUNDER_NAME}</strong>{" "}
          (Founder) under the business name{" "}
          <strong className="text-zinc-200">{LEGAL_ENTITY_NAME}</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Plans covered">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-300">7-Day Free Trial:</strong> may require a card on file;
            converts to a paid plan unless cancelled before the trial ends.
          </li>
          <li>
            <strong className="text-zinc-300">Growth Pro ($19/mo):</strong> recurring monthly
            subscription.
          </li>
          <li>
            <strong className="text-zinc-300">Agency ($49/mo):</strong> recurring monthly
            subscription.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cancellation — anytime">
        <p>
          <strong className="text-zinc-200">
            You may cancel your subscription at any time.
          </strong>{" "}
          Cancellation stops future billing renewals. You will generally retain access to paid
          features until the end of your current billing period, unless otherwise stated at
          cancellation.
        </p>
        <p>To cancel, use any of the following:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Email{" "}
            <a href={`mailto:${email}`} className="text-electric hover:underline">
              {email}
            </a>{" "}
            from your registered account address with the subject line “Cancel subscription”.
          </li>
          <li>
            Call or message us at{" "}
            <a href={SUPPORT_PHONE_HREF} className="text-electric hover:underline">
              {SUPPORT_PHONE}
            </a>
            .
          </li>
          <li>
            Submit our{" "}
            <Link href="/contact" className="text-electric hover:underline">
              contact form
            </Link>{" "}
            and select “Billing / cancellation”.
          </li>
          <li>
            When available, self-serve cancellation via the Stripe Customer Portal (link provided in
            account settings or by support).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Trial period">
        <p>
          If you start a 7-day free trial, you will not be charged until the trial ends provided you
          cancel before the trial expiration date shown at checkout or in your confirmation email.
          If you do not cancel, your selected plan will bill automatically at the advertised monthly
          USD rate.
        </p>
      </LegalSection>

      <LegalSection title="5. Refund policy — non-refundable payments">
        <p>
          <strong className="text-zinc-200">
            All subscription payments are final and non-refundable.
          </strong>
        </p>
        <p>
          {BRAND_NAME} delivers digital AI services that consume compute, API, and model resources
          immediately upon each generation. Once you run a generation—or once a paid billing period
          begins—those resources cannot be returned. For this reason:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We do not offer refunds for partial months, unused credits, change of mind, or
            dissatisfaction with a specific creative output.
          </li>
          <li>
            Cancelling your subscription prevents future charges but does not entitle you to a
            refund for the current or any prior billing period.
          </li>
          <li>
            Free-trial conversions and renewals are treated the same: payment confirms delivery of
            on-demand AI infrastructure for that period.
          </li>
        </ul>
        <p>
          The only exceptions we may consider (at our sole discretion and where required by
          applicable law) are verified duplicate charges or unauthorized transactions reported
          promptly with supporting evidence.
        </p>
      </LegalSection>

      <LegalSection title="6. Disputed charges">
        <p>
          Please contact us at{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>{" "}
          or{" "}
          <a href={SUPPORT_PHONE_HREF} className="text-electric hover:underline">
            {SUPPORT_PHONE}
          </a>{" "}
          before initiating a chargeback. Unwarranted chargebacks may result in account suspension
          pending investigation.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Billing questions:{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>
        </p>
        <p>
          <Link href="/privacy" className="text-electric hover:underline">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="text-electric hover:underline">
            Terms of Service
          </Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
