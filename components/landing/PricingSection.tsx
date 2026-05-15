"use client";

import Link from "next/link";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Trial the studio workflow on your bestsellers.",
    features: [
      "3 generations / month",
      "Single SKU focus",
      "Watermarked exports",
    ],
    cta: "Start free",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Growth Pro",
    price: "₹1,999",
    period: "/mo",
    description: "For founders scaling SKU count and creatives weekly.",
    features: [
      "Unlimited catalogue generations",
      "4 layouts + copy variants",
      "Priority India latency",
      "Shopify-ready export sizes",
    ],
    cta: "Upgrade to Growth",
    href: "/dashboard",
    highlighted: true,
    badge: "Most loved",
  },
  {
    name: "Agency",
    price: "₹4,999",
    period: "/mo",
    description: "For bundles, white-label previews, and client rooms.",
    features: [
      "5 teammate seats",
      "Shared mood boards",
      "Batch SKU ingest",
      "Dedicated success channel",
    ],
    cta: "Talk to us",
    href: "mailto:hello@growurb.ai",
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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Plans that mirror how Indian brands actually grow
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Transparent INR pricing—inclusive GST where applicable—so founders
            can forecast creative spend alongside ad RoAS.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="scroll-reveal-fade-up-stagger mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {plans.map((plan) => {
            const ctaClassName =
              `mt-10 inline-flex w-full items-center justify-center rounded-xl py-3.5 text-center text-sm font-semibold transition ` +
              (plan.highlighted
                ? "bg-gradient-to-r from-electric to-violet-600 text-white hover:brightness-110 shadow-glow"
                : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10");
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
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
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
                {plan.href.startsWith("mailto:") ? (
                  <a href={plan.href} className={ctaClassName}>
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.href} className={ctaClassName}>
                    {plan.cta}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
