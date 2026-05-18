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

  return (
    <button
      type="button"
      disabled={!ready || busy}
      onClick={() => {
        setBusy(true);
        void onDownload().finally(() => setBusy(false));
      }}
      className={`download-all-placements inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md transition-all duration-300 sm:px-4 ${
        ready
          ? "border-electric/40 bg-electric/15 text-violet-100 shadow-[0_0_28px_-8px_rgba(124,58,237,0.55)] hover:border-electric/60 hover:bg-electric/25 hover:shadow-[0_0_36px_-6px_rgba(124,58,237,0.65)]"
          : "cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-zinc-600 opacity-60"
      }`}
      aria-label="Download all placement images as zip"
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
