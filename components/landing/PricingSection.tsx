"use client";

import Link from "next/link";
import { PricingTierButton } from "@/components/billing/PricingTierButton";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";

const plans = [
  {
    name: "7-Day Free Trial",
    price: "Free",
    period: "",
    description:
      "Experience the full studio workflow risk-free for 7 days. Credit card required to start.",
    features: [
      "5 high-res trial generations",
      "Watermarked exports",
      "Basic ad copy",
    ],
    cta: "Start Free Trial",
    ctaKind: "signup" as const,
    highlighted: false,
  },
  {
    name: "Growth Pro",
    price: "$19",
    period: "/mo",
    description:
      "Scale weekly drops with watermark-free assets and omni-channel copy built for global markets.",
    features: [
      "50 generations / month",
      "No watermark",
      "Full omni-channel ad copy",
      "Priority support",
    ],
    cta: "Choose Tier",
    ctaKind: "checkout" as const,
    planId: "growth_pro" as SubscriptionPlanId,
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Agency",
    price: "$49",
    period: "/mo",
    description: "For teams shipping volume across clients and private-label lines.",
    features: [
      "Unlimited generations",
      "Team access",
      "Brand memory & saved assets",
      "Dedicated support",
    ],
    cta: "Choose Tier",
    ctaKind: "checkout" as const,
    planId: "agency" as SubscriptionPlanId,
    highlighted: false,
  },
];

export function PricingSection() {
  const headingRef = useRevealOnScroll();
  const cardsRef = useRevealOnScroll();

  return (
    <section id="pricing" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[320px] bg-gradient-to-b from-electric/[0.08] to-transparent"
      />

      <div className="relative mx-auto max-w-6xl">
        <div
          ref={headingRef}
          className="scroll-reveal-heading mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-electric">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Plans built for brands that ship globally
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Transparent USD pricing with no hidden fees—so you can forecast
            creative spend alongside ad ROAS.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="scroll-reveal-fade-up-stagger mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {plans.map((plan) => {
            const primaryCta =
              "mt-10 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] via-violet-600 to-[#7c3aed] py-3.5 text-center text-sm font-semibold text-white shadow-[0_0_28px_-8px_rgba(124,58,237,0.55)] transition hover:brightness-110";
            const secondaryCta =
              "mt-10 inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-transparent py-3.5 text-center text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/[0.06]";
            const ctaClassName =
              plan.ctaKind === "checkout" && !plan.highlighted
                ? secondaryCta
                : primaryCta;

            const ctaNode =
              plan.ctaKind === "checkout" && "planId" in plan ? (
                <PricingTierButton planId={plan.planId} className={ctaClassName}>
                  {plan.cta}
                </PricingTierButton>
              ) : plan.ctaKind === "signup" ? (
                <Link href="/signup?next=%2Fdashboard" className={ctaClassName}>
                  {plan.cta}
                </Link>
              ) : null;

            return (
              <article
                key={plan.name}
                className={`glass-panel relative flex flex-col p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "scale-[1.02] border-gold/40 bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-glow-gold lg:-mt-2 lg:mb-2"
                    : "glass-panel-hover"
                }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 right-6 rounded-full border border-gold/40 bg-gold/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold leading-snug text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {plan.description}
                </p>
                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span className="text-sm font-medium text-zinc-500">
                      {plan.period}
                    </span>
                  ) : null}
                </div>
                <ul className="mt-8 flex flex-1 flex-col gap-3 border-t border-white/[0.08] pt-8">
                  {plan.features.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-sm text-zinc-400"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                {ctaNode}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
