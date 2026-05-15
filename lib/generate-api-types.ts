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
};
