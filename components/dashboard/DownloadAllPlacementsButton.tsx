"use client";

import { useState } from "react";

type DownloadAllPlacementsButtonProps = {
  ready: boolean;
  onDownload: () => Promise<void>;
};

export function DownloadAllPlacementsButton({
  ready,
  onDownload,
}: DownloadAllPlacementsButtonProps) {
  const [busy, setBusy] = useState(false);
  const interactive = ready && !busy;

  return (
    <button
      type="button"
      disabled={!ready || busy}
      aria-disabled={!ready || busy}
      onClick={() => {
        if (!interactive) return;
        setBusy(true);
        void onDownload().finally(() => setBusy(false));
      }}
      className={`download-all-placements inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md transition-all duration-300 sm:px-4 ${
        ready
          ? interactive
            ? "cursor-pointer border-electric/45 bg-electric/20 text-violet-100 shadow-[0_0_32px_-6px_rgba(124,58,237,0.65)] hover:border-electric/65 hover:bg-electric/30 hover:shadow-[0_0_40px_-4px_rgba(124,58,237,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 active:scale-[0.98]"
            : "cursor-wait border-electric/40 bg-electric/15 text-violet-100 shadow-[0_0_28px_-8px_rgba(124,58,237,0.5)] opacity-90"
          : "pointer-events-none cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-zinc-500 opacity-40"
      }`}
      aria-label={
        ready
          ? "Download all placement images as zip"
          : "Download all placements unavailable until generation completes"
      }
    >
      {busy ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : (
        <ZipDownloadIcon active={ready} />
      )}
      <span className="hidden sm:inline">Download All Placements</span>
      <span className="sm:hidden">Download All</span>
    </button>
  );
}

function ZipDownloadIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${active ? "text-violet-200" : "text-zinc-600"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" opacity={0.35} />
    </svg>
  );
}
