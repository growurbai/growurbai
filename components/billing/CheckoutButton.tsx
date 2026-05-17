"use client";

import { useState } from "react";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";

type CheckoutButtonProps = {
  planId: SubscriptionPlanId;
  className?: string;
  children: React.ReactNode;
  loginNext?: string;
};

export function CheckoutButton({
  planId,
  className,
  children,
  loginNext = "/settings",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(loginNext)}`;
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }

      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <span className="block w-full">
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={loading}
        className={className}
      >
        {loading ? "Redirecting…" : children}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </span>
  );
}

export function CheckoutOrLoginLink({
  planId,
  className,
  children,
}: Omit<CheckoutButtonProps, "loginNext">) {
  return (
    <CheckoutButton planId={planId} className={className} loginNext="/settings">
      {children}
    </CheckoutButton>
  );
}
