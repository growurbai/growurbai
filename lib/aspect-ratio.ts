/** Aspect ratios supported by POST /api/generate */
export type GenerateAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export const DEFAULT_ASPECT_RATIO: GenerateAspectRatio = "1:1";

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
    aspectClass: "aspect-square",
  },
  {
    id: "4:5",
    label: "Portrait",
    subtitle: "Instagram & Meta feed ads",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "9:16",
    label: "Vertical",
    subtitle: "Reels, Shorts & story ads",
    aspectClass: "aspect-[9/16]",
  },
  {
    id: "16:9",
    label: "Landscape",
    subtitle: "Website hero banners",
    aspectClass: "aspect-video",
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
