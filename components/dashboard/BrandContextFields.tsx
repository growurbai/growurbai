"use client";

type BrandContextFieldsProps = {
  brandName: string;
  coreHook: string;
  onBrandNameChange: (value: string) => void;
  onCoreHookChange: (value: string) => void;
  disabled?: boolean;
};

export function BrandContextFields({
  brandName,
  coreHook,
  onBrandNameChange,
  onCoreHookChange,
  disabled = false,
}: BrandContextFieldsProps) {
  return (
    <section className="space-y-4" aria-label="Brand context">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Brand context
        </p>
        <p className="mt-1 text-sm font-medium text-zinc-400">
          Optional — sharpens headlines & offer callouts
        </p>
      </div>

      <div className="dash-float-field">
        <input
          id="dash-brand-name"
          type="text"
          value={brandName}
          disabled={disabled}
          onChange={(e) => onBrandNameChange(e.target.value)}
          placeholder=" "
          className="dash-float-input peer"
          autoComplete="organization"
        />
        <label htmlFor="dash-brand-name" className="dash-float-label">
          Brand Name
        </label>
        <span className="dash-float-hint">e.g., GrowUrb Cosmetics</span>
      </div>

      <div className="dash-float-field">
        <input
          id="dash-core-hook"
          type="text"
          value={coreHook}
          disabled={disabled}
          onChange={(e) => onCoreHookChange(e.target.value)}
          placeholder=" "
          className="dash-float-input peer"
        />
        <label htmlFor="dash-core-hook" className="dash-float-label">
          Core Hook / Offer
        </label>
        <span className="dash-float-hint">e.g., 20% off / Launch Deal</span>
      </div>
    </section>
  );
}
