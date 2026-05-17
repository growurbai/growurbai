/** Aspect ratios supported by POST /api/generate */
export type GenerateAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export const DEFAULT_ASPECT_RATIO: GenerateAspectRatio = "1:1";

/** CSS aspect-ratio values — used inline so layout never depends on Tailwind purge. */
export const ASPECT_RATIO_CSS: Record<GenerateAspectRatio, string> = {
  "1:1": "1 / 1",
  "4:5": "4 / 5",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

/**
 * Tailwind aspect utilities — must appear as string literals in scanned files
 * (see `LayoutOutputSlot.tsx` and `tailwind.config.ts` safelist).
 */
export const LAYOUT_ASPECT_TAILWIND: Record<GenerateAspectRatio, string> = {
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-[16/9]",
};

export function getLayoutAspectStyle(ratio: GenerateAspectRatio): { aspectRatio: string } {
  return { aspectRatio: ASPECT_RATIO_CSS[ratio] };
}

/** Padding-top % for width:height — guarantees in-flow height (never collapses). */
export const LAYOUT_PADDING_TOP_PERCENT: Record<GenerateAspectRatio, string> = {
  "1:1": "100%",
  "4:5": "125%",
  "9:16": "177.777777%",
  "16:9": "56.25%",
};

/** Explicit switch so Tailwind always sees full class literals. */
export function getLayoutAspectTailwindClass(ratio: GenerateAspectRatio): string {
  switch (ratio) {
    case "4:5":
      return "aspect-[4/5]";
    case "9:16":
      return "aspect-[9/16]";
    case "16:9":
      return "aspect-[16/9]";
    default:
      return "aspect-square";
  }
}

export type AspectRatioOption = {
  id: GenerateAspectRatio;
  label: string;
  subtitle: string;
  /** Tailwind aspect-* utility for preview cards */
  aspectClass: string;
};

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    id: "1:1",
    label: "Square",
    subtitle: "Amazon, Flipkart, Meesho & carousel ads",
    aspectClass: LAYOUT_ASPECT_TAILWIND["1:1"],
  },
  {
    id: "4:5",
    label: "Portrait",
    subtitle: "Instagram & Meta feed ads",
    aspectClass: LAYOUT_ASPECT_TAILWIND["4:5"],
  },
  {
    id: "9:16",
    label: "Vertical",
    subtitle: "Reels, Shorts & story ads",
    aspectClass: LAYOUT_ASPECT_TAILWIND["9:16"],
  },
  {
    id: "16:9",
    label: "Landscape",
    subtitle: "Website hero banners",
    aspectClass: LAYOUT_ASPECT_TAILWIND["16:9"],
  },
];

export function parseAspectRatio(input: unknown): GenerateAspectRatio {
  if (input === "4:5" || input === "9:16" || input === "16:9" || input === "1:1") {
    return input;
  }
  return DEFAULT_ASPECT_RATIO;
}

/** Pixel dimensions with longest edge capped at `maxEdge` (keeps payloads reasonable in mock). */
export function getOutputDimensions(
  ratio: GenerateAspectRatio,
  maxEdge = 1024,
): { width: number; height: number } {
  switch (ratio) {
    case "4:5":
      return { width: Math.round(maxEdge * (4 / 5)), height: maxEdge };
    case "9:16":
      return { width: Math.round(maxEdge * (9 / 16)), height: maxEdge };
    case "16:9":
      return { width: maxEdge, height: Math.round(maxEdge * (9 / 16)) };
    default:
      return { width: maxEdge, height: maxEdge };
  }
}

export function openAiImageSizeForRatio(ratio: GenerateAspectRatio): string {
  switch (ratio) {
    case "4:5":
      return "1024x1536";
    case "9:16":
      return "1024x1536";
    case "16:9":
      return "1536x1024";
    default:
      return "1024x1024";
  }
}
