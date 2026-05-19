"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SubscriptionPlanId } from "@/lib/stripe/plans";

type PricingTierButtonProps = {
  planId: SubscriptionPlanId;
  className?: string;
  children: React.ReactNode;
  loginNext?: string;
};

export function PricingTierButton({
  planId,
  className,
  children,
  loginNext = "/login?next=%2F%23pricing",
}: PricingTierButtonProps) {
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    });
  }, []);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        window.location.href = loginNext;
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

  const handleClick = () => {
    if (!authChecked) return;
    if (!isAuthenticated) {
      window.location.href = loginNext;
      return;
    }
    void startCheckout();
  };

  return (
    <span className="block w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !authChecked}
        className={className}
      >
        {loading ? "Redirecting to checkout…" : children}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </span>
  );
}
