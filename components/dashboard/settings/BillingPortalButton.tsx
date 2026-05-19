"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        window.location.href = "/login?next=%2Fdashboard%2Fsettings";
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void openPortal()}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-electric/45 bg-gradient-to-r from-electric/35 via-violet-600/35 to-electric/25 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_36px_-10px_rgba(124,58,237,0.75)] transition hover:border-electric/65 hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            Opening portal...
          </>
        ) : (
          "Manage Billing & Invoices"
        )}
      </button>
      {error ? (
        <p className="mt-3 text-sm leading-relaxed text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
