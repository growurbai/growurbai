/** Raw product photo — cactus + Curology tube (Image D) */
export const DEMO_BEFORE_SRC = "/demo/before.jpg";

/** AI-generated luxury ad images (replace files in /public/demo/ anytime) */
export const DEMO_AD_MARBLE_SRC = "/demo/marble-ad.png";
export const DEMO_AD_NATURE_SRC = "/demo/nature-ad.png";
export const DEMO_AD_MINIMAL_SRC = "/demo/minimal-ad.png";

export const DEMO_BRAND = "LUMIÈRE SKIN";
export const DEMO_TAGLINE = "Glow That Feels Like Silk";

export type DemoPresetId = "marble" | "nature" | "minimal";

export const DEMO_PRESETS: {
  id: DemoPresetId;
  label: string;
  adSrc: string;
}[] = [
  { id: "marble", label: "Marble Studio", adSrc: DEMO_AD_MARBLE_SRC },
  { id: "nature", label: "Nature Bokeh", adSrc: DEMO_AD_NATURE_SRC },
  { id: "minimal", label: "Minimalist", adSrc: DEMO_AD_MINIMAL_SRC },
];

export function getDemoAdSrc(presetId: DemoPresetId): string {
  return DEMO_PRESETS.find((p) => p.id === presetId)?.adSrc ?? DEMO_AD_MARBLE_SRC;
}
