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
import { AspectRatioPicker } from "@/components/dashboard/AspectRatioPicker";
import { BrandContextFields } from "@/components/dashboard/BrandContextFields";
import { CopyLanguageSelector } from "@/components/dashboard/CopyLanguageSelector";
import { CreativeEnhancementToggle } from "@/components/dashboard/CreativeEnhancementToggle";
import { CreditsIndicator } from "@/components/dashboard/CreditsIndicator";
import { DownloadAllPlacementsButton } from "@/components/dashboard/DownloadAllPlacementsButton";
import { LayoutOutputSlot } from "@/components/dashboard/LayoutOutputSlot";
import { ProductUploadZone } from "@/components/dashboard/ProductUploadZone";
import { SavedKitHistory } from "@/components/dashboard/SavedKitHistory";
import { useGenerationProgress } from "@/components/dashboard/useGenerationProgress";
import {
  DEFAULT_ASPECT_RATIO,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";
import {
  DEFAULT_COPY_LANGUAGE,
  getCopyLanguageLabel,
  type CopyLanguageId,
} from "@/lib/copy-languages";
import { downloadAllLayoutPlacements } from "@/lib/download-all-layouts";
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
  const [uploadError, setUploadError] = useState<string | null>(null);
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
  const [copyLanguage, setCopyLanguage] =
    useState<CopyLanguageId>(DEFAULT_COPY_LANGUAGE);
  const [brandName, setBrandName] = useState("");
  const [coreHook, setCoreHook] = useState("");
  const [creativeEnhancement, setCreativeEnhancement] = useState(true);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = useCallback((next: File | null) => {
    setFile(next);
    if (!next) {
      setShowResults(false);
      setApiAdCopy(null);
      setLayoutImagesB64(null);
      setGenerateError(null);
      setGenerateWarning(null);
    }
  }, []);

  const layoutDataUrl = useCallback((index: number) => {
    const b64 = layoutImagesB64?.[index];
    return b64 != null && b64.length > 0 ? `data:image/png;base64,${b64}` : null;
  }, [layoutImagesB64]);

  const placementsReady = useMemo(
    () =>
      showResults &&
      layoutImagesB64 != null &&
      layoutImagesB64.length === 4 &&
      layoutImagesB64.every((x) => x.length > 0),
    [showResults, layoutImagesB64],
  );

  const handleDownloadAll = useCallback(async () => {
    if (!layoutImagesB64 || !placementsReady) return;
    const slug = brandName.trim()
      ? brandName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "growurb";
    await downloadAllLayoutPlacements(
      layoutImagesB64,
      `${slug}-brand-kit-placements.zip`,
    );
  }, [layoutImagesB64, placementsReady, brandName]);

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
          creativeEnhancement,
          brandName: brandName.trim() || undefined,
          coreHook: coreHook.trim() || undefined,
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

      <header className="relative z-30 shrink-0 overflow-visible border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl">
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

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 overflow-visible sm:justify-end sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              Growth Pro <span aria-hidden>🔥</span>
            </span>
            <CreditsIndicator />
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
                One SKU per generation unlocks four placements + omni-channel copy.
              </p>
            </div>

            <ProductUploadZone
              file={file}
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              uploadError={uploadError}
              onUploadError={setUploadError}
            />

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

            <BrandContextFields
              brandName={brandName}
              coreHook={coreHook}
              onBrandNameChange={setBrandName}
              onCoreHookChange={setCoreHook}
              disabled={loading}
            />

            <SavedKitHistory />

            <AspectRatioPicker
              selectedRatio={selectedRatio}
              onChange={setSelectedRatio}
              disabled={loading}
            />

            <CreativeEnhancementToggle
              enabled={creativeEnhancement}
              onChange={setCreativeEnhancement}
              disabled={loading}
            />

            <div className="relative isolate mt-auto lg:mt-2">
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
              <DownloadAllPlacementsButton
                ready={placementsReady}
                onDownload={handleDownloadAll}
              />
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Ad text copy
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-400">
                    Omni-channel creative engine
                  </p>
                </div>
                <CopyLanguageSelector
                  value={copyLanguage}
                  onChange={setCopyLanguage}
                  disabled={loading}
                />
              </div>

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
                    <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-electric/25 bg-electric/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                      {getCopyLanguageLabel(copyLanguage)}
                    </p>
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
