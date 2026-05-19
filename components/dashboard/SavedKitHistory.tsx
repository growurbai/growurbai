"use client";

import { useEffect, useMemo, useState } from "react";
import type { GenerationHistoryRecord } from "@/lib/generation-history";

type GenerationsResponse = {
  generations?: GenerationHistoryRecord[];
  error?: string;
};

type SavedKitHistoryProps = {
  onSelect?: (id: string) => void;
  refreshKey?: number;
};

function historyLabel(record: GenerationHistoryRecord): string {
  const firstLine = record.prompt?.split("\n").find(Boolean);
  if (firstLine?.startsWith("Brand: ")) {
    return firstLine.replace("Brand: ", "").trim();
  }
  if (record.aspect_ratio) {
    return `Brand kit ${record.aspect_ratio}`;
  }
  return "Saved brand kit";
}

export function SavedKitHistory({ onSelect, refreshKey = 0 }: SavedKitHistoryProps) {
  const [items, setItems] = useState<GenerationHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetch("/api/generations", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as GenerationsResponse;
        if (!res.ok) {
          throw new Error(data.error ?? "Could not load history.");
        }
        if (!cancelled) {
          setItems((data.generations ?? []).slice(0, 8));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load history.");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const visibleItems = useMemo(() => items.slice(0, 4), [items]);

  return (
    <section className="saved-kit-history" aria-label="Saved Kit History">
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Archive
        </p>
        <h3 className="mt-1 text-sm font-semibold tracking-tight text-white">
          Saved Kit History
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
          Quick reload from your last premium renders.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`history-loading-${index}`}
                className="aspect-square h-16 w-16 rounded-lg border border-white/10 dash-skeleton-shimmer"
                aria-hidden
              />
            ))
          : null}

        {!loading && visibleItems.length > 0
          ? visibleItems.map((kit) => (
          <button
            key={kit.id}
            type="button"
            className="saved-kit-thumb group/hist relative aspect-square h-16 w-16 shrink-0 rounded-lg border border-white/10 bg-white/5 p-1 transition-all duration-300 hover:border-electric/40 hover:bg-white/[0.08] hover:shadow-[0_0_20px_-6px_rgba(124,58,237,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
            onClick={() => onSelect?.(kit.id)}
            aria-label={`Quick view ${historyLabel(kit)}`}
            title={historyLabel(kit)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kit.image_url}
              alt=""
              className="h-full w-full rounded-md object-cover"
              loading="lazy"
              aria-hidden
            />
            <span className="saved-kit-thumb-overlay pointer-events-none absolute inset-1 flex items-center justify-center rounded-md bg-black/55 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/hist:opacity-100 group-focus-visible/hist:opacity-100">
              <span className="text-[10px] font-bold uppercase tracking-wide text-white" aria-hidden>
                View
              </span>
            </span>
          </button>
            ))
          : null}
      </div>

      {!loading && visibleItems.length === 0 ? (
        <p className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-zinc-600">
          {error ?? "Your latest saved kits will appear here after generation."}
        </p>
      ) : null}
    </section>
  );
}
