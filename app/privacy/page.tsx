import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalSection } from "@/components/legal/LegalSection";
import {
  BRAND_NAME,
  FOUNDER_NAME,
  LEGAL_ADDRESS,
  LEGAL_ENTITY_NAME,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
  supportEmail,
} from "@/lib/site-legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Growurb AI collects, uses, stores, and protects your personal data and product images.",
};

export default function PrivacyPage() {
  const email = supportEmail();

  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle={`This policy explains how ${BRAND_NAME} (“we”, “us”, “our”) handles personal information when you use our website, studio, and subscription services.`}
    >
      <LegalSection title="1. Who we are">
        <p>
          <strong className="text-zinc-200">{BRAND_NAME}</strong> is operated by{" "}
          <strong className="text-zinc-200">{FOUNDER_NAME}</strong> (Founder), trading as{" "}
          <strong className="text-zinc-200">{LEGAL_ENTITY_NAME}</strong>.
        </p>
        <p>
          <strong className="text-zinc-300">Registered business address:</strong>{" "}
          {LEGAL_ADDRESS}
        </p>
        <p>
          <strong className="text-zinc-300">Privacy contact:</strong>{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>
          {" · "}
          <a href={SUPPORT_PHONE_HREF} className="text-electric hover:underline">
            {SUPPORT_PHONE}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-300">Account data:</strong> name, email address, and
            authentication identifiers when you sign up via Supabase Auth (including Google OAuth
            where enabled).
          </li>
          <li>
            <strong className="text-zinc-300">Product & brand assets:</strong> images you upload
            for AI generation, optional brand logos stored in Supabase Storage, and metadata
            associated with your account.
          </li>
          <li>
            <strong className="text-zinc-300">Billing data:</strong> subscription status, plan
            tier, and Stripe customer identifiers. Payment card details are collected and processed
            directly by Stripe—we do not store full card numbers on our servers.
          </li>
          <li>
            <strong className="text-zinc-300">Usage & technical data:</strong> IP address, browser
            type, device information, and logs necessary to operate, secure, and improve the
            service.
          </li>
          <li>
            <strong className="text-zinc-300">Support communications:</strong> messages you send via
            our contact form, email, or WhatsApp.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide AI product-photo transformation, ad layouts, and marketing copy generation.</li>
          <li>Authenticate you, maintain your account, and enforce plan limits.</li>
          <li>Process subscriptions and invoices through Stripe.</li>
          <li>Respond to support requests and improve product quality.</li>
          <li>Detect abuse, fraud, and security incidents.</li>
          <li>Comply with applicable law, tax, and regulatory obligations in India and other jurisdictions where we operate.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Secure storage with Supabase">
        <p>
          We use <strong className="text-zinc-300">Supabase</strong> (hosted PostgreSQL database,
          authentication, and object storage) as our primary infrastructure for account data and
          user-uploaded brand assets. Data is transmitted over HTTPS/TLS. Access to production
          systems is restricted to authorized personnel.
        </p>
        <p>
          Product images submitted for generation are processed to deliver your requested outputs.
          We do not sell your uploads to third parties. Retention periods for uploads and generated
          assets may depend on your plan and operational backups—contact us if you need deletion
          assistance.
        </p>
      </LegalSection>

      <LegalSection title="5. Third-party processors">
        <p>We share limited data with service providers who help us run {BRAND_NAME}, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-300">Supabase</strong> — authentication, database, and
            file storage.
          </li>
          <li>
            <strong className="text-zinc-300">Stripe</strong> — payment processing and subscription
            management.
          </li>
          <li>
            <strong className="text-zinc-300">OpenAI</strong> — vision analysis and image generation
            for your uploaded product photos (processed per their API terms).
          </li>
          <li>
            <strong className="text-zinc-300">Hosting providers</strong> (e.g. Vercel) — application
            delivery and edge infrastructure.
          </li>
        </ul>
        <p>
          These providers process data under contractual safeguards and only as needed to perform
          services on our behalf.
        </p>
      </LegalSection>

      <LegalSection title="6. International transfers">
        <p>
          Your data may be processed in India and in other countries where our subprocessors
          maintain facilities (including the United States). Where required, we rely on appropriate
          safeguards such as standard contractual clauses or equivalent mechanisms.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights & choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>Access, correct, or update account information in Settings.</li>
          <li>Request deletion of your account and associated data, subject to legal retention requirements.</li>
          <li>Opt out of non-essential marketing emails (transactional emails may still be sent).</li>
          <li>Withdraw consent where processing is consent-based, without affecting prior lawful processing.</li>
        </ul>
        <p>
          Indian users may have rights under applicable law including the Digital Personal Data
          Protection Act, 2023. To exercise rights, email{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies & analytics">
        <p>
          We use essential cookies and local storage to keep you signed in and remember preferences.
          If we enable analytics cookies in the future, we will update this policy and provide
          controls where required.
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>
          {BRAND_NAME} is not directed at children under 18. We do not knowingly collect personal
          information from minors. Contact us if you believe a minor has provided data.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes & contact">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be posted on
          this page with an updated “Last updated” date. Continued use after changes constitutes
          acceptance.
        </p>
        <p>
          Questions:{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>{" "}
          · <Link href="/contact" className="text-electric hover:underline">Contact form</Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
