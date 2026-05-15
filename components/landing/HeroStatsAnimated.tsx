"use client";

import { useEffect, useRef, useState } from "react";

const IO_OPTS: IntersectionObserverInit = {
  threshold: 0.22,
  rootMargin: "0px 0px -4% 0px",
};

export function HeroStatsAnimated() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const played = useRef(false);

  const [seconds, setSeconds] = useState(60);
  const [layouts, setLayouts] = useState(4);
  const [showInr, setShowInr] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || played.current) return;
      played.current = true;
      io.disconnect();

      setSeconds(1);
      setLayouts(1);
      setShowInr(false);

      const durationMs = 1200;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const ease = 1 - (1 - t) ** 3;
        setSeconds(Math.max(1, Math.round(ease * 60)));
        setLayouts(Math.max(1, Math.round(ease * 4)));
        if (t >= 0.72) setShowInr(true);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setSeconds(60);
          setLayouts(4);
          setShowInr(true);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, IO_OPTS);

    io.observe(el);
    return () => {
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="mt-14 grid grid-cols-3 gap-4 sm:mt-16 sm:max-w-lg sm:gap-8"
    >
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 backdrop-blur sm:px-4">
        <p className="text-lg font-semibold tabular-nums text-white sm:text-xl">
          <span className="opacity-90">&lt;</span>
          {seconds}
          <span className="opacity-90">s</span>
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500 sm:text-[11px]">
          Avg. turnaround
        </p>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 backdrop-blur sm:px-4">
        <p className="text-lg font-semibold tabular-nums text-white sm:text-xl">
          {layouts} layouts
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500 sm:text-[11px]">
          Creatives / gen
        </p>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 backdrop-blur sm:px-4">
        <p
          className={`text-lg font-semibold tabular-nums text-white transition-opacity duration-500 sm:text-xl ${
            showInr ? "opacity-100" : "opacity-0"
          }`}
        >
          INR ₹
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500 sm:text-[11px]">
          Made for India
        </p>
      </div>
    </div>
  );
}
