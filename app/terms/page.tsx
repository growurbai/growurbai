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
  title: "Terms of Service",
  description:
    "Terms and conditions for using Growurb AI, including subscriptions and intellectual property for AI-generated content.",
};

export default function TermsPage() {
  const email = supportEmail();

  return (
    <LegalPageShell
      title="Terms of Service"
      subtitle={`Please read these Terms carefully before using ${BRAND_NAME}. By accessing or using our services, you agree to be bound by this agreement.`}
    >
      <LegalSection title="1. Agreement & operator">
        <p>
          These Terms of Service (“Terms”) govern your access to the {BRAND_NAME} website, studio,
          APIs, and related services (collectively, the “Service”) operated by{" "}
          <strong className="text-zinc-200">{FOUNDER_NAME}</strong> (Founder) under the business name{" "}
          <strong className="text-zinc-200">{LEGAL_ENTITY_NAME}</strong> (“we”, “us”).
        </p>
        <p>
          <strong className="text-zinc-300">Business address:</strong> {LEGAL_ADDRESS}
        </p>
        <p>
          <strong className="text-zinc-300">Support:</strong>{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>
          {" · "}
          <a href={SUPPORT_PHONE_HREF} className="text-electric hover:underline">
            {SUPPORT_PHONE}
          </a>
        </p>
        <p>
          If you do not agree, do not use the Service. If you use the Service on behalf of a company,
          you represent that you have authority to bind that entity.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility & accounts">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must be at least 18 years old and capable of forming a binding contract.</li>
          <li>You are responsible for safeguarding login credentials and all activity under your account.</li>
          <li>You must provide accurate registration information and keep it updated.</li>
          <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Subscriptions & billing">
        <p>
          Paid plans (e.g. Growth Pro, Agency) are billed in USD through Stripe on a recurring
          monthly basis unless stated otherwise. Prices are shown on our{" "}
          <Link href="/#pricing" className="text-electric hover:underline">
            pricing page
          </Link>
          .
        </p>
        <p>
          Free trials may require a valid payment method. You authorize us and Stripe to charge
          applicable fees after any trial period ends unless you cancel beforehand. See our{" "}
          <Link href="/refund" className="text-electric hover:underline">
            Cancellation & Refund Policy
          </Link>{" "}
          for cancellation rules.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Upload content you do not have rights to use (counterfeit goods, stolen imagery, etc.).</li>
          <li>Generate illegal, deceptive, harassing, or infringing materials.</li>
          <li>Reverse engineer, scrape, or overload the Service except as permitted by law.</li>
          <li>Resell or sublicense the Service without written permission.</li>
          <li>Circumvent usage limits, watermarks (where applicable), or security controls.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Your content & uploads">
        <p>
          You retain ownership of product photos, logos, and other materials you upload (“User
          Content”). You grant {BRAND_NAME} a worldwide, non-exclusive, royalty-free license to host,
          process, reproduce, and display User Content solely to operate and improve the Service,
          including sending images to AI providers for generation.
        </p>
        <p>
          You represent that you have all rights necessary for us to process User Content and that
          it does not violate third-party rights or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="6. AI-generated outputs & intellectual property">
        <p>
          Subject to your compliance with these Terms and payment of applicable fees:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-300">Commercial use:</strong> You receive a non-exclusive,
            worldwide license to use, reproduce, modify, and publish AI-generated layouts, images,
            and ad copy produced for your account in connection with your own products and marketing
            (websites, marketplaces, paid ads, social media, etc.).
          </li>
          <li>
            <strong className="text-zinc-300">No exclusivity:</strong> Similar outputs may be
            generated for other users. We do not guarantee uniqueness across the platform.
          </li>
          <li>
            <strong className="text-zinc-300">Third-party rights:</strong> You are responsible for
            ensuring final creatives do not infringe trademarks, copyrights, or publicity rights of
            others. AI may suggest text or visuals—you must review before publication.
          </li>
          <li>
            <strong className="text-zinc-300">Platform IP:</strong> {BRAND_NAME} retains all rights in the
            Service, software, models, workflows, templates, and branding. No rights are granted
            except as expressly stated.
          </li>
          <li>
            <strong className="text-zinc-300">Trial / watermarked outputs:</strong> Free or trial
            tiers may include watermarks or usage restrictions until you upgrade.
          </li>
        </ul>
        <p>
          Nothing in these Terms transfers ownership of underlying AI model weights or our
          proprietary systems to you.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimers">
        <p>
          THE SERVICE AND AI OUTPUTS ARE PROVIDED “AS IS” AND “AS AVAILABLE.” WE DO NOT WARRANT
          UNINTERRUPTED OPERATION, ERROR-FREE GENERATION, OR THAT OUTPUTS WILL MEET REGULATORY,
          PLATFORM, OR ADVERTISING POLICY REQUIREMENTS. YOU USE OUTPUTS AT YOUR OWN RISK.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {BRAND_NAME.toUpperCase()} AND ITS AFFILIATES SHALL NOT BE LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS/REVENUE.
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE SHALL NOT EXCEED THE GREATER OF
          (A) AMOUNTS YOU PAID US IN THE TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) USD $100.
        </p>
      </LegalSection>

      <LegalSection title="9. Indemnity">
        <p>
          You will defend and indemnify {BRAND_NAME} against claims arising from your User Content, your
          use of outputs, or your violation of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law & disputes">
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-law rules.
          Courts in Mumbai, Maharashtra shall have exclusive jurisdiction, subject to mandatory
          consumer protections that cannot be waived.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes & contact">
        <p>
          We may modify these Terms by posting an updated version. Material changes will be
          communicated where reasonably practicable. Continued use constitutes acceptance.
        </p>
        <p>
          Contact:{" "}
          <a href={`mailto:${email}`} className="text-electric hover:underline">
            {email}
          </a>{" "}
          · <Link href="/contact" className="text-electric hover:underline">Contact page</Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
