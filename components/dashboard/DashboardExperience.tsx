"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";
import {
  type CopyTabId,
  getDashboardTabCopy,
} from "@/lib/dashboard-tab-copy";
import { dashboardCategories } from "@/lib/dashboard-categories";
import { AspectRatioPicker } from "@/components/dashboard/AspectRatioPicker";
import { LayoutOutputSlot } from "@/components/dashboard/LayoutOutputSlot";
import { useGenerationProgress } from "@/components/dashboard/useGenerationProgress";
import {
  DEFAULT_ASPECT_RATIO,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";
import type { GenerateAdCopy, GenerateSuccessResponse } from "@/lib/generate-api-types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function tabCopyText(
  tab: CopyTabId,
  ad: GenerateAdCopy | null,
): string {
  if (ad) {
    if (tab === "facebook") return ad.facebookAd;
    if (tab === "instagram") return ad.instagramCaption;
    if (tab === "google") return ad.googleAd;
    return ad.pdpBullets;
  }
  return getDashboardTabCopy("Skincare", tab);
}

const LAYOUT_SLOT_INDICES = [0, 1, 2, 3] as const;

const COPY_TABS: { id: CopyTabId; label: string }[] = [
  { id: "facebook", label: "Facebook Ad" },
  { id: "instagram", label: "Instagram Caption" },
  { id: "google", label: "Google Ad" },
  { id: "pdp", label: "PDP Bullets" },
];

