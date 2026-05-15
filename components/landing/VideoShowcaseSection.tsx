"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VIDEO_SRC = "https://www.w3schools.com/html/mov_bbb.mp4";

const HIGHLIGHTS = [
  "⚡ Real-time Processing",
  "🎨 4 Luxury Backgrounds",
  "✍️ AI Ad Copy Included",
] as const;

export function VideoShowcaseSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        setPaused(true);
      }
    };

    void tryPlay();

    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlayback = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }, []);

  return (
    <section
      className="relative scroll-mt-24 border-t border-white/[0.06] bg-black/30 px-4 py-24 sm:px-6 lg:px-8"
      aria-labelledby="video-showcase-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/30 to-transparent"
      />

      <div className="mx-auto max-w-5xl">
        <h2
          id="video-showcase-heading"
          className="mb-12 text-center text-3xl font-semibold tracking-tight text-white sm:mb-14 sm:text-4xl"
        >
          Watch The{" "}
          <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
            Magic
          </span>{" "}
          Happen
        </h2>

        <div className="transition-transform duration-500 ease-out hover:scale-[1.015] sm:hover:scale-[1.02]">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.14] bg-white/[0.05] p-1 shadow-[0_0_0_1px_rgba(124,58,237,0.12),0_0_48px_-12px_rgba(124,58,237,0.42),0_24px_64px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl ring-1 ring-white/[0.08]">
            <div className="relative aspect-video overflow-hidden rounded-[1.35rem] bg-black">
              <video
                ref={videoRef}
                className="h-full w-full cursor-pointer object-cover"
                src={VIDEO_SRC}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                onClick={togglePlayback}
              />

              {/* Purple–gold vignette overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_50%,transparent_35%,rgba(124,58,237,0.22)_100%),linear-gradient(160deg,rgba(124,58,237,0.35)_0%,transparent_42%,transparent_58%,rgba(245,158,11,0.12)_100%)]"
              />

              <div className="pointer-events-none absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
                <span className="rounded-lg border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-100 backdrop-blur-md sm:text-[11px]">
                  60 Second Transformation
                </span>
              </div>

              <div className="pointer-events-none absolute bottom-4 right-4 z-10 sm:bottom-5 sm:right-5">
                <span className="rounded-lg border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-xs tabular-nums text-white backdrop-blur-md">
                  0:60
                </span>
              </div>

              <div
                className={`absolute inset-0 z-[5] flex items-center justify-center transition-opacity duration-300 ${
                  paused ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                  }}
                  aria-label={paused ? "Play video" : "Pause video"}
                  className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-gradient-to-b from-electric to-violet-700 text-white shadow-[0_0_0_6px_rgba(124,58,237,0.35),0_0_52px_rgba(124,58,237,0.55),0_0_96px_rgba(245,158,11,0.15)] transition hover:brightness-110 active:scale-95 sm:h-[5.25rem] sm:w-[5.25rem]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-1 h-10 w-10 fill-current sm:h-11 sm:w-11"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:mt-12 sm:gap-4">
          {HIGHLIGHTS.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:text-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
