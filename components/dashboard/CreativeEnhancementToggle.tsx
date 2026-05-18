"use client";

type CreativeEnhancementToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function CreativeEnhancementToggle({
  enabled,
  onChange,
  disabled = false,
}: CreativeEnhancementToggleProps) {
  return (
    <section
      className={`dash-enhancement-panel rounded-2xl border p-4 transition-all duration-300 ${
        enabled
          ? "border-electric/35 bg-electric/[0.08] shadow-[0_0_32px_-12px_rgba(124,58,237,0.45)]"
          : "border-white/[0.1] bg-white/[0.03]"
      }`}
      aria-label="AI Creative Enhancement Mode"
    >
      <label className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
          <input
            type="checkbox"
            className="dash-enhancement-switch peer sr-only"
            checked={enabled}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span
            className="absolute inset-0 rounded-full border border-white/15 bg-black/50 transition-colors duration-300 peer-checked:border-electric/50 peer-checked:bg-electric/40 peer-focus-visible:ring-2 peer-focus-visible:ring-electric/50 peer-disabled:opacity-40"
            aria-hidden
          />
          <span
            className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-zinc-300 shadow-md transition-transform duration-300 peer-checked:translate-x-5 peer-checked:bg-white"
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">
            ✨ AI Creative Enhancement Mode
          </span>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-zinc-500">
            Automatically analyzes product physics to inject hyper-realistic studio shadows
            &amp; reflections.
          </span>
        </span>
      </label>
    </section>
  );
}
