"use client";

import { getLayoutAspectTailwindClass, type GenerateAspectRatio } from "@/lib/aspect-ratio";

export type LayoutOutputSlotProps = {
  index: number;
  ratio: GenerateAspectRatio;
  loading: boolean;
  showResults: boolean;
  imageSrc: string | null;
  previewSrc: string | null;
};

/** Always renders Layout 1–4 for every aspect ratio (no conditional hide). */
export function LayoutOutputSlot({
  index,
  ratio,
  loading,
  showResults,
  imageSrc,
  previewSrc,
}: LayoutOutputSlotProps) {
  const showGeneratedImage = Boolean(showResults && imageSrc);
  const showPreviewOnly = Boolean(!showResults && previewSrc);
  const aspectClass = getLayoutAspectTailwindClass(ratio);

  return (
    <figure className="group/card w-full min-w-0">
      <figcaption className="sr-only">Layout {index + 1}</figcaption>

      <div
        data-ratio={ratio}
        className={`layout-output-shell rounded-2xl border border-white/[0.1] bg-zinc-900/40 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.65)] transition-[border-color,box-shadow,transform] duration-300 group-hover/card:-translate-y-0.5 group-hover/card:border-white/[0.16] group-hover/card:shadow-[0_24px_56px_-20px_rgba(124,58,237,0.22)] ${aspectClass}`}
      >
        <div className="absolute inset-0">
          {loading ? (
            <div className="absolute inset-0 dash-skeleton-shimmer" />
          ) : showGeneratedImage && imageSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={`Layout ${index + 1} preview`}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-electric/25" />
            </>
          ) : showPreviewOnly && previewSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={`Layout ${index + 1} placeholder`}
                className="h-full w-full object-cover object-center opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-electric/[0.07] to-black/55" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-electric/[0.08] to-black/60" />
          )}

          <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
            <span className="rounded-lg border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {`Layout ${index + 1}`}
            </span>
          </div>

          <button
            type="button"
            aria-label={`Download layout ${index + 1}`}
            className="absolute right-3 top-3 z-10 rounded-lg border border-white/15 bg-black/55 p-2 text-white backdrop-blur-md transition hover:border-electric/40 hover:bg-electric/25 sm:right-4 sm:top-4"
          >
            <svg
              className="h-4 w-4"
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
            </svg>
          </button>

          {!loading && !showResults ? (
            <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Slot {index + 1}
              </span>
              <p className="max-w-[11rem] text-xs leading-relaxed text-zinc-500">
                Awaiting Brand Kit generation
              </p>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-black/65 opacity-0 transition-opacity duration-300 group-hover/card:pointer-events-auto group-hover/card:opacity-100">
            <span className="rounded-full border border-white/25 bg-white/10 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
              Download
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}

/* Tailwind JIT anchors — do not remove */
void (
  "aspect-square aspect-[4/5] aspect-[9/16] aspect-[16/9]" as const
);
