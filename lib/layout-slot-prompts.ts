import type { GenerateAspectRatio } from "@/lib/aspect-ratio";

export type LayoutSlotIndex = 0 | 1 | 2 | 3;

export const LAYOUT_SLOT_INDICES: readonly LayoutSlotIndex[] = [0, 1, 2, 3];

export type CategoryKey =
  | "Skincare"
  | "Electronics"
  | "Fashion"
  | "Jewelry"
  | "Food"
  | "Automotive"
  | "Default";

export type VisionAnalysisForPrompt = {
  productType: string;
  detectedCategory: CategoryKey;
  mood: string;
  colors: string[];
};

export type AutoStylePresetForPrompt = {
  label: string;
  modifier: string;
};

/** Mandatory foreground isolation — injected into every layout image prompt. */
export const BACKGROUND_REMOVAL_DIRECTIVE = [
  "BACKGROUND REMOVAL & FOREGROUND ISOLATION (critical):",
  "Treat the uploaded product snapshot as a locked foreground layer.",
  "Replace ONLY the backdrop and environmental lighting — never repaint, crop, or distort the product silhouette.",
  "Preserve 100% of original packaging geometry, logo, label text, cap, lid, and material finish.",
  "No halos, green-screen fringing, jagged mask edges, double edges, or color bleed from the old background.",
  "Feather blend width must be sub-pixel clean; contact shadows must attach to the product base naturally.",
].join(" ");

export const PREMIUM_RENDER_SUFFIX =
  ", ultra-realistic commercial product photography, seamless blend between product and scene, preserve exact product geometry logo and label text, agency-grade contact shadows and reflections, hyper-detailed textures, depth of field with 85mm lens bokeh, high-end global brand advertisement finish, shot on Hasselblad 100MP medium format, ultra-sharp 8K-ready micro-detail, cinematic print quality, ray-traced reflections, zero compression artifacts, pristine edge definition.";

export const AI_ENHANCEMENT_PROMPT_SUFFIX =
  "apply hyper-realistic ray-traced ambient occlusion studio shadows, pristine physics-based light reflections, and extreme macro commercial photography details.";

const SLOT_AESTHETIC: Record<LayoutSlotIndex, string> = {
  0: "LAYOUT 1 — HEROIC STUDIO: Centered heroic product shot, symmetrical premium framing, heavy ambient occlusion studio shadows under the product, grounded contact shadow, flagship catalog hero energy.",
  1: "LAYOUT 2 — DYNAMIC FLOAT: Dynamic diagonal or subtly floating product arrangement, soft bokeh background depth, cinematic off-center composition, aspirational negative space.",
  2: "LAYOUT 3 — MINIMAL RETAIL: Minimalist premium retail display setup, crisp key lighting, raw honest surface textures, clean shelf-ready presentation, generous neutral negative space.",
  3: "LAYOUT 4 — EDITORIAL COMMERCIAL: High-end editorial commercial magazine backdrop, global illumination, refined color grading, Vogue-level campaign polish and depth.",
};

