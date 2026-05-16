"use client";

import { useEffect, useRef, useState } from "react";

const IO_OPTS: IntersectionObserverInit = {
  threshold: 0.22,
  rootMargin: "0px 0px -4% 0px",
};

const STATS = ["500+ Generations", "4 Ad Layouts", "$ Pricing"] as const;

export function HeroStatsAnimated() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, IO_OPTS);

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="mt-14 grid grid-cols-3 gap-3 sm:mt-16 sm:max-w-2xl sm:gap-6"
    >
      {STATS.map((line, i) => (
        <div
          key={line}
          className={`rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3 backdrop-blur transition-[opacity,transform] duration-700 sm:px-4 sm:py-4 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: visible ? `${i * 90}ms` : "0ms" }}
        >
          <p className="text-center text-[11px] font-semibold leading-snug text-white sm:text-sm md:text-base">
            {line}
          </p>
        </div>
      ))}
    </div>
  );
}
