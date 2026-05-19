"use client";

import { CopyLanguageSelector } from "@/components/dashboard/CopyLanguageSelector";
import { type CopyTabId, getTabCopyText } from "@/lib/dashboard-tab-copy";
import {
  getCopyLanguageLabel,
  type CopyLanguageId,
} from "@/lib/copy-languages";
import type { GenerateAdCopy } from "@/lib/generate-api-types";

const COPY_TABS: { id: CopyTabId; label: string }[] = [
  { id: "facebook", label: "Facebook Ad" },
  { id: "instagram", label: "Instagram Caption" },
  { id: "linkedin", label: "LinkedIn Post" },
  { id: "twitter", label: "Twitter/X Link" },
];

type AdCopyTabsPanelProps = {
  activeCopyTab: CopyTabId;
  onTabChange: (tab: CopyTabId) => void;
  loading: boolean;
  showResults: boolean;
  apiAdCopy: GenerateAdCopy | null;
  copyLanguage: CopyLanguageId;
  onCopyLanguageChange: (lang: CopyLanguageId) => void;
  copiedTab: CopyTabId | null;
  onCopyTab: (tab: CopyTabId) => void;
};

export function AdCopyTabsPanel({
  activeCopyTab,
  onTabChange,
  loading,
  showResults,
  apiAdCopy,
  copyLanguage,
  onCopyLanguageChange,
  copiedTab,
  onCopyTab,
}: AdCopyTabsPanelProps) {
  return (
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
          onChange={onCopyLanguageChange}
          disabled={loading}
        />
      </div>

      <div
        role="tablist"
        aria-label="Ad copy formats"
        className="ad-copy-tablist flex flex-wrap gap-1 border-b border-white/[0.06] p-2 sm:gap-0 sm:p-2"
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
              tabIndex={selected ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={`ad-copy-tab relative flex-1 rounded-xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 sm:min-w-0 sm:flex-none sm:px-4 sm:text-xs ${
                selected
                  ? "bg-black/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-electric/35"
                  : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
              }`}
            >
              {tab.label}
              <span
                className={`ad-copy-tab-indicator absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-electric to-violet-400 transition-opacity duration-200 sm:left-4 sm:right-4 ${
                  selected ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[220px] p-5 sm:p-6">
        {loading ? (
          <div className="space-y-3 pt-1" aria-busy="true" aria-label="Loading ad copy">
            <div className="h-4 w-[94%] max-w-xl rounded-md dash-skeleton-shimmer" />
            <div className="h-4 w-full max-w-xl rounded-md dash-skeleton-shimmer" />
            <div className="h-4 w-[80%] max-w-xl rounded-md dash-skeleton-shimmer" />
          </div>
        ) : showResults ? (
          <>
            {COPY_TABS.map((tab) => {
              const selected = activeCopyTab === tab.id;
              return (
                <div
                  key={tab.id}
                  id={`panel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab.id}`}
                  hidden={!selected}
                  className={`ad-copy-tabpanel transition-opacity duration-200 ${
                    selected
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none absolute inset-0 z-0 p-5 opacity-0 sm:p-6"
                  }`}
                >
                  <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-electric/25 bg-electric/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                    {getCopyLanguageLabel(copyLanguage)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                    {getTabCopyText(tab.id, apiAdCopy)}
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onCopyTab(tab.id)}
                      tabIndex={selected ? 0 : -1}
                      className={`rounded-xl border px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                        copiedTab === tab.id
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_28px_-8px_rgba(52,211,153,0.45)]"
                          : "border-electric/45 bg-electric/15 text-white shadow-[0_0_28px_-10px_rgba(124,58,237,0.55)] hover:border-electric/65 hover:bg-electric/25 hover:shadow-[0_0_36px_-8px_rgba(124,58,237,0.65)]"
                      }`}
                    >
                      {copiedTab === tab.id ? "Copied!" : "Click to Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p className="text-sm leading-relaxed text-zinc-600">
            Generate a Brand Kit to unlock channel-native copy.
          </p>
        )}
      </div>
    </section>
  );
}
