"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DemoAdFill, DemoBeforePanel } from "@/components/landing/DemoPanels";
import { DEMO_PRESETS, getDemoAdSrc, type DemoPresetId } from "@/components/landing/demo-product";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const SLIDER_SIZES = "(max-width: 896px) 100vw, 896px";
const THUMB_SIZES = "(max-width: 640px) 40vw, 200px";

export function BeforeAfterSection() {
  const [splitPct, setSplitPct] = useState(52);
  const [presetId, setPresetId] = useState<DemoPresetId>("marble");
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRevealRef = useRevealOnScroll();

  const preset = DEMO_PRESETS.find((p) => p.id === presetId) ?? DEMO_PRESETS[0];
  const afterSrc = getDemoAdSrc(presetId);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const next = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSplitPct(next);
  }, []);

  const onPointerDownTrack = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const el = containerRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      dragging.current = true;
      updateFromClientX(e.clientX);
    },
    [updateFromClientX],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    },
    [updateFromClientX],
  );

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const el = containerRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  }, []);

  useEffect(() => {
    const onWinPointerUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointerup", onWinPointerUp);
    window.addEventListener("pointercancel", onWinPointerUp);
    return () => {
      window.removeEventListener("pointerup", onWinPointerUp);
      window.removeEventListener("pointercancel", onWinPointerUp);
    };
  }, []);

  const clipRight = `${100 - splitPct}%`;

  return (
    <section
      className="relative scroll-mt-24 border-t border-white/[0.06] bg-black/25 px-4 py-24 sm:px-6 lg:px-8"
      aria-labelledby="before-after-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
      />
      <div className="mx-auto max-w-5xl">
        <div
          ref={headingRevealRef}
          className="scroll-reveal-heading mb-6 text-center sm:mb-8"
        >
          <h2
            id="before-after-heading"
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            See{" "}
            <span className="text-[#f59e0b]">The Magic</span> Yourself
          </h2>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">
            Drag slider to see transformation
          </p>
        </div>

        <div className="space-y-8">
          <div
            ref={containerRef}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(splitPct)}
            aria-label="Before and after comparison — raw product photo vs AI luxury ad"
            tabIndex={0}
            className="glass-panel relative mx-auto aspect-[16/10] w-full max-w-4xl cursor-ew-resize touch-none overflow-hidden rounded-2xl border border-white/[0.12] bg-black shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] outline-none ring-offset-2 ring-offset-midnight focus-visible:ring-2 focus-visible:ring-electric"
            onPointerDown={onPointerDownTrack}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft")
                setSplitPct((p) => Math.max(0, p - 3));
              if (e.key === "ArrowRight")
                setSplitPct((p) => Math.min(100, p + 3));
            }}
          >
            <div className="absolute inset-0 z-[1]">
              <DemoAdFill
                key={afterSrc}
                src={afterSrc}
                alt={`AI generated ${preset.label} luxury skincare advertisement`}
                sizes={SLIDER_SIZES}
                className="h-full w-full"
                priority
              />
            </div>
            <div className="pointer-events-none absolute right-4 top-3 z-[2] max-w-[min(92%,18rem)] text-right sm:right-5 sm:top-4">
              <span className="inline-block rounded-md border border-white/15 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase leading-tight tracking-[0.12em] text-zinc-100 backdrop-blur-md sm:text-[10px] sm:tracking-[0.16em]">
                After — AI Generated Luxury Ad
              </span>
            </div>

            <div
              className="absolute inset-0 z-[3]"
              style={{ clipPath: `inset(0 ${clipRight} 0 0)` }}
            >
              <DemoBeforePanel
                sizes={SLIDER_SIZES}
                label="Before — Plain Mobile Photo"
                className="h-full w-full"
              />
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 z-[4] w-0"
              style={{ left: `${splitPct}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/70 to-transparent shadow-[0_0_12px_rgba(124,58,237,0.8)]" />
              <div className="pointer-events-auto absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-b from-[#7c3aed] to-violet-800 shadow-[0_0_0_4px_rgba(124,58,237,0.35),0_0_28px_rgba(124,58,237,0.55)] sm:h-14 sm:w-14">
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                  aria-hidden
                >
                  <path d="M13 8L8 13l5 5M11 8l5 5-5 5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {DEMO_PRESETS.map((p) => {
              const active = presetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Preview ${p.label} style`}
                  onClick={() => setPresetId(p.id)}
                  className={`group relative overflow-hidden rounded-xl border bg-white/[0.04] px-4 py-4 text-left transition duration-300 hover:border-gold/60 hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active
                      ? "border-gold/50 shadow-[0_0_20px_-6px_rgba(245,158,11,0.35)]"
                      : "border-white/10"
                  }`}
                >
                  <div
                    className="mb-3 flex min-h-[120px] w-full overflow-hidden rounded-lg border border-white/10"
                    aria-hidden
                  >
                    <DemoBeforePanel
                      sizes={THUMB_SIZES}
                      className="relative min-h-[120px] w-1/2 flex-1"
                    />
                    <DemoAdFill
                      src={p.adSrc}
                      alt={`${p.label} ad preview`}
                      sizes={THUMB_SIZES}
                      className="relative min-h-[120px] w-1/2 flex-1"
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors group-hover:text-gold ${
                      active ? "text-gold" : "text-zinc-200"
                    }`}
                  >
                    {p.label}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    Tap to preview treatment
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
