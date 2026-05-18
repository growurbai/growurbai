"use client";

import {
  BRAND_NAME_MAX_LENGTH,
  CORE_HOOK_MAX_LENGTH,
  clampBrandName,
  clampCoreHook,
} from "@/lib/brand-context-limits";

type BrandContextFieldsProps = {
  brandName: string;
  coreHook: string;
  onBrandNameChange: (value: string) => void;
  onCoreHookChange: (value: string) => void;
  disabled?: boolean;
};

function CharCounter({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const atLimit = current >= max;
  return (
    <span
      className={`dash-float-counter tabular-nums ${atLimit ? "dash-float-counter--at-limit" : ""}`}
      aria-live="polite"
    >
      {current}/{max}
    </span>
  );
}

export function BrandContextFields({
  brandName,
  coreHook,
  onBrandNameChange,
  onCoreHookChange,
  disabled = false,
}: BrandContextFieldsProps) {
  return (
    <section className="space-y-3" aria-label="Brand context">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Brand context
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-white">
          Name &amp; offer
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
          Optional — sharpens headlines &amp; offer callouts
        </p>
      </div>

      <div className="dash-float-field">
        <input
          id="dash-brand-name"
          type="text"
          value={brandName}
          disabled={disabled}
          maxLength={BRAND_NAME_MAX_LENGTH}
          onChange={(e) => onBrandNameChange(clampBrandName(e.target.value))}
          placeholder=" "
          className="dash-float-input dash-float-input--with-counter peer"
          autoComplete="organization"
          aria-describedby="dash-brand-name-hint dash-brand-name-count"
        />
        <label htmlFor="dash-brand-name" className="dash-float-label">
          Brand Name
        </label>
        <span className="dash-float-counter-infield" id="dash-brand-name-count">
          <CharCounter current={brandName.length} max={BRAND_NAME_MAX_LENGTH} />
        </span>
        <div className="dash-float-field-footer">
          <span id="dash-brand-name-hint" className="dash-float-hint">
            e.g., GrowUrb Cosmetics
          </span>
        </div>
      </div>

      <div className="dash-float-field">
        <input
          id="dash-core-hook"
          type="text"
          value={coreHook}
          disabled={disabled}
          maxLength={CORE_HOOK_MAX_LENGTH}
          onChange={(e) => onCoreHookChange(clampCoreHook(e.target.value))}
          placeholder=" "
          className="dash-float-input dash-float-input--with-counter peer"
          aria-describedby="dash-core-hook-hint dash-core-hook-count"
        />
        <label htmlFor="dash-core-hook" className="dash-float-label">
          Core Hook / Offer
        </label>
        <span className="dash-float-counter-infield" id="dash-core-hook-count">
          <CharCounter current={coreHook.length} max={CORE_HOOK_MAX_LENGTH} />
        </span>
        <div className="dash-float-field-footer">
          <span id="dash-core-hook-hint" className="dash-float-hint">
            e.g., 20% off / Launch Deal
          </span>
        </div>
      </div>
    </section>
  );
}