/** Per-category scene fragments — index aligns 1:1 with layout slots 0–3. */
export const CATEGORY_LAYOUT_SCENES: Record<CategoryKey, [string, string, string, string]> = {
  Skincare: [
    "premium bathroom counter with soft window light, subtle steam, spa tiles, centered hero placement",
    "lush green nature bokeh with dewy leaves, product on diagonal floating pedestal, dreamy outdoor daylight",
    "ultra-clean white minimal studio seamless, crisp retail shelf lighting, raw honest textures",
    "dark moody spa editorial set with emerald tones, gold rim light, magazine commercial global illumination",
  ],
  Electronics: [
    "dark high-end tech studio, centered hero product, dramatic rim light, heavy AO shadows on matte surface",
    "neon futuristic set with diagonal composition, floating product angle, soft magenta-cyan bokeh depth",
    "minimal white infinity retail display, crisp specular highlights, clean flagship launch presentation",
    "premium showcase editorial backdrop, glossy reflections, global illumination, commercial tech magazine mood",
  ],
  Fashion: [
    "bright fashion cyclorama, centered heroic garment/product presentation, soft even studio shadows",
    "urban street editorial with diagonal framing, floating lifestyle energy, golden-hour bokeh background",
    "minimal white retail rail/display aesthetic, crisp textures, clean premium apparel presentation",
    "luxury magazine editorial set, rich fabrics in background blur, global illumination, high-fashion commercial grade",
  ],
  Jewelry: [
    "deep velvet pedestal, centered spotlight hero shot, heavy contact shadow, luxury jewelry campaign",
    "white marble surface, diagonal floating arrangement, soft bokeh sparkle, romantic premium depth",
    "minimal neutral gradient retail display, crisp reflections, clean high-key presentation",
    "golden hour editorial glow, magazine commercial backdrop, global illumination, shallow depth of field",
  ],
  Food: [
    "bright fresh kitchen counter, centered hero food styling, natural morning light, grounded shadow",
    "rustic table diagonal composition, soft bokeh ingredients in background, appetizing depth",
    "minimal white surface retail-ready presentation, crisp overhead key light, honest food textures",
    "editorial restaurant mood, warm global illumination, commercial food magazine styling",
  ],
  Automotive: [
    "premium showroom floor, centered heroic vehicle/product framing, dramatic spotlights, AO shadows",
    "mountain road vista with diagonal dynamic framing, soft atmospheric bokeh, cinematic motion energy",
    "white infinity studio retail display, crisp reflections, clean automotive hero presentation",
    "rainy city night editorial backdrop, wet pavement reflections, global illumination, commercial automotive mood",
  ],
  Default: [
    "elegant marble studio, centered heroic still life, soft directional light, grounded AO shadow",
    "nature bokeh with diagonal product placement, warm sunlight, dreamy floating depth",
    "strict minimalist neutral retail set, crisp even lighting, raw surface textures",
    "luxury dark editorial interior, gold rim light, global illumination, magazine commercial finish",
  ],
};

export function getLayoutSceneForSlot(
  category: CategoryKey,
  slotIndex: LayoutSlotIndex,
): string {
  return CATEGORY_LAYOUT_SCENES[category][slotIndex];
}

export function buildLayoutSlotPrompt(params: {
  slotIndex: LayoutSlotIndex;
  category: CategoryKey;
  analysis: VisionAnalysisForPrompt;
  preset: AutoStylePresetForPrompt;
  aiEnhancementMode: boolean;
}): string {
  const { slotIndex, category, analysis, preset, aiEnhancementMode } = params;
  const scene = getLayoutSceneForSlot(category, slotIndex);
  const palette = analysis.colors.length > 0 ? analysis.colors.join(", ") : "packaging-accurate";

  const parts = [
    BACKGROUND_REMOVAL_DIRECTIVE,
    SLOT_AESTHETIC[slotIndex],
    `Place this EXACT product in: ${scene}.`,
    `Detected product: ${analysis.productType} (${category}). Mood: ${analysis.mood}. Palette cues: ${palette}.`,
    `AUTO-SELECTED AGENCY PRESET — ${preset.label}: ${preset.modifier}`,
    "Only generate/replace the environment around the unchanged hero product; match scene lighting to the product.",
    PREMIUM_RENDER_SUFFIX.trim(),
  ];

  if (aiEnhancementMode) {
    parts.push(AI_ENHANCEMENT_PROMPT_SUFFIX);
    if (slotIndex === 0) {
      parts.push(
        "Emphasize heavy ambient occlusion studio shadows and micro-contrast on the product base.",
      );
    }
    if (slotIndex === 3) {
      parts.push("Emphasize global illumination, light wrap, and editorial commercial polish.");
    }
  }

  return parts.join(" ");
}

/** Layout slot metadata returned to clients (optional debug). */
export const LAYOUT_SLOT_LABELS: Record<LayoutSlotIndex, string> = {
  0: "Heroic Studio",
  1: "Dynamic Float",
  2: "Minimal Retail",
  3: "Editorial Commercial",
};

export type LayoutSlotMeta = {
  index: LayoutSlotIndex;
  label: string;
  ratio: GenerateAspectRatio;
};