export function DashboardExperience() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeCopyTab, setActiveCopyTab] = useState<CopyTabId>("facebook");
  const [copiedTab, setCopiedTab] = useState<CopyTabId | null>(null);
  const [apiAdCopy, setApiAdCopy] = useState<GenerateAdCopy | null>(null);
  const [layoutImagesB64, setLayoutImagesB64] = useState<string[] | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateWarning, setGenerateWarning] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] =
    useState<GenerateAspectRatio>(DEFAULT_ASPECT_RATIO);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith("image/")) setFile(f);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f?.type.startsWith("image/")) setFile(f);
    },
    [],
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setShowResults(false);
    setApiAdCopy(null);
    setLayoutImagesB64(null);
    setGenerateError(null);
    setGenerateWarning(null);
  }, []);

  const layoutDataUrl = useCallback((index: number) => {
    const b64 = layoutImagesB64?.[index];
    return b64 != null && b64.length > 0 ? `data:image/png;base64,${b64}` : null;
  }, [layoutImagesB64]);

  const { message: generationProgressMessage } = useGenerationProgress(loading);

  const runGenerate = async () => {
    if (!file) return;
    setGenerateError(null);
    setGenerateWarning(null);
    setLoading(true);
    setShowResults(false);
    setApiAdCopy(null);
    setLayoutImagesB64(null);
    setGenerateWarning(null);
    try {
      const imageBase64 = await fileToDataUrl(file);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          ratio: selectedRatio,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        categoryWarning?: string | null;
      } & Partial<GenerateSuccessResponse>;
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      // Backend should return `layoutImages`, but keep a fallback to `images`
      // to avoid empty UI if response shape changes.
      const layouts =
        data.layoutImages ?? (data as Partial<GenerateSuccessResponse> & { images?: unknown }).images;
      if (
        !Array.isArray(layouts) ||
        layouts.length !== 4 ||
        !layouts.every((x) => typeof x === "string" && x.length > 0) ||
        !data.adCopy ||
        typeof data.adCopy.facebookAd !== "string"
      ) {
        throw new Error("Invalid response from server");
      }
      setLayoutImagesB64(layouts);
      setApiAdCopy(data.adCopy);
      setGenerateWarning(data.categoryWarning ?? null);
      setShowResults(true);
    } catch (e) {
      setGenerateError(
        e instanceof Error ? e.message : "Brand kit generation failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

  const handleCopyTab = async (tab: CopyTabId) => {
    const text = tabCopyText(tab, apiAdCopy);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      window.setTimeout(() => setCopiedTab(null), 2200);
    } catch {
      setCopiedTab(null);
    }
  };

  const liveDot = loading ? (
    <span
      className="dash-live-dot inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400"
      aria-hidden
    />
  ) : showResults ? (
    <span
      className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]"
      aria-hidden
    />
  ) : (
    <span
      className="inline-flex h-2 w-2 shrink-0 rounded-full bg-zinc-600"
      aria-hidden
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[min(55vh,520px)] bg-gradient-to-b from-electric/[0.12] via-transparent to-transparent"
      />

      <header className="relative z-30 shrink-0 border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-[3.5rem] max-w-[1600px] flex-col gap-2 px-4 py-3 sm:min-h-[4rem] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-gold text-xs font-bold text-white shadow-[0_0_28px_-6px_rgba(124,58,237,0.65)]">
              GU
            </span>
            <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
              GrowUrb<span className="text-gold"> AI</span>
            </span>
          </Link>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-zinc-300">
              Brand Kit Studio
            </p>
          </div>

          <p className="text-center text-[13px] font-semibold uppercase tracking-[0.28em] text-zinc-300 md:hidden">
            Brand Kit Studio
          </p>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              Growth Pro <span aria-hidden>🔥</span>
            </span>
            <span className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium tabular-nums text-zinc-300 backdrop-blur-md">
              47 credits left
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* LEFT — controls */}
        <aside className="flex w-full shrink-0 flex-col border-white/[0.06] px-4 py-8 sm:px-6 lg:w-[35%] lg:max-w-xl lg:border-r lg:py-10 lg:pl-8 lg:pr-6 xl:pl-10">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 lg:mx-0 lg:max-w-none">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Source asset
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-white">
                Upload hero shot
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                PNG / JPG · up to 20MB · one SKU per generation unlocks four
                placements + omni-channel copy.
              </p>
            </div>

            <div
              role="presentation"
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`group/dash-upload rounded-[1.35rem] border-2 border-dashed border-white/[0.14] bg-white/[0.02] p-[3px] transition-[border-color,box-shadow] duration-300 hover:border-electric/55 hover:shadow-[0_0_36px_-8px_rgba(124,58,237,0.45)] ${
                dragActive
                  ? "border-electric shadow-[0_0_44px_-6px_rgba(124,58,237,0.55)]"
                  : ""
              }`}
            >
              <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.08] bg-black/35 backdrop-blur-md">
                {previewUrl ? (
                  <div className="animate-dash-preview-in relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Uploaded product preview"
                      className="max-h-[280px] w-full object-contain sm:max-h-[320px]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-4 pb-4 pt-16">
                      <p className="truncate text-xs font-medium text-zinc-300">
                        {file?.name}
                      </p>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gold transition hover:text-amber-300"
                      >
                        Replace image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center px-6 py-14 text-center sm:min-h-[280px]">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileInput}
                    />
                    <svg
                      className="h-14 w-14 text-electric-glow transition-all duration-300 group-hover/dash-upload:-translate-y-1 group-hover/dash-upload:scale-105 group-hover/dash-upload:drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.15}
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-9 3.75l4.72-6.928"
                      />
                      <circle cx={12} cy={8} r={2} />
                    </svg>
                    <span className="mt-5 text-sm font-semibold text-white">
                      Drop your catalog shot here
                    </span>
                    <span className="mt-2 text-xs text-zinc-500">
                      or tap anywhere to browse files
                    </span>
                  </label>
                )}
              </div>
            </div>

            {generateError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-200"
              >
                {generateError}
              </p>
            ) : null}

            {generateWarning ? (
              <p
                role="status"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-200"
              >
                {generateWarning}
              </p>
            ) : null}

            <AspectRatioPicker
              selectedRatio={selectedRatio}
              onChange={setSelectedRatio}
              disabled={loading}
            />

            <div className="relative isolate mt-auto lg:mt-8">
              <div
                className={`rounded-2xl p-[1px] ${file && !loading ? "dash-generate-pulse" : ""}`}
              >
                <button
                  type="button"
                  disabled={!file || loading}
                  onClick={() => void runGenerate()}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-r from-electric via-violet-600 to-electric py-4 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"
                  />
                  <span className="relative inline-flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                        Removing background & drafting copy…
                      </>
                    ) : (
                      <>
                        <span aria-hidden>✨</span>
                        Generate Brand Kit
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT — outputs */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-black/[0.15] px-4 py-8 sm:px-6 lg:w-[65%] lg:py-10 lg:pl-8 lg:pr-8 xl:pr-10">
          <div className="mx-auto w-full max-w-4xl lg:mx-0 lg:max-w-none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-zinc-400">
                  Creative outputs
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 backdrop-blur-md">
                  {liveDot}
                  <span>{loading ? "Generating" : showResults ? "Live" : "Idle"}</span>
                </span>
              </div>
              <span className="text-[11px] font-medium tabular-nums text-zinc-600">
                {dashboardCategories.length} catalog lanes
              </span>
            </div>

            <div
              className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2"
              data-testid="creative-outputs-grid"
            >
              {LAYOUT_SLOT_INDICES.map((slotIndex) => (
                <LayoutOutputSlot
                  key={`layout-slot-${slotIndex}`}
                  index={slotIndex}
                  ratio={selectedRatio}
                  loading={loading}
                  showResults={showResults}
                  imageSrc={layoutDataUrl(slotIndex)}
                  previewSrc={previewUrl}
                  progressMessage={generationProgressMessage}
                />
              ))}
            </div>

            <section className="mt-12 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <div
                role="tablist"
                aria-label="Ad copy formats"
                className="flex flex-wrap gap-1 border-b border-white/[0.06] p-2 sm:gap-0 sm:p-2"
              >
                {COPY_TABS.map((tab) => {
                  const selected = activeCopyTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      id={`tab-${tab.id}`}
                      aria-controls={`panel-${tab.id}`}
                      onClick={() => setActiveCopyTab(tab.id)}
                      className={`relative flex-1 rounded-xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide transition-all duration-300 sm:min-w-0 sm:flex-none sm:px-4 sm:text-xs ${
                        selected
                          ? "bg-black/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-electric/35"
                          : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative min-h-[180px] p-5 sm:p-6">
                {loading ? (
                  <div className="space-y-3 pt-1">
                    <div className="h-4 w-[94%] max-w-xl rounded-md dash-skeleton-shimmer" />
                    <div className="h-4 w-full max-w-xl rounded-md dash-skeleton-shimmer" />
                    <div className="h-4 w-[80%] max-w-xl rounded-md dash-skeleton-shimmer" />
                  </div>
                ) : showResults ? (
                  <div
                    key={activeCopyTab}
                    id={`panel-${activeCopyTab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeCopyTab}`}
                    className="animate-dash-preview-in"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {tabCopyText(activeCopyTab, apiAdCopy)}
                    </p>
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopyTab(activeCopyTab)}
                        className={`rounded-xl border px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                          copiedTab === activeCopyTab
                            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_28px_-8px_rgba(52,211,153,0.45)]"
                            : "border-electric/45 bg-electric/15 text-white shadow-[0_0_28px_-10px_rgba(124,58,237,0.55)] hover:border-electric/65 hover:bg-electric/25 hover:shadow-[0_0_36px_-8px_rgba(124,58,237,0.65)]"
                        }`}
                      >
                        {copiedTab === activeCopyTab ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-zinc-600">
                    Generate a Brand Kit to unlock channel-native copy.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
