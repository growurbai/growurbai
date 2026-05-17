"use client";

import {
  ASPECT_RATIO_OPTIONS,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";

type AspectRatioPickerProps = {
  selectedRatio: GenerateAspectRatio;
  onChange: (ratio: GenerateAspectRatio) => void;
  disabled?: boolean;
};

function RatioIcon({ ratio }: { ratio: GenerateAspectRatio }) {
  const frame =
    ratio === "1:1"
      ? "h-5 w-5"
      : ratio === "4:5"
        ? "h-5 w-4"
        : ratio === "9:16"
          ? "h-5 w-[11px]"
          : "h-3 w-5";
  return (
    <span
      aria-hidden
      className={`${frame} shrink-0 rounded-[3px] border border-current opacity-80`}
    />
  );
}

export function AspectRatioPicker({
  selectedRatio,
  onChange,
  disabled = false,
}: AspectRatioPickerProps) {
  return (
    <section className="space-y-3" aria-label="Output aspect ratio">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Export format
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-white">
          Aspect ratio
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
          AI styles each layout for your channel—pick the frame your campaign needs.
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-1 xl:grid-cols-2"
        role="radiogroup"
        aria-label="Select aspect ratio"
      >
        {ASPECT_RATIO_OPTIONS.map((opt) => {
          const active = selectedRatio === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`group relative flex w-full flex-col gap-2 rounded-xl border px-3.5 py-3 text-left transition duration-200 ${
                active
                  ? "border-electric/60 bg-electric/[0.12] shadow-[0_0_28px_-12px_rgba(124,58,237,0.55)]"
                  : "border-white/[0.1] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              } disabled:pointer-events-none disabled:opacity-40`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      active
                        ? "border-electric/40 bg-electric/20 text-violet-200"
                        : "border-white/[0.08] bg-black/30 text-zinc-400"
                    }`}
                  >
                    <RatioIcon ratio={opt.id} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {opt.label}
                      <span className="ml-1.5 text-[11px] font-medium tabular-nums text-zinc-500">
                        {opt.id}
                      </span>
                    </span>
                  </span>
                </span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full transition ${
                    active ? "bg-electric shadow-[0_0_8px_rgba(124,58,237,0.8)]" : "bg-zinc-600"
                  }`}
                />
              </span>
              <span className="text-[11px] leading-snug text-zinc-500 group-hover:text-zinc-400">
                Best for {opt.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
