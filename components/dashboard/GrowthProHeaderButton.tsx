"use client";

import { useState } from "react";
import { GrowthProBillingModal } from "@/components/billing/GrowthProBillingModal";

export function GrowthProHeaderButton() {
  const [billingOpen, setBillingOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setBillingOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-200 hover:border-gold/55 hover:bg-gold/15 hover:shadow-[0_0_24px_-8px_rgba(245,158,11,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 active:scale-[0.98]"
        aria-haspopup="dialog"
        aria-expanded={billingOpen}
      >
        Growth Pro <span aria-hidden>🔥</span>
      </button>
      <GrowthProBillingModal open={billingOpen} onClose={() => setBillingOpen(false)} />
    </>
  );
}
