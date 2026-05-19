"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOutputDimensions,
  parseAspectRatio,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";
import type { GenerationHistoryRecord } from "@/lib/generation-history";

type AspectFilter = "all" | GenerateAspectRatio;
type DateSort = "newest" | "oldest";

const ASPECT_FILTERS: { id: AspectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "1:1", label: "1:1" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
  { id: "4:5", label: "4:5" },
];

const SORT_TABS: { id: DateSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

type ApiResponse = {
  generations?: GenerationHistoryRecord[];
  error?: string;
};

export function GenerationHistoryGallery() {
  const [generations, setGenerations] = useState<GenerationHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [aspectFilter, setAspectFilter] = useState<AspectFilter>("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [selected, setSelected] = useState<GenerationHistoryRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGenerations() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/generations", { cache: "no-store" });
        const data = (await res.json()) as ApiResponse;
        if (!res.ok) {
          throw new Error(data.error ?? "Could not load generation history.");
        }
        if (!cancelled) {
          setGenerations(data.generations ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load generation history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGenerations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const filteredGenerations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return generations
      .filter((item) => {
        const matchesAspect =
          aspectFilter === "all" || item.aspect_ratio === aspectFilter;
        const matchesQuery =
          !q || (item.prompt ?? "").toLowerCase().includes(q);
        return matchesAspect && matchesQuery;
      })
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return dateSort === "newest" ? bTime - aTime : aTime - bTime;
      });
  }, [aspectFilter, dateSort, generations, query]);

  const handleCopyPrompt = async (item: GenerationHistoryRecord) => {
    try {
      await navigator.clipboard.writeText(item.prompt ?? "");
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  const handleDownload = (item: GenerationHistoryRecord) => {
    window.open(item.image_url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-300/80">
              Asset vault
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Generation History
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Search every saved Brand Kit, filter by ratio, and reopen creative specs
              without leaving the dashboard.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <label htmlFor="history-search" className="sr-only">
              Search prompts
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                aria-hidden
              >
                <SearchIcon />
              </span>
              <input
                id="history-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search prompts, styles, categories..."
                className="h-12 w-full rounded-2xl border border-white/[0.1] bg-black/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-electric/50 focus:bg-black/50 focus:ring-2 focus:ring-electric/20"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabBar
            label="Aspect ratio filters"
            tabs={ASPECT_FILTERS}
            value={aspectFilter}
            onChange={setAspectFilter}
          />
          <FilterTabBar
            label="Date sort"
            tabs={SORT_TABS}
            value={dateSort}
            onChange={setDateSort}
          />
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <HistorySkeletonGrid />
      ) : filteredGenerations.length > 0 ? (
        <section
          className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Generation history gallery"
        >
          {filteredGenerations.map((item, index) => (
            <HistoryCard
              key={item.id}
              item={item}
              index={index}
              copied={copiedId === item.id}
              onOpen={() => setSelected(item)}
              onDownload={() => handleDownload(item)}
              onCopy={() => void handleCopyPrompt(item)}
            />
          ))}
        </section>
      ) : (
        <EmptyState hasQuery={query.trim().length > 0 || aspectFilter !== "all"} />
      )}

      {selected ? (
        <GenerationLightbox
          item={selected}
          onClose={() => setSelected(null)}
          onDownload={() => handleDownload(selected)}
          onCopy={() => void handleCopyPrompt(selected)}
          copied={copiedId === selected.id}
        />
      ) : null}
    </>
  );
}

function FilterTabBar<T extends string>({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string;
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-2xl border border-white/[0.08] bg-black/35 p-1"
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
              active
                ? "bg-electric/20 text-white shadow-[0_0_24px_-8px_rgba(124,58,237,0.6)] ring-1 ring-electric/35"
                : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function HistoryCard({
  item,
  index,
  copied,
  onOpen,
  onDownload,
  onCopy,
}: {
  item: GenerationHistoryRecord;
  index: number;
  copied: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onCopy: () => void;
}) {
  const ratio = parseAspectRatio(item.aspect_ratio);
  const dims = getOutputDimensions(ratio);
  const created = formatDate(item.created_at);

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/70 shadow-[0_24px_56px_-32px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-1 hover:border-electric/30 hover:shadow-[0_32px_72px_-34px_rgba(124,58,237,0.7)]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`Open generation ${index + 1}`}
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/[0.06] via-electric/[0.08] to-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={`Generated asset ${index + 1}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-75 transition group-hover:opacity-55" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
              {ratio}
            </span>
            <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-zinc-300 backdrop-blur-md">
              {dims.width}x{dims.height}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-200">
              {item.prompt || "Saved GrowUrb generation"}
            </p>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">
            Brand Kit #{index + 1}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-600">{created}</p>
        </div>
        <div className="flex shrink-0 gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <ActionButton label="Download" onClick={onDownload}>
            <DownloadIcon />
          </ActionButton>
          <ActionButton label={copied ? "Copied" : "Copy prompt"} onClick={onCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </ActionButton>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 text-zinc-300 backdrop-blur-md transition hover:border-electric/45 hover:bg-electric/20 hover:text-white"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function GenerationLightbox({
  item,
  onClose,
  onDownload,
  onCopy,
  copied,
}: {
  item: GenerationHistoryRecord;
  onClose: () => void;
  onDownload: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const ratio = parseAspectRatio(item.aspect_ratio);
  const dims = getOutputDimensions(ratio);

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Generation lightbox"
      onClick={onClose}
    >
      <div
        className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/[0.1] bg-[#09070f] shadow-[0_40px_100px_-35px_rgba(0,0,0,0.95)] lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[320px] bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt="Selected generation"
            className="h-full max-h-[92vh] w-full object-contain"
            draggable={false}
          />
        </div>

        <aside className="overflow-y-auto border-t border-white/[0.08] p-5 lg:border-l lg:border-t-0 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300">
                Generation details
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                Layout Specification
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close lightbox"
            >
              <CloseIcon />
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <Spec label="Aspect" value={ratio} />
            <Spec label="Dimensions" value={`${dims.width}x${dims.height}`} />
            <Spec label="Created" value={formatDateTime(item.created_at)} wide />
          </dl>

          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Prompt
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {item.prompt || "No prompt metadata saved for this generation."}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-electric/40 bg-electric/20 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-electric/30"
            >
              <DownloadIcon /> Download
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-100 transition hover:bg-white/[0.1]"
            >
              {copied ? <CheckIcon /> : <CopyIcon />} {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-black/35 p-3 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-zinc-200">{value}</dd>
    </div>
  );
}

function HistorySkeletonGrid() {
  return (
    <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04]"
        >
          <div className="aspect-square dash-skeleton-shimmer" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-24 rounded-full bg-white/[0.08]" />
            <div className="h-3 w-36 rounded-full bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </section>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <section className="mt-7 rounded-3xl border border-dashed border-white/[0.12] bg-white/[0.03] px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {hasQuery ? "No matching assets" : "No saved generations yet"}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {hasQuery ? "Try a different prompt or ratio" : "Generate your first Brand Kit"}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
        {hasQuery
          ? "The gallery filters are live, so results update instantly as you refine your search."
          : "Every successful generation will appear here with prompt metadata, ratio, and download actions."}
      </p>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
