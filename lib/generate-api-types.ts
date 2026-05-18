import type { GenerateAspectRatio } from "@/lib/aspect-ratio";
import type { CopyLanguageId } from "@/lib/copy-languages";

export type LuxuryStyleFamily = "studio" | "organic" | "marble" | "cyberpunk";

/** Human-readable auto preset label returned to the client. */
export type AutoAdStylePresetLabel =
  | "Studio Elite"
  | "Organic Eco"
  | "Luxury Marble"
  | "Cyber Tech";

/** Response shape from POST /api/generate */
export type GenerateAdCopy = {
  facebookAd: string;
  instagramCaption: string;
  googleAd: string;
  pdpBullets: string;
};

export type GenerateSuccessResponse = {
  /** Backward-compatible single image string (raw base64, no data URL prefix). */
  removedBgImage: string;
  /** Four PNGs (base64): Marble Studio, Nature Bokeh, Minimalist, Luxury Dark. */
  layoutImages: [string, string, string, string];
  adCopy: GenerateAdCopy;
  /** Normalized product vertical used for backgrounds, headlines, and copy rules. */
  detectedCategory: string;
  /** GPT-4o vision narrative: category, brand, colors, mood, audience. */
  productAnalysis?: string;
  /** Aspect ratio used for this generation run. */
  ratio?: GenerateAspectRatio;
  /** AI-selected luxury style family injected into image prompts. */
  autoStyleFamily?: LuxuryStyleFamily;
  /** Display name of the autonomous preset (e.g. Organic Eco). */
  autoStylePresetLabel?: AutoAdStylePresetLabel;
  /** Language used for ad copy generation. */
  copyLanguage?: CopyLanguageId;
  /** Whether AI creative enhancement was applied to image prompts. */
  aiEnhancementMode?: boolean;
  /** True when response used local mock gradients instead of live OpenAI images. */
  mockMode?: boolean;
  /** Remaining generation credits after this run (1 credit consumed on success). */
  updatedCredits?: number;
};

export type GenerateErrorStatus =
  | "RATE_LIMIT_EXCEEDED"
  | "INSUFFICIENT_CREDITS"
  | "INVALID_IMAGE"
  | "IMAGE_SIZE_INVALID"
  | "CONFIG_ERROR"
  | "GENERATION_FAILED";

export type GenerateErrorResponse = {
  error: true;
  status: GenerateErrorStatus;
  message: string;
};
