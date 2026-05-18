"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { CheckoutButton } from "@/components/billing/CheckoutButton";

type TrialExpiredOverlayProps = {
  open: boolean;
};

export function TrialExpiredOverlay({ open }: TrialExpiredOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl sm:p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="trial-expired-title"
      aria-describedby="trial-expired-desc"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0a12]/95 p-8 text-center shadow-[0_40px_100px_-32px_rgba(0,0,0,0.9)] sm:p-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300/90">
          Account trial
        </p>
        <h2
          id="trial-expired-title"
          className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Trial Ended. Unlock Endless Brand Scale.
        </h2>
        <p
          id="trial-expired-desc"
          className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400"
        >
          Your 7-day studio access has ended. Upgrade to GrowUrb Pro for watermark-free 8K
          catalog drops, omni-channel copy, and priority generation across every channel.
        </p>

        <div className="mt-8">
          <CheckoutButton
            planId="growth_pro"
            loginNext="/dashboard"
            className="inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] via-violet-600 to-[#7c3aed] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_48px_-8px_rgba(124,58,237,0.75)] transition duration-300 hover:scale-[1.02] hover:brightness-110 disabled:opacity-60 sm:text-base"
          >
            Upgrade to GrowUrb Pro
          </CheckoutButton>
        </div>

        <p className="mt-5 text-[10px] text-zinc-600">
          Secure Stripe checkout · Cancel anytime
        </p>
      </div>
    </div>,
    document.body,
  );
}
