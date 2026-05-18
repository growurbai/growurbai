"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";

type GrowthProBillingModalProps = {
  open: boolean;
  onClose: () => void;
};

export function GrowthProBillingModal({ open, onClose }: GrowthProBillingModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="billing-modal-backdrop fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Subscription plans"
      onClick={handleBackdropClick}
    >
      <div
        className="billing-modal-panel relative max-h-[min(92vh,820px)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0a12]/95 p-5 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-zinc-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          aria-label="Close plans"
        >
          <CloseIcon />
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/90">
          Billing & plans
        </p>
        <h2 className="mt-1 pr-10 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Upgrade your Brand Kit studio
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          You&apos;re on <span className="text-gold">Growth Pro</span>. Compare tiers or launch a
          secure Stripe checkout session in one click.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`flex flex-col rounded-xl border p-4 transition duration-300 ${
                tier.highlighted
                  ? "border-gold/40 bg-gradient-to-b from-gold/10 via-electric/10 to-transparent shadow-[0_0_32px_-12px_rgba(124,58,237,0.45)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {tier.badge ? (
                <span className="mb-2 inline-flex w-fit rounded-full border border-gold/35 bg-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold">
                  {tier.badge}
                </span>
              ) : (
                <span className="mb-2 block h-5" aria-hidden />
              )}
              <h3 className="text-sm font-semibold text-white">{tier.name}</h3>
              <p className="mt-1 text-lg font-bold text-white">
                {tier.price}
                <span className="text-sm font-medium text-zinc-500">{tier.period}</span>
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{tier.description}</p>
              <ul className="mt-3 flex-1 space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-1.5 text-[10px] text-zinc-400">
                    <span className="text-emerald-400" aria-hidden>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {tier.checkoutPlanId ? (
                  <CheckoutButton
                    planId={tier.checkoutPlanId as SubscriptionPlanId}
                    loginNext="/dashboard"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-electric/40 bg-electric/20 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-electric/30"
                  >
                    {tier.id === "growth_pro" ? "Manage plan" : "Upgrade"}
                  </CheckoutButton>
                ) : (
                  <Link
                    href="/signup?next=%2Fdashboard"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.05] py-2.5 text-[11px] font-bold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.08]"
                    onClick={onClose}
                  >
                    Start trial
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 text-center text-[10px] text-zinc-600">
          Secure checkout powered by Stripe · USD billing · Cancel anytime
        </p>
      </div>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
