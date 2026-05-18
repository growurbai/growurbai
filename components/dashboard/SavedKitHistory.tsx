"use client";

type HistoryPlaceholder = {
  id: string;
  label: string;
  gradient: string;
};

const PLACEHOLDER_KITS: HistoryPlaceholder[] = [
  {
    id: "kit-1",
    label: "Skincare serum",
    gradient:
      "linear-gradient(145deg, #1a1028 0%, #4c1d95 42%, #7c3aed 78%, #c4b5fd 100%)",
  },
  {
    id: "kit-2",
    label: "Gold jewelry",
    gradient:
      "linear-gradient(145deg, #0f0a06 0%, #78350f 38%, #f59e0b 72%, #fde68a 100%)",
  },
  {
    id: "kit-3",
    label: "Streetwear drop",
    gradient:
      "linear-gradient(145deg, #050810 0%, #1e3a5f 40%, #312e81 70%, #818cf8 100%)",
  },
  {
    id: "kit-4",
    label: "Organic tea",
    gradient:
      "linear-gradient(145deg, #061208 0%, #14532d 45%, #22c55e 75%, #bbf7d0 100%)",
  },
];

type SavedKitHistoryProps = {
  onSelect?: (id: string) => void;
};

export function SavedKitHistory({ onSelect }: SavedKitHistoryProps) {
  return (
    <section className="saved-kit-history" aria-label="Saved Kit History">
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Archive
        </p>
        <h3 className="mt-1 text-sm font-semibold tracking-tight text-white">
          Saved Kit History
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
          Quick reload from your last premium renders.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {PLACEHOLDER_KITS.map((kit) => (
          <button
            key={kit.id}
            type="button"
            className="saved-kit-thumb group/hist relative aspect-square h-16 w-16 shrink-0 rounded-lg border border-white/10 bg-white/5 p-1 transition-all duration-300 hover:border-electric/40 hover:bg-white/[0.08] hover:shadow-[0_0_20px_-6px_rgba(124,58,237,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
            onClick={() => onSelect?.(kit.id)}
            aria-label={`Quick view ${kit.label}`}
            title={kit.label}
          >
            <span
              className="block h-full w-full overflow-hidden rounded-md"
              style={{ background: kit.gradient }}
              aria-hidden
            />
            <span className="saved-kit-thumb-overlay pointer-events-none absolute inset-1 flex items-center justify-center rounded-md bg-black/55 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/hist:opacity-100 group-focus-visible/hist:opacity-100">
              <span className="text-base" aria-hidden>
                🔍
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
